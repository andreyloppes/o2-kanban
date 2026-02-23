import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createAutomationSchema } from '@/lib/validators';

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

export async function GET(request, { params }) {
  const { boardId } = await params;
  const supabase = await createServerClient();

  const { role } = await getMemberRole(supabase, boardId);
  if (role !== 'owner') {
    return NextResponse.json(
      { error: 'Apenas administradores podem ver automacoes' },
      { status: 403 }
    );
  }

  const { data: automations, error } = await supabase
    .from('board_automations')
    .select('*')
    .eq('board_id', boardId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ automations: automations || [] });
}

export async function POST(request, { params }) {
  const { boardId } = await params;
  const supabase = await createServerClient();

  const { role } = await getMemberRole(supabase, boardId);
  if (role !== 'owner') {
    return NextResponse.json(
      { error: 'Apenas administradores podem criar automacoes' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = createAutomationSchema.safeParse(body);

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message || 'Dados invalidos';
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const { data: automation, error } = await supabase
    .from('board_automations')
    .insert({
      board_id: boardId,
      name: parsed.data.name,
      trigger_type: parsed.data.trigger_type,
      trigger_config: parsed.data.trigger_config,
      action_type: parsed.data.action_type,
      action_config: parsed.data.action_config,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ automation }, { status: 201 });
}
