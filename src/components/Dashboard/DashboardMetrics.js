'use client';

import {
  LayoutDashboard,
  ListChecks,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  Clock,
  Timer,
  Users,
} from 'lucide-react';
import styles from './DashboardMetrics.module.css';

function formatTimerDuration(minutes) {
  if (!minutes || minutes <= 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function MetricCard({ icon: Icon, label, value, danger }) {
  return (
    <div className={styles.card}>
      <div className={`${styles.cardIcon} ${danger ? styles.cardIconDanger : ''}`}>
        <Icon size={20} />
      </div>
      <div className={styles.cardBody}>
        <span className={`${styles.cardValue} ${danger ? styles.cardValueDanger : ''}`}>
          {value}
        </span>
        <span className={styles.cardLabel}>{label}</span>
      </div>
    </div>
  );
}

export default function DashboardMetrics({ global }) {
  return (
    <div className={styles.grid}>
      <MetricCard
        icon={LayoutDashboard}
        label="Boards"
        value={global.total_boards}
      />
      <MetricCard
        icon={ListChecks}
        label="Total de Tarefas"
        value={global.total_tasks}
      />
      <MetricCard
        icon={TrendingUp}
        label="Taxa de Conclusao"
        value={`${global.completion_rate}%`}
      />
      <MetricCard
        icon={ArrowRight}
        label="Em Progresso"
        value={global.total_in_progress}
      />
      <MetricCard
        icon={AlertTriangle}
        label="Atrasadas"
        value={global.total_overdue}
        danger={global.total_overdue > 0}
      />
      <MetricCard
        icon={Clock}
        label="Lead Time Medio"
        value={`${global.avg_lead_time_days} dias`}
      />
      <MetricCard
        icon={Timer}
        label="Timer Medio"
        value={formatTimerDuration(global.avg_timer_duration_min)}
      />
      <MetricCard
        icon={Users}
        label="Membros Ativos"
        value={global.total_members}
      />
    </div>
  );
}
