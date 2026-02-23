'use client';

import { TASK_PRIORITIES } from '@/lib/constants';
import styles from './TaskDistribution.module.css';

const COLUMN_COLOR_VALUES = {
  neutral: '#6b7280',
  info: '#818cf8',
  danger: '#f87171',
  progress: '#a78bfa',
  review: '#2dd4bf',
  done: '#4ade80',
  success: '#4ade80',
};

const PRIORITY_COLOR_VALUES = {
  low: '#8b95a5',
  medium: '#fbbf24',
  high: '#fb923c',
  urgent: '#f87171',
};

function StackedBar({ segments, total }) {
  if (total === 0) {
    return (
      <div className={styles.barEmpty}>
        <span className={styles.barEmptyText}>Nenhuma tarefa</span>
      </div>
    );
  }

  return (
    <div className={styles.barContainer}>
      <div className={styles.bar}>
        {segments.map((seg, i) => {
          if (seg.count === 0) return null;
          const pct = (seg.count / total) * 100;
          return (
            <div
              key={i}
              className={styles.barSegment}
              style={{
                width: `${pct}%`,
                backgroundColor: seg.color,
              }}
              title={`${seg.label}: ${seg.count}`}
            />
          );
        })}
      </div>
      <div className={styles.barLegend}>
        {segments
          .filter((s) => s.count > 0)
          .map((seg, i) => (
            <div key={i} className={styles.legendItem}>
              <span
                className={styles.legendDot}
                style={{ backgroundColor: seg.color }}
              />
              <span className={styles.legendLabel}>{seg.label}</span>
              <span className={styles.legendCount}>{seg.count}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

export default function TaskDistribution({ overview }) {
  const columnSegments = overview.tasks_by_column.map((col) => ({
    label: col.column_title,
    count: col.count,
    color: COLUMN_COLOR_VALUES[col.color] || '#6b7280',
  }));

  const prioritySegments = Object.entries(overview.tasks_by_priority).map(
    ([key, count]) => ({
      label: TASK_PRIORITIES[key] || key,
      count,
      color: PRIORITY_COLOR_VALUES[key] || '#6b7280',
    })
  );

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Distribuicao por Coluna</h3>
        <StackedBar segments={columnSegments} total={overview.total_tasks} />
      </div>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Distribuicao por Prioridade</h3>
        <StackedBar segments={prioritySegments} total={overview.total_tasks} />
      </div>
    </div>
  );
}
