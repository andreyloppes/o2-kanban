import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request, { params }) {
  const { boardId } = await params;
  const supabase = createServerClient();

  // Buscar board_members
  const { data: boardMembers, error } = await supabase
    .from('board_members')
    .select('*')
    .eq('board_id', boardId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Join com users
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

  return NextResponse.json({ members });
}
