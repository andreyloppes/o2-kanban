import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function DELETE(request, { params }) {
  const { taskId, commentId } = await params;
  const supabase = createServerClient();

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
