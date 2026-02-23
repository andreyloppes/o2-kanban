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

export async function PATCH(request, { params }) {
  const { boardId, memberId } = await params;
  const supabase = await createServerClient();

  // Apenas owners podem alterar roles
  const { role: currentRole } = await getMemberRole(supabase, boardId);
  if (currentRole !== 'owner') {
    return NextResponse.json(
      { error: 'Apenas administradores podem alterar funcoes' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { role } = body;

  const validRoles = ['owner', 'member'];
  if (!role || !validRoles.includes(role)) {
    return NextResponse.json(
      { error: 'Role invalido. Use "owner" ou "member".' },
      { status: 400 }
    );
  }

  const { data: membership, error } = await supabase
    .from('board_members')
    .update({ role })
    .eq('id', memberId)
    .eq('board_id', boardId)
    .select()
    .single();

  if (error || !membership) {
    return NextResponse.json({ error: 'Membro nao encontrado' }, { status: 404 });
  }

  return NextResponse.json({ member: membership });
}

export async function DELETE(request, { params }) {
  const { boardId, memberId } = await params;
  const supabase = await createServerClient();

  // Apenas owners podem remover membros
  const { user, role: currentRole } = await getMemberRole(supabase, boardId);
  if (currentRole !== 'owner') {
    return NextResponse.json(
      { error: 'Apenas administradores podem remover membros' },
      { status: 403 }
    );
  }

  // Buscar o membro a ser removido
  const { data: targetMember } = await supabase
    .from('board_members')
    .select('user_id, role')
    .eq('id', memberId)
    .eq('board_id', boardId)
    .single();

  if (!targetMember) {
    return NextResponse.json({ error: 'Membro nao encontrado' }, { status: 404 });
  }

  // Nao pode remover a si mesmo se for o unico owner
  if (targetMember.user_id === user.id && targetMember.role === 'owner') {
    const { data: otherOwners } = await supabase
      .from('board_members')
      .select('id')
      .eq('board_id', boardId)
      .eq('role', 'owner')
      .neq('user_id', user.id);

    if (!otherOwners || otherOwners.length === 0) {
      return NextResponse.json(
        { error: 'Voce e o unico administrador. Promova outro membro antes de sair.' },
        { status: 400 }
      );
    }
  }

  const { error } = await supabase
    .from('board_members')
    .delete()
    .eq('id', memberId)
    .eq('board_id', boardId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
