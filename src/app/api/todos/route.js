import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

async function resolveUserSlug(supabase, user) {
  const { data: profile } = await supabase
    .from('users')
    .select('slug')
    .eq('id', user.id)
    .maybeSingle();
  return profile?.slug || user.email;
}

export async function GET() {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
  }

  const userSlug = await resolveUserSlug(supabase, user);

  const { data: todos, error } = await supabase
    .from('personal_todos')
    .select('*')
    .eq('user_slug', userSlug)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[GET /api/todos]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ todos: todos || [] });
}

export async function POST(request) {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
  }

  const userSlug = await resolveUserSlug(supabase, user);

  const body = await request.json();
  const { title, priority = 'medium', due_date, description, board_id } = body;

  if (!title || title.trim().length === 0) {
    return NextResponse.json({ error: 'Titulo e obrigatorio' }, { status: 400 });
  }

  // Calcular posicao
  const { data: lastTodo } = await supabase
    .from('personal_todos')
    .select('position')
    .eq('user_slug', userSlug)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();

  const position = lastTodo ? lastTodo.position + 1000 : 1000;

  const { data: todo, error } = await supabase
    .from('personal_todos')
    .insert({
      user_slug: userSlug,
      title: title.trim(),
      description: description || null,
      priority,
      due_date: due_date || null,
      board_id: board_id || null,
      position,
    })
    .select('*')
    .single();

  if (error) {
    console.error('[POST /api/todos]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ todo }, { status: 201 });
}
