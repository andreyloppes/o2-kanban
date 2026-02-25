import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

async function getUserSlug(supabase, userId) {
  const { data: profile } = await supabase
    .from('users')
    .select('slug')
    .eq('id', userId)
    .maybeSingle();
  return profile?.slug;
}

export async function PATCH(request, { params }) {
  const supabase = await createServerClient();
  const { todoId } = await params;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
  }

  const userSlug = await getUserSlug(supabase, user.id);
  if (!userSlug) {
    return NextResponse.json({ error: 'Usuario sem perfil' }, { status: 403 });
  }

  const body = await request.json();
  const allowed = ['title', 'description', 'priority', 'status', 'due_date', 'board_id'];
  const updates = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  const { data: todo, error } = await supabase
    .from('personal_todos')
    .update(updates)
    .eq('id', todoId)
    .eq('user_slug', userSlug)
    .select('*')
    .single();

  if (error) {
    console.error('[PATCH /api/todos/[todoId]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!todo) {
    return NextResponse.json({ error: 'Todo nao encontrado' }, { status: 404 });
  }

  return NextResponse.json({ todo });
}

export async function DELETE(request, { params }) {
  const supabase = await createServerClient();
  const { todoId } = await params;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
  }

  const userSlug = await getUserSlug(supabase, user.id);
  if (!userSlug) {
    return NextResponse.json({ error: 'Usuario sem perfil' }, { status: 403 });
  }

  const { error } = await supabase
    .from('personal_todos')
    .delete()
    .eq('id', todoId)
    .eq('user_slug', userSlug);

  if (error) {
    console.error('[DELETE /api/todos/[todoId]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
