import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createCommentSchema } from '@/lib/validators';

export async function GET(request, { params }) {
  const { taskId } = await params;
  const supabase = await createServerClient();

  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('id')
    .eq('id', taskId)
    .single();

  if (taskError || !task) {
    return NextResponse.json(
      { error: 'Tarefa nao encontrada' },
      { status: 404 }
    );
  }

  const { data: comments, error } = await supabase
    .from('task_comments')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comments: comments || [] });
}

export async function POST(request, { params }) {
  const { taskId } = await params;
  const supabase = await createServerClient();

  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('id, board_id')
    .eq('id', taskId)
    .single();

  if (taskError || !task) {
    return NextResponse.json(
      { error: 'Tarefa nao encontrada' },
      { status: 404 }
    );
  }

  // Verificar permissao
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: membership } = await supabase
      .from('board_members')
      .select('id')
      .eq('board_id', task.board_id)
      .eq('user_id', user.id)
      .limit(1);
    if (!membership || membership.length === 0) {
      return NextResponse.json(
        { error: 'Sem permissao para comentar neste board' },
        { status: 403 }
      );
    }
  }

  const body = await request.json();
  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { author, content } = parsed.data;

  const { data: comment, error } = await supabase
    .from('task_comments')
    .insert({
      task_id: taskId,
      board_id: task.board_id,
      author,
      content,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comment }, { status: 201 });
}
