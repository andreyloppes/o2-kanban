import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// PATCH /api/boards/[boardId]/sprints/[sprintId] — Update sprint
export async function PATCH(request, { params }) {
  const { sprintId } = await params;
  const supabase = await createServerClient();
  const body = await request.json();

  const updates = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.goal !== undefined) updates.goal = body.goal;
  if (body.start_date !== undefined) updates.start_date = body.start_date;
  if (body.end_date !== undefined) updates.end_date = body.end_date;
  if (body.status !== undefined) updates.status = body.status;

  const { data: sprint, error } = await supabase
    .from('sprints')
    .update(updates)
    .eq('id', sprintId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sprint });
}

// DELETE /api/boards/[boardId]/sprints/[sprintId] — Delete sprint
export async function DELETE(request, { params }) {
  const { sprintId } = await params;
  const supabase = await createServerClient();

  // Unlink tasks from this sprint first
  await supabase
    .from('tasks')
    .update({ sprint_id: null })
    .eq('sprint_id', sprintId);

  const { error } = await supabase
    .from('sprints')
    .delete()
    .eq('id', sprintId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
