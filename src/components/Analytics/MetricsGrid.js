'use client';

import {
  ListChecks,
  CheckCircle2,
  Clock,
  Timer,
  AlertTriangle,
  UserX,
} from 'lucide-react';
import styles from './MetricsGrid.module.css';

function formatTimerDuration(minutes) {
  if (!minutes || minutes <= 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function MetricCard({ icon: Icon, label, value, subtitle }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardIcon}>
        <Icon size={20} />
      </div>
      <div className={styles.cardBody}>
        <span className={styles.cardValue}>{value}</span>
        <span className={styles.cardLabel}>{label}</span>
        {subtitle && <span className={styles.cardSubtitle}>{subtitle}</span>}
      </div>
    </div>
  );
}

export default function MetricsGrid({ overview, velocity, timing, health }) {
  return (
    <div className={styles.grid}>
      <MetricCard
        icon={ListChecks}
        label="Total de Tarefas"
        value={overview.total_tasks}
      />
      <MetricCard
        icon={CheckCircle2}
        label="Concluidas esta Semana"
        value={velocity.completed_this_week}
        subtitle={`${velocity.avg_completion_per_week}/semana em media`}
      />
      <MetricCard
        icon={Clock}
        label="Lead Time Medio"
        value={`${timing.avg_lead_time_days} dias`}
      />
      <MetricCard
        icon={Timer}
        label="Tempo Medio no Timer"
        value={formatTimerDuration(timing.avg_timer_duration_min)}
      />
      <MetricCard
        icon={AlertTriangle}
        label="Tarefas Atrasadas"
        value={health.tasks_overdue}
      />
      <MetricCard
        icon={UserX}
        label="Sem Responsavel"
        value={health.tasks_without_assignee}
      />
    </div>
  );
}
