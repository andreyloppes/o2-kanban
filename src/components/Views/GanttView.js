'use client';

import { useState, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useBoardStore from '@/stores/useBoardStore';
import useUIStore from '@/stores/useUIStore';
import { COLUMN_COLOR_MAP } from '@/lib/constants';
import styles from './GanttView.module.css';

const COLUMN_HEX = {
  neutral: '#6b7280',
  info: '#3b82f6',
  danger: '#ef4444',
  progress: '#f59e0b',
  review: '#a78bfa',
  done: '#10b981',
  success: '#10b981',
};

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function daysBetween(startStr, endStr) {
  const s = new Date(startStr + 'T00:00:00');
  const e = new Date(endStr + 'T00:00:00');
  return Math.round((e - s) / (1000 * 60 * 60 * 24));
}

function getFilteredTasks(tasks, filters) {
  let result = tasks;
  if (filters.type) result = result.filter((t) => t.type === filters.type);
  if (filters.priority) result = result.filter((t) => t.priority === filters.priority);
  if (filters.assignee) {
    if (filters.assignee === '__unassigned__') {
      result = result.filter((t) => !t.assignee);
    } else {
      result = result.filter((t) => t.assignee === filters.assignee);
    }
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
    );
  }
  return result;
}

export default function GanttView() {
  const columns = useBoardStore((state) => state.columns);
  const tasks = useBoardStore((state) => state.tasks);
  const filters = useUIStore((state) => state.filters);
  const scrollRef = useRef(null);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const sortedColumns = useMemo(
    () => [...columns].sort((a, b) => a.position - b.position),
    [columns]
  );

  const filteredTasks = useMemo(
    () => getFilteredTasks(tasks, filters),
    [tasks, filters]
  );

  const { datedTasks, undatedTasks } = useMemo(() => {
    const dated = [];
    const undated = [];
    filteredTasks.forEach((t) => {
      if (t.due_date || t.start_date) {
        dated.push(t);
      } else {
        undated.push(t);
      }
    });
    return { datedTasks: dated, undatedTasks: undated };
  }, [filteredTasks]);

  const groupedDated = useMemo(() => {
    return sortedColumns
      .map((col) => ({
        column: col,
        tasks: datedTasks
          .filter((t) => t.column_id === col.id)
          .sort((a, b) => a.position - b.position),
      }))
      .filter((g) => g.tasks.length > 0);
  }, [sortedColumns, datedTasks]);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  function getBarStyle(task) {
    const start = task.start_date || task.due_date;
    const end = task.due_date || task.start_date;

    const startDate = new Date(start + 'T00:00:00');
    const endDate = new Date(end + 'T00:00:00');
    const monthStart = new Date(viewYear, viewMonth, 1);
    const monthEnd = new Date(viewYear, viewMonth, daysInMonth);

    // Skip if entirely outside this month
    if (endDate < monthStart || startDate > monthEnd) return null;

    const visibleStart = startDate < monthStart ? 1 : startDate.getDate();
    const visibleEnd = endDate > monthEnd ? daysInMonth : endDate.getDate();
    const span = visibleEnd - visibleStart + 1;

    const left = ((visibleStart - 1) / daysInMonth) * 100;
    const width = (span / daysInMonth) * 100;

    const col = columns.find((c) => c.id === task.column_id);
    const color = col ? COLUMN_HEX[col.color] || '#6b7280' : '#6b7280';

    return { left: `${left}%`, width: `${width}%`, backgroundColor: color };
  }

  const todayDay =
    today.getFullYear() === viewYear && today.getMonth() === viewMonth
      ? today.getDate()
      : null;
  const todayLineLeft = todayDay ? ((todayDay - 0.5) / daysInMonth) * 100 : null;

  function handleBarClick(taskId) {
    useUIStore.getState().openTaskModal(taskId);
  }

  return (
    <div className={styles.container}>
      <div className={styles.nav}>
        <button className={styles.navBtn} onClick={prevMonth} aria-label="Mes anterior">
          <ChevronLeft size={18} />
        </button>
        <span className={styles.navLabel}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button className={styles.navBtn} onClick={nextMonth} aria-label="Proximo mes">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className={styles.gantt} ref={scrollRef}>
        {/* Day headers */}
        <div className={styles.sideHeader} />
        <div className={styles.dayHeaders} style={{ gridTemplateColumns: `repeat(${daysInMonth}, 1fr)` }}>
          {days.map((d) => {
            const dow = new Date(viewYear, viewMonth, d).getDay();
            const isWeekend = dow === 0 || dow === 6;
            const isToday = d === todayDay;
            return (
              <div
                key={d}
                className={`${styles.dayHeader} ${isWeekend ? styles.weekend : ''} ${isToday ? styles.todayHeader : ''}`}
              >
                <span className={styles.dayName}>{DAY_NAMES[dow]}</span>
                <span className={styles.dayNum}>{d}</span>
              </div>
            );
          })}
        </div>

        {/* Rows */}
        {groupedDated.map(({ column, tasks: colTasks }) => {
          const colorClass = COLUMN_COLOR_MAP[column.color] || 'status-backlog';
          return (
            <div key={column.id} className={styles.groupBlock}>
              <div className={styles.groupLabel}>
                <span className={`status-dot ${colorClass}`} />
                <span>{column.title}</span>
              </div>
              {colTasks.map((task) => {
                const barStyle = getBarStyle(task);
                return (
                  <div key={task.id} className={styles.row}>
                    <div className={styles.rowLabel} title={task.title}>
                      {task.title}
                    </div>
                    <div className={styles.rowTimeline}>
                      {/* Weekend stripes */}
                      {days.map((d) => {
                        const dow = new Date(viewYear, viewMonth, d).getDay();
                        if (dow !== 0 && dow !== 6) return null;
                        const left = ((d - 1) / daysInMonth) * 100;
                        return (
                          <div
                            key={d}
                            className={styles.weekendStripe}
                            style={{ left: `${left}%`, width: `${100 / daysInMonth}%` }}
                          />
                        );
                      })}
                      {/* Today line */}
                      {todayLineLeft !== null && (
                        <div
                          className={styles.todayLine}
                          style={{ left: `${todayLineLeft}%` }}
                        />
                      )}
                      {/* Bar */}
                      {barStyle && (
                        <div
                          className={styles.bar}
                          style={barStyle}
                          onClick={() => handleBarClick(task.id)}
                          title={`${task.title}${task.start_date ? `\nInicio: ${task.start_date}` : ''}${task.due_date ? `\nPrazo: ${task.due_date}` : ''}${task.assignee ? `\nResponsavel: ${task.assignee}` : ''}`}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && handleBarClick(task.id)}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Undated tasks */}
        {undatedTasks.length > 0 && (
          <div className={styles.undatedSection}>
            <div className={styles.undatedHeader}>
              Sem datas ({undatedTasks.length})
            </div>
            {undatedTasks.map((task) => (
              <div
                key={task.id}
                className={styles.undatedRow}
                onClick={() => handleBarClick(task.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleBarClick(task.id)}
              >
                {task.title}
              </div>
            ))}
          </div>
        )}

        {datedTasks.length === 0 && undatedTasks.length === 0 && (
          <div className={styles.empty}>Nenhuma tarefa encontrada</div>
        )}
      </div>
    </div>
  );
}
