import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

async function checkTaskPermission(supabase, taskId) {
  const { data: task } = await supabase
    .from('tasks')
    .select('board_id')
    .eq('id', taskId)
    .single();
  if (!task) return { allowed: false, task: null };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { allowed: true, task }; // mock mode

  const { data: membership } = await supabase
    .from('board_members')
    .select('id')
    .eq('board_id', task.board_id)
    .eq('user_id', user.id)
    .limit(1);

  return { allowed: membership && membership.length > 0, task };
}

export async function GET(request, { params }) {
  const { taskId } = await params;
  const supabase = await createServerClient();

  const { data: task } = await supabase
    .from('tasks')
    .select('id')
    .eq('id', taskId)
    .single();

  if (!task) {
    return NextResponse.json(
      { error: 'Tarefa nao encontrada' },
      { status: 404 }
    );
  }

  const { data: labels, error } = await supabase
    .from('labels')
    .select('*, task_labels!inner(task_id)')
    .eq('task_labels.task_id', taskId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Remove the join metadata from the response
  const cleanLabels = (labels || []).map(({ task_labels, ...label }) => label);

  return NextResponse.json({ labels: cleanLabels });
}

export async function POST(request, { params }) {
  const { taskId } = await params;
  const supabase = await createServerClient();

  const { allowed, task } = await checkTaskPermission(supabase, taskId);
  if (!task) {
    return NextResponse.json(
      { error: 'Tarefa nao encontrada' },
      { status: 404 }
    );
  }
  if (!allowed) {
    return NextResponse.json(
      { error: 'Sem permissao para editar labels desta tarefa' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { label_id } = body;

  if (!label_id) {
    return NextResponse.json(
      { error: 'label_id e obrigatorio' },
      { status: 400 }
    );
  }

  // Verificar se a label pertence ao mesmo board da task
  const { data: label } = await supabase
    .from('labels')
    .select('id')
    .eq('id', label_id)
    .eq('board_id', task.board_id)
    .single();

  if (!label) {
    return NextResponse.json(
      { error: 'Label nao encontrada neste board' },
      { status: 404 }
    );
  }

  const { data: taskLabel, error } = await supabase
    .from('task_labels')
    .insert({
      task_id: taskId,
      label_id,
    })
    .select()
    .single();

  if (error) {
    // Duplicate check (unique constraint)
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Label ja atribuida a esta tarefa' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task_label: taskLabel }, { status: 201 });
}

export async function DELETE(request, { params }) {
  const { taskId } = await params;
  const supabase = await createServerClient();

  const { allowed, task } = await checkTaskPermission(supabase, taskId);
  if (!task) {
    return NextResponse.json(
      { error: 'Tarefa nao encontrada' },
      { status: 404 }
    );
  }
  if (!allowed) {
    return NextResponse.json(
      { error: 'Sem permissao para editar labels desta tarefa' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const labelId = searchParams.get('label_id');

  if (!labelId) {
    return NextResponse.json(
      { error: 'label_id query param e obrigatorio' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('task_labels')
    .delete()
    .eq('task_id', taskId)
    .eq('label_id', labelId)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: 'Associacao label-tarefa nao encontrada' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
