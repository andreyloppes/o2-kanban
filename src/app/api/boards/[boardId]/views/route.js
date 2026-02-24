import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createViewSchema } from '@/lib/validators';

async function getAuthUser(supabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

async function checkMembership(supabase, boardId, userId) {
  const { data } = await supabase
    .from('board_members')
    .select('id')
    .eq('board_id', boardId)
    .eq('user_id', userId)
    .limit(1);
  return data && data.length > 0;
}

export async function GET(request, { params }) {
  const { boardId } = await params;
  const supabase = await createServerClient();

  const user = await getAuthUser(supabase);
  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
  }

  const isMember = await checkMembership(supabase, boardId, user.id);
  if (!isMember) {
    return NextResponse.json(
      { error: 'Sem permissao para acessar este board' },
      { status: 403 }
    );
  }

  const { data: views, error } = await supabase
    .from('board_views')
    .select('*')
    .eq('board_id', boardId)
    .eq('user_id', user.id)
    .order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ views: views || [] });
}

export async function POST(request, { params }) {
  const { boardId } = await params;
  const supabase = await createServerClient();

  const user = await getAuthUser(supabase);
  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
  }

  const isMember = await checkMembership(supabase, boardId, user.id);
  if (!isMember) {
    return NextResponse.json(
      { error: 'Sem permissao para criar views neste board' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = createViewSchema.safeParse(body);

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message || 'Dados invalidos';
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const { data: view, error } = await supabase
    .from('board_views')
    .insert({
      board_id: boardId,
      user_id: user.id,
      name: parsed.data.name,
      filters: parsed.data.filters,
      view_type: parsed.data.view_type,
      is_default: false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ view }, { status: 201 });
}
