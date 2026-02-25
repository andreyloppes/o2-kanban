'use client';

import { useMemo } from 'react';
import { Users, AlertCircle, Clock } from 'lucide-react';
import useTodoStore from '@/stores/useTodoStore';
import styles from './TeamView.module.css';

function MemberCard({ member, tasks }) {
  const today = new Date().toISOString().split('T')[0];
  const activeTasks = tasks.filter((t) => !t.is_done);
  const urgentTasks = activeTasks.filter((t) => t.priority === 'urgent');
  const overdueTasks = activeTasks.filter((t) => t.due_date && t.due_date < today);
  const doneTasks = tasks.filter((t) => t.is_done);
  const completionRate = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0;
  const topTasks = activeTasks.slice(0, 5);

  const initials = member.name
    ? member.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : member.slug?.slice(0, 2).toUpperCase() || '??';

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div
          className={styles.avatar}
          style={{ background: member.avatar_color || '#6b7280' }}
        >
          {initials}
        </div>
        <div className={styles.memberInfo}>
          <span className={styles.memberName}>{member.name || member.slug}</span>
          <span className={styles.memberSlug}>@{member.slug}</span>
        </div>
      </div>

      <div className={styles.counters}>
        <div className={styles.counter}>
          <span className={styles.counterValue}>{activeTasks.length}</span>
          <span className={styles.counterLabel}>Em progresso</span>
        </div>
        <div className={styles.counter}>
          <AlertCircle size={14} color={urgentTasks.length > 0 ? '#ef4444' : 'var(--text-muted)'} />
          <span className={styles.counterValue} style={{ color: urgentTasks.length > 0 ? '#ef4444' : 'inherit' }}>
            {urgentTasks.length}
          </span>
          <span className={styles.counterLabel}>Urgentes</span>
        </div>
        <div className={styles.counter}>
          <Clock size={14} color={overdueTasks.length > 0 ? '#f97316' : 'var(--text-muted)'} />
          <span className={styles.counterValue} style={{ color: overdueTasks.length > 0 ? '#f97316' : 'inherit' }}>
            {overdueTasks.length}
          </span>
          <span className={styles.counterLabel}>Vencidas</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className={styles.progressSection}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span className={styles.progressLabel}>Conclusao</span>
          <span className={styles.progressPct}>{completionRate}%</span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Top tasks */}
      {topTasks.length > 0 && (
        <div className={styles.taskList}>
          {topTasks.map((task) => (
            <div key={task.id} className={styles.taskItem}>
              <span
                className={styles.taskPriorityDot}
                style={{
                  background: task.priority === 'urgent' ? '#ef4444' :
                               task.priority === 'high' ? '#f97316' :
                               task.priority === 'medium' ? '#eab308' : '#6b7280'
                }}
              />
              <span className={styles.taskTitle}>{task.title}</span>
              {task.board_title && (
                <span className={styles.taskBoard}>{task.board_title}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TeamView() {
  const { teamTasks, teamMembers, isLoading } = useTodoStore();

  const memberMap = useMemo(() => {
    const seen = new Set();
    const map = {};
    for (const m of teamMembers) {
      if (!m.slug || seen.has(m.slug)) continue;
      seen.add(m.slug);
      map[m.slug] = { ...m };
    }
    return map;
  }, [teamMembers]);

  const tasksByMember = useMemo(() => {
    const map = {};
    for (const task of teamTasks) {
      if (!task.assignee) continue;
      if (!map[task.assignee]) map[task.assignee] = [];
      map[task.assignee].push(task);
    }
    return map;
  }, [teamTasks]);

  if (isLoading) {
    return (
      <div className={styles.grid}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.cardSkeleton} />
        ))}
      </div>
    );
  }

  const members = Object.values(memberMap);

  if (members.length === 0) {
    return (
      <div className={styles.empty}>
        <Users size={40} color="var(--text-muted)" />
        <p>Nenhum membro encontrado.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {members.map((member) => (
        <MemberCard
          key={member.slug}
          member={member}
          tasks={tasksByMember[member.slug] || []}
        />
      ))}
    </div>
  );
}
