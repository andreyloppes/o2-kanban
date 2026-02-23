import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

async function getMemberRole(supabase, boardId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, role: null };

  const { data } = await supabase
    .from('board_members')
    .select('role')
    .eq('board_id', boardId)
    .eq('user_id', user.id)
    .single();

  return { user, role: data?.role || null };
}

// GET: Listar solicitacoes pendentes (owner-only)
export async function GET(request, { params }) {
  const { boardId } = await params;
  const supabase = await createServerClient();

  const { user, role } = await getMemberRole(supabase, boardId);
  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
  }
  if (role !== 'owner') {
    return NextResponse.json({ error: 'Apenas administradores podem ver solicitacoes' }, { status: 403 });
  }

  const { data: requests, error } = await supabase
    .from('join_requests')
    .select('*')
    .eq('board_id', boardId)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Buscar dados dos usuarios
  const userIds = (requests || []).map((r) => r.user_id);
  let users = [];
  if (userIds.length > 0) {
    const { data } = await supabase
      .from('users')
      .select('id, name, email, avatar_color')
      .in('id', userIds);
    users = data || [];
  }

  const enriched = (requests || []).map((r) => ({
    ...r,
    user: users.find((u) => u.id === r.user_id) || null,
  }));

  return NextResponse.json({ requests: enriched });
}

// POST: Solicitar acesso (qualquer autenticado nao-membro)
export async function POST(request, { params }) {
  const { boardId } = await params;
  const supabase = await createServerClient();

  const { user, role } = await getMemberRole(supabase, boardId);
  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
  }

  // Ja e membro
  if (role) {
    return NextResponse.json({ error: 'Voce ja e membro deste board' }, { status: 409 });
  }

  // Verificar se ja tem request pendente
  const { data: existing } = await supabase
    .from('join_requests')
    .select('id, status')
    .eq('board_id', boardId)
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .single();

  if (existing) {
    return NextResponse.json({ error: 'Voce ja tem uma solicitacao pendente' }, { status: 409 });
  }

  // Verificar se board existe
  const { data: board } = await supabase
    .from('boards')
    .select('id')
    .eq('id', boardId)
    .single();

  if (!board) {
    return NextResponse.json({ error: 'Board nao encontrado' }, { status: 404 });
  }

  const { data: joinRequest, error } = await supabase
    .from('join_requests')
    .insert({
      board_id: boardId,
      user_id: user.id,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    // Unique constraint violation = ja existe request (approved/rejected)
    if (error.code === '23505') {
      // Atualizar request existente para pending
      const { data: updated, error: updateError } = await supabase
        .from('join_requests')
        .update({ status: 'pending' })
        .eq('board_id', boardId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
      return NextResponse.json({ request: updated }, { status: 201 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ request: joinRequest }, { status: 201 });
}
