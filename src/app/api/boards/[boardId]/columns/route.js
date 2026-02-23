import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createColumnSchema } from '@/lib/validators';
import { POSITION_GAP } from '@/lib/constants';

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

export async function POST(request, { params }) {
  const { boardId } = await params;
  const supabase = await createServerClient();

  const isMember = await checkMembership(supabase, boardId);
  if (!isMember) {
    return NextResponse.json(
      { error: 'Sem permissao para adicionar colunas neste board' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = createColumnSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { title, color } = parsed.data;

  // Calcular posicao (ultima coluna + GAP)
  const { data: lastCol } = await supabase
    .from('columns')
    .select('position')
    .eq('board_id', boardId)
    .order('position', { ascending: false })
    .limit(1)
    .single();

  const position = lastCol ? lastCol.position + POSITION_GAP : POSITION_GAP;

  const { data: column, error } = await supabase
    .from('columns')
    .insert({
      board_id: boardId,
      title,
      color: color || 'neutral',
      position,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ column }, { status: 201 });
}
