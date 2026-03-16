import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getAuthUser, checkMembership } from '@/lib/auth';

async function verifyBulkPermission(supabase, taskIds, userId) {
  // Fetch all tasks to get their board_ids
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, board_id')
    .in('id', taskIds);

  if (!tasks || tasks.length === 0) {
    return { allowed: false, error: 'Nenhuma tarefa encontrada' };
  }

  // Get unique board_ids
  const boardIds = [...new Set(tasks.map((t) => t.board_id))];

  // Check membership for each board
  for (const boardId of boardIds) {
    const isMember = await checkMembership(supabase, boardId, userId);
    if (!isMember) {
      return { allowed: false, error: 'Sem permissao em um ou mais boards das tarefas selecionadas' };
    }
  }

  return { allowed: true };
}

// PATCH /api/tasks/bulk — Bulk update tasks
export async function PATCH(request) {
  const supabase = await createServerClient();
  const body = await request.json();

  const { task_ids, updates } = body;

  if (!task_ids || !Array.isArray(task_ids) || task_ids.length === 0) {
    return NextResponse.json({ error: 'task_ids e obrigatorio' }, { status: 400 });
  }

  if (task_ids.length > 50) {
    return NextResponse.json({ error: 'Maximo 50 tasks por operacao' }, { status: 400 });
  }

  // Verificar autenticacao
  const user = await getAuthUser(supabase);
  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
  }

  // Verificar permissao em todos os boards
  const { allowed, error: permError } = await verifyBulkPermission(supabase, task_ids, user.id);
  if (!allowed) {
    return NextResponse.json({ error: permError }, { status: 403 });
  }

  // Allowed bulk update fields
  const allowed_fields = ['priority', 'assignee', 'type', 'column_id', 'sprint_id', 'due_date'];
  const safeUpdates = {};
  for (const key of allowed_fields) {
    if (updates[key] !== undefined) {
      safeUpdates[key] = updates[key];
    }
  }

  if (Object.keys(safeUpdates).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo valido para atualizar' }, { status: 400 });
  }

  safeUpdates.updated_at = new Date().toISOString();

  const { data: tasks, error } = await supabase
    .from('tasks')
    .update(safeUpdates)
    .in('id', task_ids)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tasks, updated_count: tasks.length });
}

// DELETE /api/tasks/bulk — Bulk delete tasks
export async function DELETE(request) {
  const supabase = await createServerClient();
  const body = await request.json();

  const { task_ids } = body;

  if (!task_ids || !Array.isArray(task_ids) || task_ids.length === 0) {
    return NextResponse.json({ error: 'task_ids e obrigatorio' }, { status: 400 });
  }

  if (task_ids.length > 50) {
    return NextResponse.json({ error: 'Maximo 50 tasks por operacao' }, { status: 400 });
  }

  // Verificar autenticacao
  const user = await getAuthUser(supabase);
  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
  }

  // Verificar permissao em todos os boards
  const { allowed, error: permError } = await verifyBulkPermission(supabase, task_ids, user.id);
  if (!allowed) {
    return NextResponse.json({ error: permError }, { status: 403 });
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .in('id', task_ids);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, deleted_count: task_ids.length });
}
