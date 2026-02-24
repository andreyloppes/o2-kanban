import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// GET /api/tasks/[taskId]/dependencies — List dependencies
export async function GET(request, { params }) {
  const { taskId } = await params;
  const supabase = await createServerClient();

  // Get tasks this task blocks (I block them)
  const { data: blocks, error: blocksError } = await supabase
    .from('task_dependencies')
    .select('id, blocked_task_id, blocked_task:tasks!task_dependencies_blocked_task_id_fkey(id, title, type, priority)')
    .eq('blocker_task_id', taskId);

  // Get tasks that block this task (they block me)
  const { data: blockedBy, error: blockedByError } = await supabase
    .from('task_dependencies')
    .select('id, blocker_task_id, blocker_task:tasks!task_dependencies_blocker_task_id_fkey(id, title, type, priority)')
    .eq('blocked_task_id', taskId);

  if (blocksError || blockedByError) {
    return NextResponse.json(
      { error: (blocksError || blockedByError).message },
      { status: 500 }
    );
  }

  return NextResponse.json({ blocks: blocks || [], blocked_by: blockedBy || [] });
}

// POST /api/tasks/[taskId]/dependencies — Add dependency
export async function POST(request, { params }) {
  const { taskId } = await params;
  const supabase = await createServerClient();
  const body = await request.json();

  if (!body.blocked_task_id && !body.blocker_task_id) {
    return NextResponse.json(
      { error: 'blocked_task_id ou blocker_task_id e obrigatorio' },
      { status: 400 }
    );
  }

  const insert = body.blocked_task_id
    ? { blocker_task_id: taskId, blocked_task_id: body.blocked_task_id }
    : { blocker_task_id: body.blocker_task_id, blocked_task_id: taskId };

  // Prevent circular dependency (basic check)
  if (insert.blocker_task_id === insert.blocked_task_id) {
    return NextResponse.json({ error: 'Task nao pode depender de si mesma' }, { status: 400 });
  }

  const { data: dep, error } = await supabase
    .from('task_dependencies')
    .insert(insert)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Dependencia ja existe' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ dependency: dep }, { status: 201 });
}

// DELETE /api/tasks/[taskId]/dependencies — Remove dependency
export async function DELETE(request, { params }) {
  const { taskId } = await params;
  const supabase = await createServerClient();
  const { searchParams } = new URL(request.url);
  const depId = searchParams.get('id');

  if (!depId) {
    return NextResponse.json({ error: 'id e obrigatorio' }, { status: 400 });
  }

  const { error } = await supabase
    .from('task_dependencies')
    .delete()
    .eq('id', depId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
