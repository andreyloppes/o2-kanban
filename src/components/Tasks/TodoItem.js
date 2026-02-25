'use client';

import { Calendar, AlertTriangle, ExternalLink } from 'lucide-react';
import useTodoStore from '@/stores/useTodoStore';
import styles from './TodoItem.module.css';

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgente', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  high:   { label: 'Alta',    color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  medium: { label: 'Media',   color: '#eab308', bg: 'rgba(234,179,8,0.12)' },
  low:    { label: 'Baixa',   color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (d.getTime() === today.getTime()) return 'Hoje';
  if (d.getTime() === tomorrow.getTime()) return 'Amanha';

  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr + 'T00:00:00') < today;
}

export default function TodoItem({ item, isTodo = false }) {
  const { toggleTodoDone, updateTodo } = useTodoStore();

  const isDone = isTodo ? item.status === 'done' : item.is_done;
  const priority = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.medium;
  const dateLabel = formatDate(item.due_date);
  const overdue = !isDone && isOverdue(item.due_date);

  const handleToggle = () => {
    if (isTodo) {
      toggleTodoDone(item.id);
    }
    // Para board tasks, toggle não é suportado aqui (precisaria mover de coluna)
  };

  return (
    <div className={`${styles.item} ${isDone ? styles.done : ''}`}>
      <button
        className={`${styles.checkbox} ${isDone ? styles.checkboxDone : ''} ${!isTodo ? styles.checkboxReadonly : ''}`}
        onClick={isTodo ? handleToggle : undefined}
        aria-label={isDone ? 'Marcar como pendente' : 'Marcar como concluido'}
        disabled={!isTodo}
      >
        {isDone && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      <div className={styles.body}>
        <span className={`${styles.title} ${isDone ? styles.titleDone : ''}`}>
          {item.title}
        </span>
        <div className={styles.meta}>
          {/* Board badge */}
          {(item.board_title || item.boards?.title) && (
            <span className={styles.boardBadge}>
              {item.board_title || item.boards?.title}
            </span>
          )}

          {/* Priority badge */}
          <span
            className={styles.priorityBadge}
            style={{ color: priority.color, background: priority.bg }}
          >
            {item.priority === 'urgent' && <AlertTriangle size={10} />}
            {priority.label}
          </span>

          {/* Due date */}
          {dateLabel && (
            <span
              className={`${styles.dateBadge} ${overdue ? styles.dateOverdue : ''}`}
            >
              <Calendar size={11} />
              {dateLabel}
            </span>
          )}

          {/* Assignee (board tasks) */}
          {!isTodo && item.assignee && (
            <span className={styles.assigneeBadge}>@{item.assignee}</span>
          )}

          {/* Column (board tasks) */}
          {!isTodo && item.column_title && (
            <span className={styles.columnBadge}>{item.column_title}</span>
          )}
        </div>
      </div>

      {/* Link para board task */}
      {!isTodo && item.board_id && (
        <a
          href={`/board/${item.board_id}`}
          className={styles.linkBtn}
          title="Abrir board"
          target="_blank"
          rel="noreferrer"
        >
          <ExternalLink size={14} />
        </a>
      )}
    </div>
  );
}
