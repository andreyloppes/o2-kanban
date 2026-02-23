'use client';

import styles from './MemberPerformance.module.css';

function formatTimerDuration(minutes) {
  if (!minutes || minutes <= 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function MemberCard({ member }) {
  const initial = (member.name || member.slug || '?')[0].toUpperCase();
  const progressPct =
    member.total_tasks > 0
      ? (member.completed_tasks / member.total_tasks) * 100
      : 0;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div
          className={styles.avatar}
          style={{ backgroundColor: member.avatar_color }}
        >
          {initial}
        </div>
        <div className={styles.memberInfo}>
          <span className={styles.memberName}>{member.name}</span>
          <span className={styles.memberRate}>
            {member.completion_rate}% concluido
          </span>
        </div>
      </div>

      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Tarefas</span>
          <span className={styles.statValue}>{member.total_tasks}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Concluidas</span>
          <span className={styles.statValue}>{member.completed_tasks}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Em Progresso</span>
          <span className={styles.statValue}>{member.in_progress_tasks}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Timer Medio</span>
          <span className={styles.statValue}>
            {formatTimerDuration(member.avg_timer_min)}
          </span>
        </div>
      </div>

      {member.boards && member.boards.length > 0 && (
        <div className={styles.badges}>
          {member.boards.map((b) => (
            <span key={b.id} className={styles.badge}>
              {b.title}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MemberPerformance({ members }) {
  if (!members || members.length === 0) return null;

  return (
    <div>
      <h3 className={styles.sectionTitle}>Performance por Membro</h3>
      <div className={styles.grid}>
        {members.map((member) => (
          <MemberCard key={member.slug} member={member} />
        ))}
      </div>
    </div>
  );
}
