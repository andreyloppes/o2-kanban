'use client';

import { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useBoardStore from '@/stores/useBoardStore';
import useUIStore from '@/stores/useUIStore';
import { COLUMN_COLOR_MAP } from '@/lib/constants';
import styles from './CalendarView.module.css';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

const PRIORITY_DOT_COLORS = {
  urgent: '#f87171',
  high: '#fb923c',
  medium: '#fbbf24',
  low: '#94a3b8',
};

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

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export default function CalendarView() {
  const tasks = useBoardStore((state) => state.tasks);
  const columns = useBoardStore((state) => state.columns);
  const filters = useUIStore((state) => state.filters);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [expandedDay, setExpandedDay] = useState(null);
  const [direction, setDirection] = useState(0);

  const filteredTasks = useMemo(
    () => getFilteredTasks(tasks, filters),
    [tasks, filters]
  );

  const { datedTasks, undatedCount } = useMemo(() => {
    const dated = filteredTasks.filter((t) => t.due_date);
    const undated = filteredTasks.filter((t) => !t.due_date);
    return { datedTasks: dated, undatedCount: undated.length };
  }, [filteredTasks]);

  // Map: 'YYYY-MM-DD' → task[]
  const tasksByDate = useMemo(() => {
    const map = {};
    datedTasks.forEach((t) => {
      if (!map[t.due_date]) map[t.due_date] = [];
      map[t.due_date].push(t);
    });
    return map;
  }, [datedTasks]);

  const columnMap = useMemo(() => {
    const map = {};
    columns.forEach((c) => (map[c.id] = c));
    return map;
  }, [columns]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  // Build calendar grid cells
  const calendarCells = useMemo(() => {
    const cells = [];
    // Empty cells for days before the 1st
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push({ type: 'empty', key: `empty-${i}` });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        type: 'day',
        key: dateStr,
        day: d,
        dateStr,
        tasks: tasksByDate[dateStr] || [],
      });
    }
    return cells;
  }, [viewYear, viewMonth, daysInMonth, firstDayOfWeek, tasksByDate]);

  function prevMonth() {
    setDirection(-1);
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
    setExpandedDay(null);
  }

  function nextMonth() {
    setDirection(1);
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
    setExpandedDay(null);
  }

  function handleTaskClick(e, taskId) {
    e.stopPropagation();
    useUIStore.getState().openTaskModal(taskId);
  }

  function handleMoreClick(e, dateStr) {
    e.stopPropagation();
    setExpandedDay(expandedDay === dateStr ? null : dateStr);
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const MAX_VISIBLE = 3;

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.nav}>
        <button className={styles.navBtn} onClick={prevMonth} aria-label="Mes anterior">
          <ChevronLeft size={18} />
        </button>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.span
            key={`${viewYear}-${viewMonth}`}
            className={styles.navLabel}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            {MONTH_NAMES[viewMonth]} {viewYear}
          </motion.span>
        </AnimatePresence>
        <button className={styles.navBtn} onClick={nextMonth} aria-label="Proximo mes">
          <ChevronRight size={18} />
        </button>
      </div>

      {undatedCount > 0 && (
        <div className={styles.undatedBanner}>
          <AlertCircle size={14} />
          <span>{undatedCount} tarefa{undatedCount !== 1 ? 's' : ''} sem prazo</span>
        </div>
      )}

      {/* Day labels */}
      <div className={styles.dayLabels}>
        {DAY_LABELS.map((label) => (
          <div key={label} className={styles.dayLabel}>{label}</div>
        ))}
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {calendarCells.map((cell) => {
          if (cell.type === 'empty') {
            return <div key={cell.key} className={styles.cellEmpty} />;
          }

          const isToday = cell.dateStr === todayStr;
          const isExpanded = expandedDay === cell.dateStr;
          const visibleTasks = isExpanded ? cell.tasks : cell.tasks.slice(0, MAX_VISIBLE);
          const extraCount = cell.tasks.length - MAX_VISIBLE;

          return (
            <div
              key={cell.key}
              className={`${styles.cell} ${isToday ? styles.cellToday : ''} ${isExpanded ? styles.cellExpanded : ''}`}
            >
              <span className={`${styles.dayNumber} ${isToday ? styles.dayNumberToday : ''}`}>
                {cell.day}
              </span>
              <div className={styles.taskList}>
                {visibleTasks.map((task) => {
                  const col = columnMap[task.column_id];
                  const colorClass = col ? COLUMN_COLOR_MAP[col.color] || 'status-backlog' : 'status-backlog';
                  const dotColor = PRIORITY_DOT_COLORS[task.priority] || '#94a3b8';
                  return (
                    <div
                      key={task.id}
                      className={styles.miniCard}
                      onClick={(e) => handleTaskClick(e, task.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleTaskClick(e, task.id)}
                      title={task.title}
                    >
                      <span className={styles.priorityDot} style={{ backgroundColor: dotColor }} />
                      <span className={styles.miniTitle}>{task.title}</span>
                    </div>
                  );
                })}
                {!isExpanded && extraCount > 0 && (
                  <button
                    className={styles.moreBtn}
                    onClick={(e) => handleMoreClick(e, cell.dateStr)}
                  >
                    +{extraCount} mais
                  </button>
                )}
                {isExpanded && extraCount > 0 && (
                  <button
                    className={styles.moreBtn}
                    onClick={(e) => handleMoreClick(e, cell.dateStr)}
                  >
                    Recolher
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {datedTasks.length === 0 && undatedCount === 0 && (
        <div className={styles.empty}>Nenhuma tarefa encontrada</div>
      )}
    </div>
  );
}
