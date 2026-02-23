import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

async function getMemberRole(supabase, boardId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, role: null };

  const { data } = await supabase
    .from('board_members')
    .select('role')
    .eq('board_id', boardId)
    .eq('user_id', user.id)
    .single();

  return { user, role: data?.role || null };
}

export async function PATCH(request, { params }) {
  const { boardId, automationId } = await params;
  const supabase = await createServerClient();

  const { role } = await getMemberRole(supabase, boardId);
  if (role !== 'owner') {
    return NextResponse.json(
      { error: 'Apenas administradores podem editar automacoes' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const updates = {};

  if (typeof body.enabled === 'boolean') updates.enabled = body.enabled;
  if (typeof body.name === 'string' && body.name.trim()) updates.name = body.name.trim();
  if (body.trigger_config !== undefined) updates.trigger_config = body.trigger_config;
  if (body.action_config !== undefined) updates.action_config = body.action_config;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 });
  }

  const { data: automation, error } = await supabase
    .from('board_automations')
    .update(updates)
    .eq('id', automationId)
    .eq('board_id', boardId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!automation) {
    return NextResponse.json({ error: 'Automacao nao encontrada' }, { status: 404 });
  }

  return NextResponse.json({ automation });
}

export async function DELETE(request, { params }) {
  const { boardId, automationId } = await params;
  const supabase = await createServerClient();

  const { role } = await getMemberRole(supabase, boardId);
  if (role !== 'owner') {
    return NextResponse.json(
      { error: 'Apenas administradores podem deletar automacoes' },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from('board_automations')
    .delete()
    .eq('id', automationId)
    .eq('board_id', boardId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
