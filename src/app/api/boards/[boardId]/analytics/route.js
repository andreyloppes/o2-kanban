import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { COLUMN_AGE_THRESHOLDS } from '@/lib/constants';

async function getUserBoardRole(supabase, boardId) {
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

function daysBetween(dateA, dateB) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.max(0, (dateB - dateA) / msPerDay);
}

export async function GET(request, { params }) {
  const { boardId } = await params;
  const supabase = await createServerClient();

  // Autenticar e verificar membro
  const { user, role } = await getUserBoardRole(supabase, boardId);
  if (!user || !role) {
    return NextResponse.json(
      { error: 'Acesso negado' },
      { status: 403 }
    );
  }

  // Buscar colunas
  const { data: columns } = await supabase
    .from('columns')
    .select('*')
    .eq('board_id', boardId)
    .order('position', { ascending: true });

  if (!columns) {
    return NextResponse.json({ error: 'Board nao encontrado' }, { status: 404 });
  }

  // Buscar todas as tasks do board
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('board_id', boardId);

  const allTasks = tasks || [];
  const now = new Date();

  // --- OVERVIEW ---
  const total_tasks = allTasks.length;

  const columnMap = {};
  for (const col of columns) {
    columnMap[col.id] = col;
  }

  const tasks_by_column = columns.map((col) => ({
    column_title: col.title,
    count: allTasks.filter((t) => t.column_id === col.id).length,
    color: col.color || 'neutral',
  }));

  const tasks_by_priority = { low: 0, medium: 0, high: 0, urgent: 0 };
  for (const t of allTasks) {
    const p = t.priority || 'medium';
    if (tasks_by_priority[p] !== undefined) tasks_by_priority[p]++;
  }

  const tasks_by_type = { task: 0, user_story: 0, bug: 0, epic: 0, spike: 0 };
  for (const t of allTasks) {
    const tp = t.type || 'task';
    if (tasks_by_type[tp] !== undefined) tasks_by_type[tp]++;
  }

  // --- VELOCITY ---
  const doneColumnIds = columns
    .filter((c) => c.is_done_column)
    .map((c) => c.id);

  const doneTasks = allTasks.filter((t) => doneColumnIds.includes(t.column_id));

  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
  const fourWeeksAgo = new Date(now);
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  // Tasks concluidas = tasks em colunas done com column_entered_at recente
  const completed_this_week = doneTasks.filter((t) => {
    const entered = t.column_entered_at ? new Date(t.column_entered_at) : null;
    return entered && entered >= oneWeekAgo;
  }).length;

  const completed_this_month = doneTasks.filter((t) => {
    const entered = t.column_entered_at ? new Date(t.column_entered_at) : null;
    return entered && entered >= oneMonthAgo;
  }).length;

  // Media por semana (ultimas 4 semanas)
  const completedLast4Weeks = doneTasks.filter((t) => {
    const entered = t.column_entered_at ? new Date(t.column_entered_at) : null;
    return entered && entered >= fourWeeksAgo;
  }).length;
  const avg_completion_per_week = Math.round((completedLast4Weeks / 4) * 10) / 10;

  // --- TIMING ---
  // Lead time: tempo entre created_at e column_entered_at para tasks em colunas done
  const leadTimes = doneTasks
    .filter((t) => t.column_entered_at && t.created_at)
    .map((t) => daysBetween(new Date(t.created_at), new Date(t.column_entered_at)));

  const avg_lead_time_days =
    leadTimes.length > 0
      ? Math.round((leadTimes.reduce((s, d) => s + d, 0) / leadTimes.length) * 10) / 10
      : 0;

  // Tempo medio por coluna (usando column_entered_at das tasks atuais)
  const avg_time_per_column = columns
    .filter((c) => !c.is_done_column)
    .map((col) => {
      const colTasks = allTasks.filter(
        (t) => t.column_id === col.id && t.column_entered_at
      );
      if (colTasks.length === 0) return { column_title: col.title, avg_days: 0 };
      const totalDays = colTasks.reduce(
        (sum, t) => sum + daysBetween(new Date(t.column_entered_at), now),
        0
      );
      return {
        column_title: col.title,
        avg_days: Math.round((totalDays / colTasks.length) * 10) / 10,
      };
    });

  // Timer medio (task_execution_log)
  const { data: execLogs } = await supabase
    .from('task_execution_log')
    .select('duration_ms')
    .eq('board_id', boardId);

  let avg_timer_duration_min = 0;
  if (execLogs && execLogs.length > 0) {
    const totalMs = execLogs.reduce((s, l) => s + (l.duration_ms || 0), 0);
    avg_timer_duration_min = Math.round(totalMs / execLogs.length / 60000);
  }

  // --- HEALTH ---
  const tasks_without_assignee = allTasks.filter(
    (t) => !t.assignee && !doneColumnIds.includes(t.column_id)
  ).length;

  const tasks_without_estimate = allTasks.filter(
    (t) => !t.estimated_duration_min && !doneColumnIds.includes(t.column_id)
  ).length;

  const tasks_overdue = allTasks.filter((t) => {
    if (!t.due_date || doneColumnIds.includes(t.column_id)) return false;
    return new Date(t.due_date) < now;
  }).length;

  // Stale tasks: em colunas nao-done com column_entered_at > threshold dias
  const stale_tasks = allTasks
    .filter((t) => {
      if (doneColumnIds.includes(t.column_id)) return false;
      if (!t.column_entered_at) return false;
      const days = daysBetween(new Date(t.column_entered_at), now);
      return days >= COLUMN_AGE_THRESHOLDS.warning;
    })
    .map((t) => {
      const col = columnMap[t.column_id];
      const days = Math.round(daysBetween(new Date(t.column_entered_at), now));
      return {
        id: t.id,
        title: t.title,
        column_title: col?.title || '—',
        days_in_column: days,
      };
    })
    .sort((a, b) => b.days_in_column - a.days_in_column);

  // --- ALERTS ---
  const alerts = [];

  if (tasks_overdue > 0) {
    alerts.push({
      type: 'danger',
      message: `${tasks_overdue} tarefa${tasks_overdue > 1 ? 's' : ''} com prazo vencido`,
    });
  }

  const dangerStale = stale_tasks.filter(
    (t) => t.days_in_column >= COLUMN_AGE_THRESHOLDS.danger
  );
  if (dangerStale.length > 0) {
    alerts.push({
      type: 'danger',
      message: `${dangerStale.length} tarefa${dangerStale.length > 1 ? 's' : ''} parada${dangerStale.length > 1 ? 's' : ''} ha mais de ${COLUMN_AGE_THRESHOLDS.danger} dias`,
    });
  }

  const warningStale = stale_tasks.filter(
    (t) =>
      t.days_in_column >= COLUMN_AGE_THRESHOLDS.warning &&
      t.days_in_column < COLUMN_AGE_THRESHOLDS.danger
  );
  if (warningStale.length > 0) {
    alerts.push({
      type: 'warning',
      message: `${warningStale.length} tarefa${warningStale.length > 1 ? 's' : ''} parada${warningStale.length > 1 ? 's' : ''} ha mais de ${COLUMN_AGE_THRESHOLDS.warning} dias`,
    });
  }

  if (tasks_without_assignee > 3) {
    alerts.push({
      type: 'warning',
      message: `${tasks_without_assignee} tarefas sem responsavel atribuido`,
    });
  }

  // WIP limit violations
  for (const col of columns) {
    if (!col.wip_limit) continue;
    const count = allTasks.filter((t) => t.column_id === col.id).length;
    if (count > col.wip_limit) {
      alerts.push({
        type: 'warning',
        message: `Coluna "${col.title}" excedeu o limite WIP (${count}/${col.wip_limit})`,
      });
    }
  }

  return NextResponse.json({
    overview: {
      total_tasks,
      tasks_by_column,
      tasks_by_priority,
      tasks_by_type,
    },
    velocity: {
      completed_this_week,
      completed_this_month,
      avg_completion_per_week,
    },
    timing: {
      avg_lead_time_days,
      avg_time_per_column,
      avg_timer_duration_min,
    },
    health: {
      tasks_without_assignee,
      tasks_without_estimate,
      tasks_overdue,
      stale_tasks,
    },
    alerts,
  });
}
