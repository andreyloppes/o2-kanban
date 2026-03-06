import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { updateBoardTaskSchema } from '@/lib/validators';

export async function PATCH(request, { params }) {
  const supabase = await createServerClient();
  const { taskId } = await params;
  const body = await request.json();

  const parsed = updateBoardTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
  }

  const updates = { ...parsed.data };

  // Auto-manage completed_at
  if (updates.is_completed === true) {
    updates.completed_at = new Date().toISOString();
  } else if (updates.is_completed === false) {
    updates.completed_at = null;
  }

  const { data: boardTask, error } = await supabase
    .from('board_tasks')
    .update(updates)
    .eq('id', taskId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ boardTask });
}

export async function DELETE(request, { params }) {
  const supabase = await createServerClient();
  const { taskId } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
  }

  const { error } = await supabase
    .from('board_tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
