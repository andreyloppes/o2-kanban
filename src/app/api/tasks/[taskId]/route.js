import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { updateTaskSchema } from '@/lib/validators';

async function checkTaskPermission(supabase, taskId) {
  const { data: task } = await supabase
    .from('tasks')
    .select('board_id')
    .eq('id', taskId)
    .single();
  if (!task) return { allowed: false, task: null };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { allowed: true, task }; // mock mode

  const { data: membership } = await supabase
    .from('board_members')
    .select('id')
    .eq('board_id', task.board_id)
    .eq('user_id', user.id)
    .limit(1);

  return { allowed: membership && membership.length > 0, task };
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
  const { allowed } = await checkTaskPermission(supabase, taskId);
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

  return NextResponse.json({ task });
}

export async function DELETE(request, { params }) {
  const { taskId } = await params;
  const supabase = await createServerClient();

  // Verificar permissao
  const { allowed } = await checkTaskPermission(supabase, taskId);
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

  return NextResponse.json({ success: true });
}
