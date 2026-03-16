import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { updateTaskSchema } from '@/lib/validators';
import { getAuthUser, checkMembership } from '@/lib/auth';

async function checkTaskPermissionLocal(supabase, taskId) {
  const { data: task } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();
  if (!task) return { allowed: false, task: null, user: null };

  const user = await getAuthUser(supabase);
  if (!user) return { allowed: false, task, user: null };

  const isMember = await checkMembership(supabase, task.board_id, user.id);

  return { allowed: isMember, task, user };
}

export async function GET(request, { params }) {
  const { taskId } = await params;
  const supabase = await createServerClient();

  const { data: task, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (error || !task) {
    return NextResponse.json(
      { error: 'Tarefa nao encontrada' },
      { status: 404 }
    );
  }

  return NextResponse.json({ task });
}

export async function PATCH(request, { params }) {
  const { taskId } = await params;
  const supabase = await createServerClient();

  // Verificar permissao
  const { allowed, task: existingTask, user } = await checkTaskPermissionLocal(supabase, taskId);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Sem permissao para editar esta tarefa' },
      { status: 403 }
    );
  }

  const body = await request.json();

  // Validar com Zod
  const parsed = updateTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { data: task, error } = await supabase
    .from('tasks')
    .update(parsed.data)
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Tarefa nao encontrada' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Activity log (fire-and-forget)
  if (user && task) {
    const changedFields = Object.keys(parsed.data);
    supabase.from('activity_log').insert({
      board_id: task.board_id,
      task_id: task.id,
      user_id: user.id,
      action: 'task_updated',
      metadata: { changed_fields: changedFields, updates: parsed.data },
    }).then(() => {}).catch(() => {});
  }

  // Notification: task assigned to someone new (fire-and-forget)
  if (user && task && parsed.data.assignee && parsed.data.assignee !== existingTask?.assignee) {
    // Find the user_id of the new assignee by slug
    supabase.from('users').select('id').eq('slug', parsed.data.assignee).single()
      .then(({ data: assigneeUser }) => {
        if (assigneeUser && assigneeUser.id !== user.id) {
          supabase.from('notifications').insert({
            user_id: assigneeUser.id,
            board_id: task.board_id,
            task_id: task.id,
            type: 'assigned',
            title: `Voce foi atribuido a tarefa "${task.title}"`,
            body: `Atribuido por ${user.email || 'um membro do board'}`,
          }).then(() => {}).catch(() => {});
        }
      }).catch(() => {});
  }

  return NextResponse.json({ task });
}

export async function DELETE(request, { params }) {
  const { taskId } = await params;
  const supabase = await createServerClient();

  // Verificar permissao
  const { allowed, task: existingTask, user } = await checkTaskPermissionLocal(supabase, taskId);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Sem permissao para deletar esta tarefa' },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Tarefa nao encontrada' }, { status: 404 });
  }

  // Activity log (fire-and-forget)
  if (user && existingTask) {
    supabase.from('activity_log').insert({
      board_id: existingTask.board_id,
      task_id: taskId,
      user_id: user.id,
      action: 'task_deleted',
      metadata: { title: existingTask.title },
    }).then(() => {}).catch(() => {});
  }

  return NextResponse.json({ success: true });
}
