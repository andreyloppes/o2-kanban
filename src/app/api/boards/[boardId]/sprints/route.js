import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// GET /api/boards/[boardId]/sprints — List sprints
export async function GET(request, { params }) {
  const { boardId } = await params;
  const supabase = await createServerClient();

  const { data: sprints, error } = await supabase
    .from('sprints')
    .select('*')
    .eq('board_id', boardId)
    .order('start_date', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get task counts per sprint
  const sprintIds = sprints.map((s) => s.id);
  let taskCounts = {};

  if (sprintIds.length > 0) {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('sprint_id, id')
      .in('sprint_id', sprintIds);

    if (tasks) {
      tasks.forEach((t) => {
        taskCounts[t.sprint_id] = (taskCounts[t.sprint_id] || 0) + 1;
      });
    }
  }

  const sprintsWithCounts = sprints.map((s) => ({
    ...s,
    task_count: taskCounts[s.id] || 0,
  }));

  return NextResponse.json({ sprints: sprintsWithCounts });
}

// POST /api/boards/[boardId]/sprints — Create sprint
export async function POST(request, { params }) {
  const { boardId } = await params;
  const supabase = await createServerClient();
  const body = await request.json();

  if (!body.name || !body.start_date || !body.end_date) {
    return NextResponse.json(
      { error: 'name, start_date e end_date sao obrigatorios' },
      { status: 400 }
    );
  }

  const { data: sprint, error } = await supabase
    .from('sprints')
    .insert({
      board_id: boardId,
      name: body.name,
      goal: body.goal || null,
      start_date: body.start_date,
      end_date: body.end_date,
      status: body.status || 'planned',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sprint }, { status: 201 });
}
