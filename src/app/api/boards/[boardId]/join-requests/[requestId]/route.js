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

// PATCH: Aprovar ou rejeitar solicitacao (owner-only)
export async function PATCH(request, { params }) {
  const { boardId, requestId } = await params;
  const supabase = await createServerClient();

  const { user, role } = await getMemberRole(supabase, boardId);
  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
  }
  if (role !== 'owner') {
    return NextResponse.json({ error: 'Apenas administradores podem gerenciar solicitacoes' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body invalido' }, { status: 400 });
  }

  const { action } = body;
  if (!['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Acao invalida. Use "approve" ou "reject"' }, { status: 400 });
  }

  // Buscar request
  const { data: joinRequest, error: fetchError } = await supabase
    .from('join_requests')
    .select('*')
    .eq('id', requestId)
    .eq('board_id', boardId)
    .eq('status', 'pending')
    .single();

  if (fetchError || !joinRequest) {
    return NextResponse.json({ error: 'Solicitacao nao encontrada' }, { status: 404 });
  }

  if (action === 'approve') {
    // Inserir como membro
    const { error: memberError } = await supabase
      .from('board_members')
      .insert({
        board_id: boardId,
        user_id: joinRequest.user_id,
        role: 'member',
      });

    if (memberError) {
      // Ja e membro (race condition)
      if (memberError.code === '23505') {
        await supabase.from('join_requests').delete().eq('id', requestId);
        return NextResponse.json({ message: 'Usuario ja e membro' });
      }
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }
  }

  // Deletar request (tanto approve quanto reject)
  await supabase.from('join_requests').delete().eq('id', requestId);

  return NextResponse.json({
    message: action === 'approve' ? 'Solicitacao aprovada' : 'Solicitacao rejeitada',
    action,
  });
}

// DELETE: Cancelar propria solicitacao ou owner cancela
export async function DELETE(request, { params }) {
  const { boardId, requestId } = await params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
  }

  // Buscar request
  const { data: joinRequest, error: fetchError } = await supabase
    .from('join_requests')
    .select('*')
    .eq('id', requestId)
    .eq('board_id', boardId)
    .single();

  if (fetchError || !joinRequest) {
    return NextResponse.json({ error: 'Solicitacao nao encontrada' }, { status: 404 });
  }

  // Pode cancelar: o proprio usuario ou um owner
  const { role } = await getMemberRole(supabase, boardId);
  if (joinRequest.user_id !== user.id && role !== 'owner') {
    return NextResponse.json({ error: 'Sem permissao' }, { status: 403 });
  }

  await supabase.from('join_requests').delete().eq('id', requestId);

  return new NextResponse(null, { status: 204 });
}
