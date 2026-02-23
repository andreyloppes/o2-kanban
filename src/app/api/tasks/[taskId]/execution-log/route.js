import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// POST: Registrar execução finalizada (quando timer para e task vai pra done)
export async function POST(request, { params }) {
  const { taskId } = await params;
  const supabase = await createServerClient();

  const { data: task } = await supabase
    .from('tasks')
    .select('id, board_id, title, type, timer_elapsed_ms')
    .eq('id', taskId)
    .single();

  if (!task) {
    return NextResponse.json({ error: 'Tarefa nao encontrada' }, { status: 404 });
  }

  if (!task.timer_elapsed_ms || task.timer_elapsed_ms <= 0) {
    return NextResponse.json({ error: 'Tarefa sem tempo registrado' }, { status: 400 });
  }

  const { data: log, error } = await supabase
    .from('task_execution_log')
    .insert({
      task_id: task.id,
      board_id: task.board_id,
      title: task.title,
      type: task.type,
      duration_ms: task.timer_elapsed_ms,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ log }, { status: 201 });
}

// GET: Buscar media de duracao para tarefas semelhantes
export async function GET(request, { params }) {
  const { taskId } = await params;
  const supabase = await createServerClient();

  const { data: task } = await supabase
    .from('tasks')
    .select('board_id, title, type')
    .eq('id', taskId)
    .single();

  if (!task) {
    return NextResponse.json({ error: 'Tarefa nao encontrada' }, { status: 404 });
  }

  // Buscar execucoes do mesmo board e tipo
  const { data: logs } = await supabase
    .from('task_execution_log')
    .select('duration_ms, title')
    .eq('board_id', task.board_id)
    .eq('type', task.type)
    .order('completed_at', { ascending: false })
    .limit(50);

  if (!logs || logs.length === 0) {
    return NextResponse.json({ average_duration_ms: null, sample_count: 0 });
  }

  // Calcular media
  const total = logs.reduce((sum, l) => sum + l.duration_ms, 0);
  const avg = Math.round(total / logs.length);

  return NextResponse.json({
    average_duration_ms: avg,
    average_duration_min: Math.round(avg / 60000),
    sample_count: logs.length,
  });
}
