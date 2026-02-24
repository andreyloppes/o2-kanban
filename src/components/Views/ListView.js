'use client';

import { useMemo } from 'react';
import { Copy, BookOpen, Bug, Zap, Circle } from 'lucide-react';
import useBoardStore from '@/stores/useBoardStore';
import useUIStore from '@/stores/useUIStore';
import { TASK_TYPES, COLUMN_COLOR_MAP } from '@/lib/constants';
import Badge from '@/components/ui/Badge';
import DueDateBadge from '@/components/ui/DueDateBadge';
import styles from './ListView.module.css';

const TYPE_ICONS = {
  task: Copy,
  user_story: BookOpen,
  bug: Bug,
  epic: Zap,
  spike: Circle,
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

export default function ListView() {
  const columns = useBoardStore((state) => state.columns);
  const tasks = useBoardStore((state) => state.tasks);
  const members = useBoardStore((state) => state.members);
  const filters = useUIStore((state) => state.filters);

  const sortedColumns = useMemo(
    () => [...columns].sort((a, b) => a.position - b.position),
    [columns]
  );

  const filteredTasks = useMemo(
    () => getFilteredTasks(tasks, filters),
    [tasks, filters]
  );

  const memberMap = useMemo(() => {
    const map = {};
    members.forEach((m) => {
      if (m.user) map[m.user.slug] = m.user;
    });
    return map;
  }, [members]);

  const groupedByColumn = useMemo(() => {
    return sortedColumns.map((col) => ({
      column: col,
      tasks: filteredTasks
        .filter((t) => t.column_id === col.id)
        .sort((a, b) => a.position - b.position),
    }));
  }, [sortedColumns, filteredTasks]);

  function handleRowClick(taskId) {
    useUIStore.getState().openTaskModal(taskId);
  }

  return (
    <div className={styles.container}>
      <div className={styles.table}>
        <div className={styles.thead}>
          <div className={styles.thStatus} />
          <div className={styles.thTitle}>Titulo</div>
          <div className={styles.thType}>Tipo</div>
          <div className={styles.thPriority}>Prioridade</div>
          <div className={styles.thAssignee}>Responsavel</div>
          <div className={styles.thDueDate}>Prazo</div>
          <div className={styles.thColumn}>Coluna</div>
        </div>

        {groupedByColumn.map(({ column, tasks: colTasks }) => {
          if (colTasks.length === 0) return null;
          const colorClass = COLUMN_COLOR_MAP[column.color] || 'status-backlog';
          return (
            <div key={column.id} className={styles.group}>
              <div className={styles.groupHeader}>
                <span className={`status-dot ${colorClass}`} />
                <span className={styles.groupTitle}>{column.title}</span>
                <span className={styles.groupCount}>{colTasks.length}</span>
              </div>
              {colTasks.map((task) => {
                const TypeIcon = TYPE_ICONS[task.type] || Copy;
                const typeLabel = TASK_TYPES[task.type] || task.type;
                const user = task.assignee ? memberMap[task.assignee] : null;
                return (
                  <div
                    key={task.id}
                    className={styles.row}
                    onClick={() => handleRowClick(task.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleRowClick(task.id)}
                  >
                    <div className={styles.cellStatus}>
                      <span className={`status-dot ${colorClass}`} />
                    </div>
                    <div className={styles.cellTitle}>{task.title}</div>
                    <div className={styles.cellType}>
                      <TypeIcon size={14} />
                      <span>{typeLabel}</span>
                    </div>
                    <div className={styles.cellPriority}>
                      {task.priority && <Badge priority={task.priority} size="sm" />}
                    </div>
                    <div className={styles.cellAssignee}>
                      {user ? (
                        <>
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.name}
                              className={styles.avatarImg}
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span
                              className={styles.avatar}
                              style={{ backgroundColor: user.avatar_color || '#6b7280' }}
                            >
                              {user.name.charAt(0)}
                            </span>
                          )}
                          <span className={styles.assigneeName}>{user.name}</span>
                        </>
                      ) : task.assignee ? (
                        <>
                          <span className={styles.avatar}>{task.assignee.charAt(0).toUpperCase()}</span>
                          <span className={styles.assigneeName}>{task.assignee}</span>
                        </>
                      ) : (
                        <span className={styles.noAssignee}>—</span>
                      )}
                    </div>
                    <div className={styles.cellDueDate}>
                      <DueDateBadge dueDate={task.due_date} size="sm" />
                    </div>
                    <div className={styles.cellColumn}>{column.title}</div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className={styles.empty}>Nenhuma tarefa encontrada</div>
        )}
      </div>
    </div>
  );
}
