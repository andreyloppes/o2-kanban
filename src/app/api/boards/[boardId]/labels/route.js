import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createLabelSchema } from '@/lib/validators';

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

  const isMember = await checkMembership(supabase, boardId);
  if (!isMember) {
    return NextResponse.json(
      { error: 'Sem permissao para acessar labels deste board' },
      { status: 403 }
    );
  }

  const { data: labels, error } = await supabase
    .from('labels')
    .select('*')
    .eq('board_id', boardId)
    .order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ labels: labels || [] });
}

export async function POST(request, { params }) {
  const { boardId } = await params;
  const supabase = await createServerClient();

  const isMember = await checkMembership(supabase, boardId);
  if (!isMember) {
    return NextResponse.json(
      { error: 'Sem permissao para criar labels neste board' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = createLabelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, color } = parsed.data;

  const { data: label, error } = await supabase
    .from('labels')
    .insert({
      board_id: boardId,
      name,
      color,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ label }, { status: 201 });
}
