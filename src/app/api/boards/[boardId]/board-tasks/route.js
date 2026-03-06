import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createBoardTaskSchema } from '@/lib/validators';
import { POSITION_GAP } from '@/lib/constants';

export async function GET(request, { params }) {
  const supabase = await createServerClient();
  const { boardId } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
  }

  const { data: boardTasks, error } = await supabase
    .from('board_tasks')
    .select('*, tasks:card_id(id, title, column_id)')
    .eq('board_id', boardId)
    .eq('user_id', user.id)
    .order('position', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Flatten card_title
  const tasks = (boardTasks || []).map((t) => ({
    ...t,
    card_title: t.tasks?.title || null,
    card_column_id: t.tasks?.column_id || null,
    tasks: undefined,
  }));

  return NextResponse.json({ boardTasks: tasks });
}

export async function POST(request, { params }) {
  const supabase = await createServerClient();
  const { boardId } = await params;
  const body = await request.json();

  const parsed = createBoardTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
  }

  // Calculate position
  const { data: lastTask } = await supabase
    .from('board_tasks')
    .select('position')
    .eq('board_id', boardId)
    .eq('user_id', user.id)
    .order('position', { ascending: false })
    .limit(1)
    .single();

  const position = lastTask ? lastTask.position + POSITION_GAP : POSITION_GAP;

  const { data: boardTask, error } = await supabase
    .from('board_tasks')
    .insert({
      board_id: boardId,
      user_id: user.id,
      title: parsed.data.title,
      card_id: parsed.data.card_id || null,
      description: parsed.data.description || null,
      priority: parsed.data.priority || 'medium',
      due_date: parsed.data.due_date || null,
      position,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ boardTask }, { status: 201 });
}
