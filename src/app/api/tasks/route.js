import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createTaskSchema } from '@/lib/validators';
import { DEFAULT_BOARD_ID, POSITION_GAP } from '@/lib/constants';

export async function GET(request) {
  const supabase = await createServerClient();
  const { searchParams } = new URL(request.url);
  const boardId = searchParams.get('board_id') || DEFAULT_BOARD_ID;

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('board_id', boardId)
    .order('position', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tasks: tasks || [] });
}

export async function POST(request) {
  const supabase = await createServerClient();
  const body = await request.json();

  // Validar com Zod
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { column_id, board_id, title, type, priority, description, assignee, due_date } =
    parsed.data;

  const resolvedBoardId = board_id || DEFAULT_BOARD_ID;

  // Calcular posicao (ultima da coluna + GAP)
  const { data: lastTask } = await supabase
    .from('tasks')
    .select('position')
    .eq('column_id', column_id)
    .order('position', { ascending: false })
    .limit(1)
    .single();

  const position = lastTask ? lastTask.position + POSITION_GAP : POSITION_GAP;

  // Inserir
  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      column_id,
      board_id: resolvedBoardId,
      title,
      type,
      priority,
      description: description || null,
      assignee: assignee || null,
      due_date: due_date || null,
      position,
      column_entered_at: new Date().toISOString(),
      timer_elapsed_ms: 0,
      timer_running: false,
      timer_started_at: null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task }, { status: 201 });
}
