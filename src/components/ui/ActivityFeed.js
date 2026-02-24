'use client';

import { useState, useEffect } from 'react';
import { Clock, ArrowRight, MessageSquare, Plus, Trash2, Edit3, Move } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import styles from './ActivityFeed.module.css';

const ACTION_CONFIG = {
  task_created: { icon: Plus, label: 'criou a tarefa', color: 'var(--color-success)' },
  task_updated: { icon: Edit3, label: 'atualizou', color: 'var(--color-info)' },
  task_moved: { icon: Move, label: 'moveu para', color: 'var(--color-progress)' },
  task_deleted: { icon: Trash2, label: 'excluiu a tarefa', color: 'var(--color-danger)' },
  comment_added: { icon: MessageSquare, label: 'comentou', color: 'var(--accent)' },
  assignee_changed: { icon: ArrowRight, label: 'atribuiu para', color: 'var(--color-review)' },
  priority_changed: { icon: Edit3, label: 'alterou prioridade', color: 'var(--color-warning)' },
  status_changed: { icon: Move, label: 'moveu', color: 'var(--color-progress)' },
};

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function ActivityFeed({ boardId, taskId = null, limit = 20 }) {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!boardId) return;
    let url = `/api/boards/${boardId}/activity?limit=${limit}`;
    if (taskId) url += `&task_id=${taskId}`;

    fetch(url)
      .then((res) => res.ok ? res.json() : { activities: [] })
      .then((data) => setActivities(data.activities || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [boardId, taskId, limit]);

  if (isLoading) {
    return <div className={styles.loading}>Carregando atividades...</div>;
  }

  if (activities.length === 0) {
    return <div className={styles.empty}>Nenhuma atividade registrada</div>;
  }

  return (
    <div className={styles.feed}>
      <h3 className={styles.title}>
        <Clock size={14} />
        Atividade
      </h3>
      <div className={styles.timeline}>
        {activities.map((activity) => {
          const config = ACTION_CONFIG[activity.action] || ACTION_CONFIG.task_updated;
          const Icon = config.icon;
          const user = activity.user;
          return (
            <div key={activity.id} className={styles.item}>
              <div className={styles.iconWrap} style={{ color: config.color }}>
                <Icon size={12} />
              </div>
              <div className={styles.content}>
                <span className={styles.actor}>{user?.name || 'Sistema'}</span>
                <span className={styles.action}>{config.label}</span>
                {activity.field_name && (
                  <span className={styles.field}>{activity.field_name}</span>
                )}
                {activity.old_value && activity.new_value && (
                  <span className={styles.change}>
                    <span className={styles.oldValue}>{activity.old_value}</span>
                    <ArrowRight size={10} />
                    <span className={styles.newValue}>{activity.new_value}</span>
                  </span>
                )}
                {activity.new_value && !activity.old_value && (
                  <span className={styles.newValue}>{activity.new_value}</span>
                )}
              </div>
              <span className={styles.time}>{timeAgo(activity.created_at)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
