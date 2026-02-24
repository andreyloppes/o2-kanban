import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

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

  // Allowed bulk update fields
  const allowed = ['priority', 'assignee', 'type', 'column_id', 'sprint_id', 'due_date'];
  const safeUpdates = {};
  for (const key of allowed) {
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

  const { error } = await supabase
    .from('tasks')
    .delete()
    .in('id', task_ids);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, deleted_count: task_ids.length });
}
