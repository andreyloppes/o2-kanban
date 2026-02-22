import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createBoardSchema } from '@/lib/validators';
import { POSITION_GAP, DEFAULT_COLUMNS } from '@/lib/constants';

export async function GET() {
  const supabase = await createServerClient();

  // Verificar usuario autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let boards;

  if (user) {
    // Auth mode: buscar apenas boards do usuario
    const { data: memberships } = await supabase
      .from('board_members')
      .select('board_id')
      .eq('user_id', user.id);

    const boardIds = (memberships || []).map((m) => m.board_id);

    if (boardIds.length === 0) {
      return NextResponse.json({ boards: [] });
    }

    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .in('id', boardIds)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    boards = data || [];
  } else {
    // Mock mode: buscar todos os boards
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    boards = data || [];
  }

  // Enrich with member_count and task_count
  const enriched = await Promise.all(
    boards.map(async (board) => {
      const { data: members } = await supabase
        .from('board_members')
        .select('id')
        .eq('board_id', board.id);

      const { data: tasks } = await supabase
        .from('tasks')
        .select('id')
        .eq('board_id', board.id);

      return {
        ...board,
        member_count: members?.length || 0,
        task_count: tasks?.length || 0,
      };
    })
  );

  return NextResponse.json({ boards: enriched });
}

export async function POST(request) {
  const supabase = await createServerClient();
  const body = await request.json();

  const parsed = createBoardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { title, description } = parsed.data;

  // Create board
  const { data: board, error: boardError } = await supabase
    .from('boards')
    .insert({ title, description: description || null })
    .select()
    .single();

  if (boardError) {
    return NextResponse.json({ error: boardError.message }, { status: 500 });
  }

  // Create default columns
  for (let i = 0; i < DEFAULT_COLUMNS.length; i++) {
    await supabase.from('columns').insert({
      board_id: board.id,
      title: DEFAULT_COLUMNS[i].title,
      color: DEFAULT_COLUMNS[i].color,
      position: (i + 1) * POSITION_GAP,
    });
  }

  // Associar usuario autenticado como owner do board
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.from('board_members').insert({
      board_id: board.id,
      user_id: user.id,
      role: 'owner',
    });
  }

  return NextResponse.json({ board }, { status: 201 });
}
