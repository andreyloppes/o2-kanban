import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { updateLabelSchema } from '@/lib/validators';

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
  const { boardId, labelId } = await params;
  const supabase = await createServerClient();

  const isMember = await checkMembership(supabase, boardId);
  if (!isMember) {
    return NextResponse.json(
      { error: 'Sem permissao para editar labels neste board' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = updateLabelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const updates = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.color !== undefined) updates.color = parsed.data.color;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 });
  }

  const { data: label, error } = await supabase
    .from('labels')
    .update(updates)
    .eq('id', labelId)
    .eq('board_id', boardId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!label) {
    return NextResponse.json({ error: 'Label nao encontrada' }, { status: 404 });
  }

  return NextResponse.json({ label });
}

export async function DELETE(request, { params }) {
  const { boardId, labelId } = await params;
  const supabase = await createServerClient();

  const isMember = await checkMembership(supabase, boardId);
  if (!isMember) {
    return NextResponse.json(
      { error: 'Sem permissao para deletar labels neste board' },
      { status: 403 }
    );
  }

  // Deletar associacoes task_labels primeiro
  await supabase
    .from('task_labels')
    .delete()
    .eq('label_id', labelId);

  const { data, error } = await supabase
    .from('labels')
    .delete()
    .eq('id', labelId)
    .eq('board_id', boardId)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Label nao encontrada' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
