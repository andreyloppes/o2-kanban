'use client';

import { useMemo, useState } from 'react';
import { Copy, BookOpen, Bug, Zap, Circle, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import useBoardStore from '@/stores/useBoardStore';
import useUIStore from '@/stores/useUIStore';
import { TASK_TYPES, TASK_PRIORITIES, COLUMN_COLOR_MAP } from '@/lib/constants';
import Badge from '@/components/ui/Badge';
import DueDateBadge from '@/components/ui/DueDateBadge';
import styles from './TableView.module.css';

const TYPE_ICONS = {
  task: Copy,
  user_story: BookOpen,
  bug: Bug,
  epic: Zap,
  spike: Circle,
};

const SORTABLE_COLUMNS = [
  { key: 'title', label: 'Titulo' },
  { key: 'type', label: 'Tipo' },
  { key: 'priority', label: 'Prioridade' },
  { key: 'assignee', label: 'Responsavel' },
  { key: 'due_date', label: 'Prazo' },
  { key: 'story_points', label: 'Pontos' },
  { key: 'column', label: 'Coluna' },
];

const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 };

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

function sortTasks(tasks, sortField, sortDirection, columnMap) {
  if (!sortField) return tasks;

  return [...tasks].sort((a, b) => {
    let valA, valB;

    switch (sortField) {
      case 'title':
        valA = (a.title || '').toLowerCase();
        valB = (b.title || '').toLowerCase();
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);

      case 'type':
        valA = TASK_TYPES[a.type] || a.type || '';
        valB = TASK_TYPES[b.type] || b.type || '';
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);

      case 'priority':
        valA = PRIORITY_ORDER[a.priority] ?? 99;
        valB = PRIORITY_ORDER[b.priority] ?? 99;
        return sortDirection === 'asc' ? valA - valB : valB - valA;

      case 'assignee':
        valA = (a.assignee || '').toLowerCase();
        valB = (b.assignee || '').toLowerCase();
        if (!valA && !valB) return 0;
        if (!valA) return 1;
        if (!valB) return -1;
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);

      case 'due_date':
        valA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        valB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
        return sortDirection === 'asc' ? valA - valB : valB - valA;

      case 'story_points':
        valA = a.story_points ?? -1;
        valB = b.story_points ?? -1;
        return sortDirection === 'asc' ? valA - valB : valB - valA;

      case 'column': {
        const colA = columnMap[a.column_id];
        const colB = columnMap[b.column_id];
        valA = colA ? colA.position : 999;
        valB = colB ? colB.position : 999;
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      default:
        return 0;
    }
  });
}

export default function TableView() {
  const columns = useBoardStore((state) => state.columns);
  const tasks = useBoardStore((state) => state.tasks);
  const members = useBoardStore((state) => state.members);
  const filters = useUIStore((state) => state.filters);

  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const columnMap = useMemo(() => {
    const map = {};
    columns.forEach((col) => {
      map[col.id] = col;
    });
    return map;
  }, [columns]);

  const memberMap = useMemo(() => {
    const map = {};
    members.forEach((m) => {
      if (m.user) map[m.user.slug] = m.user;
    });
    return map;
  }, [members]);

  const filteredTasks = useMemo(
    () => getFilteredTasks(tasks, filters),
    [tasks, filters]
  );

  const sortedTasks = useMemo(
    () => sortTasks(filteredTasks, sortField, sortDirection, columnMap),
    [filteredTasks, sortField, sortDirection, columnMap]
  );

  function handleSort(field) {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }

  function handleRowClick(taskId) {
    useUIStore.getState().openTaskModal(taskId);
  }

  function renderSortIcon(field) {
    if (sortField !== field) {
      return <ArrowUpDown size={12} className={styles.sortIconInactive} />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp size={12} className={styles.sortIconActive} />
    ) : (
      <ChevronDown size={12} className={styles.sortIconActive} />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.taskCount}>
        {sortedTasks.length} {sortedTasks.length === 1 ? 'tarefa' : 'tarefas'}
      </div>

      <div className={styles.tableWrapper}>
        <div className={styles.table}>
          {/* Header */}
          <div className={styles.thead}>
            <div className={styles.thCheckbox}>
              <input type="checkbox" disabled className={styles.checkbox} />
            </div>
            {SORTABLE_COLUMNS.map((col) => (
              <div
                key={col.key}
                className={`${styles.th} ${styles[`th_${col.key}`] || ''}`}
                onClick={() => handleSort(col.key)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSort(col.key)}
              >
                <span>{col.label}</span>
                {renderSortIcon(col.key)}
              </div>
            ))}
          </div>

          {/* Body */}
          <div className={styles.tbody}>
            {sortedTasks.map((task, index) => {
              const TypeIcon = TYPE_ICONS[task.type] || Copy;
              const typeLabel = TASK_TYPES[task.type] || task.type;
              const user = task.assignee ? memberMap[task.assignee] : null;
              const col = columnMap[task.column_id];
              const colorClass = col ? (COLUMN_COLOR_MAP[col.color] || 'status-backlog') : 'status-backlog';

              return (
                <div
                  key={task.id}
                  className={`${styles.row} ${index % 2 === 1 ? styles.rowStripe : ''}`}
                  onClick={() => handleRowClick(task.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleRowClick(task.id)}
                >
                  <div className={styles.cellCheckbox}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className={styles.cellTitle}>
                    <span className={`status-dot ${colorClass}`} />
                    <span className={styles.titleText}>{task.title}</span>
                  </div>
                  <div className={styles.cellType}>
                    <TypeIcon size={13} />
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
                  <div className={styles.cellPoints}>
                    {task.story_points != null ? (
                      <span className={styles.pointsBadge}>{task.story_points}</span>
                    ) : (
                      <span className={styles.noAssignee}>—</span>
                    )}
                  </div>
                  <div className={styles.cellColumn}>
                    <span className={`status-dot ${colorClass}`} />
                    <span>{col?.title || '—'}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {sortedTasks.length === 0 && (
            <div className={styles.empty}>Nenhuma tarefa encontrada</div>
          )}
        </div>
      </div>
    </div>
  );
}
