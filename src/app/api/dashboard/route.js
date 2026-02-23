import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { COLUMN_AGE_THRESHOLDS } from '@/lib/constants';

function daysBetween(dateA, dateB) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.max(0, (dateB - dateA) / msPerDay);
}

export async function GET() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
  }

  // Buscar boards onde o user e owner
  const { data: memberships } = await supabase
    .from('board_members')
    .select('board_id')
    .eq('user_id', user.id)
    .eq('role', 'owner');

  const boardIds = (memberships || []).map((m) => m.board_id);

  if (boardIds.length === 0) {
    return NextResponse.json({
      global: {
        total_boards: 0,
        total_tasks: 0,
        total_completed: 0,
        total_in_progress: 0,
        total_overdue: 0,
        total_members: 0,
        avg_lead_time_days: 0,
        avg_timer_duration_min: 0,
        completion_rate: 0,
      },
      boards: [],
      members: [],
      stages: [],
      alerts: [],
    });
  }

  // Buscar dados de todos os boards em paralelo
  const boardDataPromises = boardIds.map(async (boardId) => {
    const [
      { data: board },
      { data: columns },
      { data: tasks },
      { data: boardMembers },
      { data: execLogs },
    ] = await Promise.all([
      supabase.from('boards').select('id, title').eq('id', boardId).single(),
      supabase
        .from('columns')
        .select('*')
        .eq('board_id', boardId)
        .order('position', { ascending: true }),
      supabase.from('tasks').select('*').eq('board_id', boardId),
      supabase
        .from('board_members')
        .select('user_id, role, slug, name, avatar_color')
        .eq('board_id', boardId),
      supabase
        .from('task_execution_log')
        .select('task_id, duration_ms')
        .eq('board_id', boardId),
    ]);

    return {
      board: board || { id: boardId, title: 'Board' },
      columns: columns || [],
      tasks: tasks || [],
      members: boardMembers || [],
      execLogs: execLogs || [],
    };
  });

  const allBoardData = await Promise.all(boardDataPromises);
  const now = new Date();
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // --- GLOBAL AGGREGATION ---
  let totalTasks = 0;
  let totalCompleted = 0;
  let totalInProgress = 0;
  let totalOverdue = 0;
  const allLeadTimes = [];
  const allTimerDurations = [];
  const memberMap = {};
  const stageMap = {};
  const allAlerts = [];

  const boardsSummary = allBoardData.map((bd) => {
    const { board, columns, tasks, members, execLogs } = bd;

    const doneColumnIds = columns
      .filter((c) => c.is_done_column)
      .map((c) => c.id);

    // Primeira coluna = backlog
    const firstColumnId = columns.length > 0 ? columns[0].id : null;

    const doneTasks = tasks.filter((t) => doneColumnIds.includes(t.column_id));
    const inProgressTasks = tasks.filter(
      (t) =>
        !doneColumnIds.includes(t.column_id) && t.column_id !== firstColumnId
    );
    const overdueTasks = tasks.filter((t) => {
      if (!t.due_date || doneColumnIds.includes(t.column_id)) return false;
      return new Date(t.due_date) < now;
    });

    totalTasks += tasks.length;
    totalCompleted += doneTasks.length;
    totalInProgress += inProgressTasks.length;
    totalOverdue += overdueTasks.length;

    // Lead times
    const boardLeadTimes = doneTasks
      .filter((t) => t.column_entered_at && t.created_at)
      .map((t) =>
        daysBetween(new Date(t.created_at), new Date(t.column_entered_at))
      );
    allLeadTimes.push(...boardLeadTimes);

    const avgLeadTime =
      boardLeadTimes.length > 0
        ? Math.round(
            (boardLeadTimes.reduce((s, d) => s + d, 0) /
              boardLeadTimes.length) *
              10
          ) / 10
        : 0;

    // Timer durations
    if (execLogs.length > 0) {
      allTimerDurations.push(...execLogs.map((l) => l.duration_ms || 0));
    }

    // Velocity (last 7 days)
    const velocityWeek = doneTasks.filter((t) => {
      const entered = t.column_entered_at
        ? new Date(t.column_entered_at)
        : null;
      return entered && entered >= oneWeekAgo;
    }).length;

    // Build task-to-assignee map for this board
    const taskAssigneeMap = {};
    for (const t of tasks) {
      if (t.assignee) taskAssigneeMap[t.id] = t.assignee;
    }

    // Members aggregation
    for (const m of members) {
      const slug = m.slug || m.name || m.user_id;
      if (!memberMap[slug]) {
        memberMap[slug] = {
          slug,
          name: m.name || slug,
          avatar_color: m.avatar_color || '#6b7280',
          total_tasks: 0,
          completed_tasks: 0,
          in_progress_tasks: 0,
          timer_durations: [],
          boards: [],
        };
      }

      const memberEntry = memberMap[slug];
      memberEntry.boards.push({ id: board.id, title: board.title });

      // Tasks assigned to this member
      const memberTasks = tasks.filter((t) => t.assignee === slug);
      memberEntry.total_tasks += memberTasks.length;
      memberEntry.completed_tasks += memberTasks.filter((t) =>
        doneColumnIds.includes(t.column_id)
      ).length;
      memberEntry.in_progress_tasks += memberTasks.filter(
        (t) =>
          !doneColumnIds.includes(t.column_id) &&
          t.column_id !== firstColumnId
      ).length;

      // Timer durations for this member's tasks
      const memberTaskIds = memberTasks.map((t) => t.id);
      const memberExecLogs = execLogs.filter((l) =>
        memberTaskIds.includes(l.task_id)
      );
      memberEntry.timer_durations.push(
        ...memberExecLogs.map((l) => l.duration_ms || 0)
      );
    }

    // Stages aggregation
    const columnMap = {};
    for (const col of columns) {
      columnMap[col.id] = col;
    }

    for (const col of columns) {
      const normalizedTitle = col.title.toLowerCase().trim();
      if (!stageMap[normalizedTitle]) {
        stageMap[normalizedTitle] = {
          column_title: col.title,
          totalDays: 0,
          task_count: 0,
        };
      }

      const colTasks = tasks.filter(
        (t) => t.column_id === col.id && t.column_entered_at
      );

      for (const t of colTasks) {
        const days = doneColumnIds.includes(t.column_id)
          ? daysBetween(
              new Date(t.column_entered_at),
              new Date(t.column_entered_at)
            )
          : daysBetween(new Date(t.column_entered_at), now);
        stageMap[normalizedTitle].totalDays += days;
        stageMap[normalizedTitle].task_count += 1;
      }
    }

    // Alerts for this board
    if (overdueTasks.length > 0) {
      allAlerts.push({
        type: 'danger',
        message: `${overdueTasks.length} tarefa${overdueTasks.length > 1 ? 's' : ''} com prazo vencido`,
        board_title: board.title,
      });
    }

    const staleTasks = tasks.filter((t) => {
      if (doneColumnIds.includes(t.column_id)) return false;
      if (!t.column_entered_at) return false;
      return (
        daysBetween(new Date(t.column_entered_at), now) >=
        COLUMN_AGE_THRESHOLDS.warning
      );
    });

    const dangerStale = staleTasks.filter(
      (t) =>
        daysBetween(new Date(t.column_entered_at), now) >=
        COLUMN_AGE_THRESHOLDS.danger
    );
    if (dangerStale.length > 0) {
      allAlerts.push({
        type: 'danger',
        message: `${dangerStale.length} tarefa${dangerStale.length > 1 ? 's' : ''} parada${dangerStale.length > 1 ? 's' : ''} ha mais de ${COLUMN_AGE_THRESHOLDS.danger} dias`,
        board_title: board.title,
      });
    }

    const warningStale = staleTasks.filter((t) => {
      const days = daysBetween(new Date(t.column_entered_at), now);
      return (
        days >= COLUMN_AGE_THRESHOLDS.warning &&
        days < COLUMN_AGE_THRESHOLDS.danger
      );
    });
    if (warningStale.length > 0) {
      allAlerts.push({
        type: 'warning',
        message: `${warningStale.length} tarefa${warningStale.length > 1 ? 's' : ''} parada${warningStale.length > 1 ? 's' : ''} ha mais de ${COLUMN_AGE_THRESHOLDS.warning} dias`,
        board_title: board.title,
      });
    }

    // WIP limit violations
    for (const col of columns) {
      if (!col.wip_limit) continue;
      const count = tasks.filter((t) => t.column_id === col.id).length;
      if (count > col.wip_limit) {
        allAlerts.push({
          type: 'warning',
          message: `Coluna "${col.title}" excedeu o limite WIP (${count}/${col.wip_limit})`,
          board_title: board.title,
        });
      }
    }

    return {
      id: board.id,
      title: board.title,
      total_tasks: tasks.length,
      completed: doneTasks.length,
      in_progress: inProgressTasks.length,
      overdue: overdueTasks.length,
      member_count: members.length,
      avg_lead_time_days: avgLeadTime,
      velocity_week: velocityWeek,
    };
  });

  // Global metrics
  const uniqueMembers = Object.keys(memberMap).length;

  const avgLeadTimeGlobal =
    allLeadTimes.length > 0
      ? Math.round(
          (allLeadTimes.reduce((s, d) => s + d, 0) / allLeadTimes.length) * 10
        ) / 10
      : 0;

  const avgTimerGlobal =
    allTimerDurations.length > 0
      ? Math.round(
          allTimerDurations.reduce((s, d) => s + d, 0) /
            allTimerDurations.length /
            60000
        )
      : 0;

  const completionRate =
    totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  // Members output
  const membersOutput = Object.values(memberMap)
    .map((m) => {
      const avgTimerMin =
        m.timer_durations.length > 0
          ? Math.round(
              m.timer_durations.reduce((s, d) => s + d, 0) /
                m.timer_durations.length /
                60000
            )
          : 0;
      const rate =
        m.total_tasks > 0
          ? Math.round((m.completed_tasks / m.total_tasks) * 100)
          : 0;
      return {
        slug: m.slug,
        name: m.name,
        avatar_color: m.avatar_color,
        total_tasks: m.total_tasks,
        completed_tasks: m.completed_tasks,
        in_progress_tasks: m.in_progress_tasks,
        avg_timer_min: avgTimerMin,
        completion_rate: rate,
        boards: m.boards,
      };
    })
    .sort((a, b) => b.completed_tasks - a.completed_tasks);

  // Stages output
  const stagesOutput = Object.values(stageMap)
    .filter((s) => s.task_count > 0)
    .map((s) => ({
      column_title: s.column_title,
      avg_days: Math.round((s.totalDays / s.task_count) * 10) / 10,
      task_count: s.task_count,
    }));

  return NextResponse.json({
    global: {
      total_boards: boardIds.length,
      total_tasks: totalTasks,
      total_completed: totalCompleted,
      total_in_progress: totalInProgress,
      total_overdue: totalOverdue,
      total_members: uniqueMembers,
      avg_lead_time_days: avgLeadTimeGlobal,
      avg_timer_duration_min: avgTimerGlobal,
      completion_rate: completionRate,
    },
    boards: boardsSummary,
    members: membersOutput,
    stages: stagesOutput,
    alerts: allAlerts,
  });
}
