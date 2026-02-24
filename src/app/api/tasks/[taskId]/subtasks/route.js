import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// GET /api/tasks/[taskId]/subtasks — List subtasks
export async function GET(request, { params }) {
  const { taskId } = await params;
  const supabase = await createServerClient();

  const { data: subtasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('parent_task_id', taskId)
    .order('position', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ subtasks });
}

// POST /api/tasks/[taskId]/subtasks — Create subtask
export async function POST(request, { params }) {
  const { taskId } = await params;
  const supabase = await createServerClient();
  const body = await request.json();

  // Get parent task to inherit board_id and column_id
  const { data: parent, error: parentError } = await supabase
    .from('tasks')
    .select('board_id, column_id')
    .eq('id', taskId)
    .single();

  if (parentError || !parent) {
    return NextResponse.json({ error: 'Tarefa pai nao encontrada' }, { status: 404 });
  }

  // Get next position
  const { data: existing } = await supabase
    .from('tasks')
    .select('position')
    .eq('parent_task_id', taskId)
    .order('position', { ascending: false })
    .limit(1);

  const position = existing && existing.length > 0 ? existing[0].position + 1000 : 1000;

  const { data: subtask, error } = await supabase
    .from('tasks')
    .insert({
      board_id: parent.board_id,
      column_id: parent.column_id,
      parent_task_id: taskId,
      title: body.title,
      type: body.type || 'task',
      priority: body.priority || 'medium',
      description: body.description || null,
      assignee: body.assignee || null,
      position,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ subtask }, { status: 201 });
}
