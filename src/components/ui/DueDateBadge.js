'use client';

import { AlertCircle, Clock, Calendar } from 'lucide-react';
import { getDueDateStatus, getDueDateLabel, formatDueDateShort } from '@/lib/dateUtils';
import styles from './DueDateBadge.module.css';

const STATUS_CONFIG = {
  overdue: { icon: AlertCircle, className: 'overdue' },
  today: { icon: Clock, className: 'today' },
  soon: { icon: Calendar, className: 'soon' },
  future: { icon: Calendar, className: 'future' },
};

/**
 * Badge de data de vencimento com cor semantica.
 * @param {Object} props
 * @param {string|null} props.dueDate - Data YYYY-MM-DD ou null
 * @param {'sm'|'md'} [props.size='sm']
 */
export default function DueDateBadge({ dueDate, size = 'sm' }) {
  if (!dueDate) return null;

  const status = getDueDateStatus(dueDate);
  if (!status) return null;

  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 12 : 14;

  const label = getDueDateLabel(status);
  const dateFormatted = formatDueDateShort(dueDate);

  // Texto exibido depende do status e tamanho
  let displayText;
  if (status === 'overdue') {
    displayText = 'Vencido';
  } else if (status === 'today') {
    displayText = 'Hoje';
  } else {
    displayText = dateFormatted;
  }

  const ariaLabel = label || dateFormatted;

  return (
    <span
      className={`${styles.badge} ${styles[config.className]} ${styles[size]}`}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <Icon size={iconSize} className={styles.icon} />
      <span>{displayText}</span>
    </span>
  );
}
