import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

async function getAuthUser(supabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function PATCH(request, { params }) {
  const { boardId, viewId } = await params;
  const supabase = await createServerClient();

  const user = await getAuthUser(supabase);
  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
  }

  const body = await request.json();
  const updates = {};

  if (typeof body.name === 'string' && body.name.trim()) {
    updates.name = body.name.trim();
  }
  if (body.filters !== undefined) {
    updates.filters = body.filters;
  }
  if (body.view_type !== undefined) {
    updates.view_type = body.view_type;
  }
  if (typeof body.is_default === 'boolean') {
    updates.is_default = body.is_default;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 });
  }

  const { data: view, error } = await supabase
    .from('board_views')
    .update(updates)
    .eq('id', viewId)
    .eq('board_id', boardId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!view) {
    return NextResponse.json({ error: 'View nao encontrada' }, { status: 404 });
  }

  return NextResponse.json({ view });
}

export async function DELETE(request, { params }) {
  const { boardId, viewId } = await params;
  const supabase = await createServerClient();

  const user = await getAuthUser(supabase);
  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
  }

  const { error } = await supabase
    .from('board_views')
    .delete()
    .eq('id', viewId)
    .eq('board_id', boardId)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
