import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { moveTaskSchema } from '@/lib/validators';

export async function PATCH(request, { params }) {
  const { taskId } = await params;
  const supabase = await createServerClient();

  // Verificar permissao
  const { data: task } = await supabase
    .from('tasks')
    .select('board_id')
    .eq('id', taskId)
    .single();

  if (!task) {
    return NextResponse.json({ error: 'Tarefa nao encontrada' }, { status: 404 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: membership } = await supabase
      .from('board_members')
      .select('id')
      .eq('board_id', task.board_id)
      .eq('user_id', user.id)
      .limit(1);
    if (!membership || membership.length === 0) {
      return NextResponse.json(
        { error: 'Sem permissao para mover tarefas neste board' },
        { status: 403 }
      );
    }
  }

  const body = await request.json();

  // Validar com Zod
  const parsed = moveTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { column_id, position } = parsed.data;

  const updateData = { column_id, position };

  const { data: updated, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Activity log (fire-and-forget)
  if (user && updated) {
    supabase.from('activity_log').insert({
      board_id: task.board_id,
      task_id: taskId,
      user_id: user.id,
      action: 'task_moved',
      metadata: { from_column_id: task.board_id, to_column_id: column_id },
    }).then(() => {}).catch(() => {});

    // Notification: if moved to a done column, notify creator
    supabase.from('columns').select('is_done_column').eq('id', column_id).single()
      .then(({ data: col }) => {
        if (col?.is_done_column) {
          // Get the full task to find creator (created by user)
          supabase.from('tasks').select('created_by').eq('id', taskId).single()
            .then(({ data: fullTask }) => {
              if (fullTask?.created_by && fullTask.created_by !== user.id) {
                supabase.from('notifications').insert({
                  user_id: fullTask.created_by,
                  board_id: task.board_id,
                  task_id: taskId,
                  type: 'moved',
                  title: `Tarefa "${updated.title}" foi concluida`,
                  body: `Movida para coluna concluida por ${user.email || 'um membro'}`,
                }).then(() => {}).catch(() => {});
              }
            }).catch(() => {});
        }
      }).catch(() => {});
  }

  return NextResponse.json({ task: updated });
}
