import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { updateColumnSchema } from '@/lib/validators';

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

export async function PATCH(request, { params }) {
  const { boardId, columnId } = await params;
  const supabase = await createServerClient();

  const isMember = await checkMembership(supabase, boardId);
  if (!isMember) {
    return NextResponse.json(
      { error: 'Sem permissao para editar colunas neste board' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = updateColumnSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const updates = {};
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.color !== undefined) updates.color = parsed.data.color;
  if (parsed.data.position !== undefined) updates.position = parsed.data.position;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 });
  }

  const { data: column, error } = await supabase
    .from('columns')
    .update(updates)
    .eq('id', columnId)
    .eq('board_id', boardId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!column) {
    return NextResponse.json({ error: 'Coluna nao encontrada' }, { status: 404 });
  }

  return NextResponse.json({ column });
}

export async function DELETE(request, { params }) {
  const { boardId, columnId } = await params;
  const supabase = await createServerClient();

  const isMember = await checkMembership(supabase, boardId);
  if (!isMember) {
    return NextResponse.json(
      { error: 'Sem permissao para deletar colunas neste board' },
      { status: 403 }
    );
  }

  // Verificar se existem tasks na coluna
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('column_id', columnId)
    .limit(1);

  if (tasks && tasks.length > 0) {
    return NextResponse.json(
      { error: 'Nao e possivel deletar coluna com tarefas. Mova ou delete as tarefas primeiro.' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('columns')
    .delete()
    .eq('id', columnId)
    .eq('board_id', boardId)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Coluna nao encontrada' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
