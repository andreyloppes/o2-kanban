import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function DELETE(request, { params }) {
  const { taskId, commentId } = await params;
  const supabase = await createServerClient();

  // Buscar task para verificar board_id
  const { data: task } = await supabase
    .from('tasks')
    .select('board_id')
    .eq('id', taskId)
    .single();

  if (!task) {
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
        { error: 'Sem permissao para deletar comentarios neste board' },
        { status: 403 }
      );
    }
  }

  const { data, error } = await supabase
    .from('task_comments')
    .delete()
    .eq('id', commentId)
    .eq('task_id', taskId)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: 'Comentario nao encontrado' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
