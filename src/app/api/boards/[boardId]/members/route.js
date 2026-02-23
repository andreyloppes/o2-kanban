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

export async function GET(request, { params }) {
  const { boardId } = await params;
  const supabase = await createServerClient();

  const { data: boardMembers, error } = await supabase
    .from('board_members')
    .select('*')
    .eq('board_id', boardId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: allUsers } = await supabase.from('users').select('*');

  const members = (boardMembers || []).map((bm) => {
    const user = (allUsers || []).find((u) => u.id === bm.user_id);
    return {
      id: bm.id,
      board_id: bm.board_id,
      role: bm.role,
      user: user || null,
    };
  });

  // Incluir role do usuario atual
  const { role: currentRole } = await getMemberRole(supabase, boardId);

  return NextResponse.json({ members, currentRole });
}

export async function POST(request, { params }) {
  const { boardId } = await params;
  const supabase = await createServerClient();

  // Apenas owners podem convidar
  const { role: currentRole } = await getMemberRole(supabase, boardId);
  if (currentRole !== 'owner') {
    return NextResponse.json(
      { error: 'Apenas administradores podem convidar membros' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { email, role } = body;

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email e obrigatorio' }, { status: 400 });
  }

  const validRoles = ['owner', 'member'];
  const targetRole = validRoles.includes(role) ? role : 'member';

  // Buscar usuario pelo email
  const { data: targetUser } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('email', email.trim().toLowerCase())
    .single();

  if (!targetUser) {
    return NextResponse.json(
      { error: 'Usuario nao encontrado. O usuario precisa ter uma conta na plataforma.' },
      { status: 404 }
    );
  }

  // Verificar se ja e membro
  const { data: existing } = await supabase
    .from('board_members')
    .select('id')
    .eq('board_id', boardId)
    .eq('user_id', targetUser.id)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: 'Este usuario ja e membro deste board' },
      { status: 409 }
    );
  }

  // Adicionar membro
  const { data: membership, error } = await supabase
    .from('board_members')
    .insert({
      board_id: boardId,
      user_id: targetUser.id,
      role: targetRole,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    member: {
      id: membership.id,
      board_id: membership.board_id,
      role: membership.role,
      user: targetUser,
    },
  }, { status: 201 });
}
