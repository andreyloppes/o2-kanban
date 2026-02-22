import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { updateBoardSchema } from '@/lib/validators';

async function checkMembership(supabase, boardId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from('board_members')
    .select('id')
    .eq('board_id', boardId)
    .eq('user_id', user.id)
    .limit(1);
  return data && data.length > 0;
}

export async function GET(request, { params }) {
  const { boardId } = await params;
  const supabase = await createServerClient();

  // Buscar board
  const { data: board, error: boardError } = await supabase
    .from('boards')
    .select('*')
    .eq('id', boardId)
    .single();

  if (boardError || !board) {
    return NextResponse.json(
      { error: 'Board nao encontrado' },
      { status: 404 }
    );
  }

  // Buscar colunas ordenadas por posicao
  const { data: columns } = await supabase
    .from('columns')
    .select('*')
    .eq('board_id', boardId)
    .order('position', { ascending: true });

  // Buscar tasks ordenadas por posicao
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('board_id', boardId)
    .order('position', { ascending: true });

  // Buscar members do board (join com users)
  const { data: boardMembers } = await supabase
    .from('board_members')
    .select('*')
    .eq('board_id', boardId);

  const { data: allUsers } = await supabase.from('users').select('*');

  const members = (boardMembers || []).map((bm) => {
    const user = (allUsers || []).find((u) => u.id === bm.user_id);
    return {
      ...bm,
      user: user || null,
    };
  });

  // Verificar se usuario atual e membro
  const canEdit = await checkMembership(supabase, boardId);

  return NextResponse.json({
    board: { ...board, can_edit: canEdit },
    columns: columns || [],
    tasks: tasks || [],
    members,
  });
}

export async function PATCH(request, { params }) {
  const { boardId } = await params;
  const supabase = await createServerClient();

  // Verificar permissao
  const isMember = await checkMembership(supabase, boardId);
  if (!isMember) {
    return NextResponse.json(
      { error: 'Sem permissao para editar este board' },
      { status: 403 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body invalido' }, { status: 400 });
  }

  const result = updateBoardSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message || 'Dados invalidos' },
      { status: 400 }
    );
  }

  const updates = {};
  if (result.data.title !== undefined) updates.title = result.data.title;
  if (result.data.description !== undefined) updates.description = result.data.description;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 });
  }

  const { data: board, error } = await supabase
    .from('boards')
    .update(updates)
    .eq('id', boardId)
    .select()
    .single();

  if (error || !board) {
    return NextResponse.json({ error: 'Board nao encontrado' }, { status: 404 });
  }

  return NextResponse.json({ board });
}

export async function DELETE(request, { params }) {
  const { boardId } = await params;
  const supabase = await createServerClient();

  // Verificar permissao
  const isMember = await checkMembership(supabase, boardId);
  if (!isMember) {
    return NextResponse.json(
      { error: 'Sem permissao para deletar este board' },
      { status: 403 }
    );
  }

  // Verificar se board existe
  const { data: board, error: boardError } = await supabase
    .from('boards')
    .select('id')
    .eq('id', boardId)
    .single();

  if (boardError || !board) {
    return NextResponse.json({ error: 'Board nao encontrado' }, { status: 404 });
  }

  // Buscar tasks do board para deletar comments
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('board_id', boardId);

  const taskIds = (tasks || []).map((t) => t.id);

  // Deletar em cascata: comments → tasks → columns → board_members → board
  if (taskIds.length > 0) {
    await supabase.from('task_comments').delete().in('task_id', taskIds);
  }
  await supabase.from('tasks').delete().eq('board_id', boardId);
  await supabase.from('columns').delete().eq('board_id', boardId);
  await supabase.from('board_members').delete().eq('board_id', boardId);
  await supabase.from('boards').delete().eq('id', boardId);

  return new NextResponse(null, { status: 204 });
}
