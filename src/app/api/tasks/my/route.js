import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request) {
  const supabase = await createServerClient();
  const { searchParams } = new URL(request.url);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
  }

  // Buscar slug do user atual (tabela users, nao board_members)
  const { data: profile } = await supabase
    .from('users')
    .select('slug')
    .eq('id', user.id)
    .maybeSingle();

  const userSlug = profile?.slug || null;

  const allMembers = searchParams.get('all') === 'true';
  const priorityFilter = searchParams.get('priority');
  const overdueFilter = searchParams.get('overdue') === 'true';

  // Buscar todos os boards onde o user e membro
  const { data: memberships } = await supabase
    .from('board_members')
    .select('board_id')
    .eq('user_id', user.id);

  const boardIds = (memberships || []).map((m) => m.board_id);
  if (boardIds.length === 0) {
    return NextResponse.json({ tasks: [], boards: [] });
  }

  // Buscar boards info
  const { data: boards } = await supabase
    .from('boards')
    .select('id, title, color')
    .in('id', boardIds);

  // Buscar colunas dos boards (para saber quais sao done)
  const { data: columns } = await supabase
    .from('columns')
    .select('id, board_id, title, is_done_column, position')
    .in('board_id', boardIds);

  // Construir query de tasks
  let tasksQuery = supabase
    .from('tasks')
    .select('id, title, description, type, priority, assignee, due_date, start_date, column_id, board_id, position, created_at, updated_at, column_entered_at')
    .in('board_id', boardIds);

  if (!allMembers && userSlug) {
    tasksQuery = tasksQuery.eq('assignee', userSlug);
  } else if (!allMembers && !userSlug) {
    // Sem slug, nao ha tasks atribuidas ao user
    return NextResponse.json({ tasks: [], boards: boards || [] });
  }

  if (priorityFilter) {
    tasksQuery = tasksQuery.eq('priority', priorityFilter);
  }

  const { data: tasks, error } = await tasksQuery.order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const now = new Date();
  const columnMap = {};
  const boardMap = {};

  for (const col of (columns || [])) {
    columnMap[col.id] = col;
  }
  for (const b of (boards || [])) {
    boardMap[b.id] = b;
  }

  // Enriquecer tasks com info de board, coluna e status calculado
  let enrichedTasks = (tasks || []).map((task) => {
    const col = columnMap[task.column_id];
    const board = boardMap[task.board_id];
    const isDone = col?.is_done_column || false;
    const isOverdue = !isDone && task.due_date && new Date(task.due_date) < now;

    return {
      ...task,
      board_title: board?.title || '',
      board_color: board?.color || '',
      column_title: col?.title || '',
      is_done: isDone,
      is_overdue: isOverdue,
    };
  });

  if (overdueFilter) {
    enrichedTasks = enrichedTasks.filter((t) => t.is_overdue);
  }

  // Buscar membros de todos os boards para TeamView
  let allMembersData = [];
  if (allMembers) {
    const { data: boardMembersData } = await supabase
      .from('board_members')
      .select('user_id, slug, name, avatar_color, board_id, role')
      .in('board_id', boardIds);
    allMembersData = boardMembersData || [];
  }

  return NextResponse.json({
    tasks: enrichedTasks,
    boards: boards || [],
    members: allMembersData,
  });
}
