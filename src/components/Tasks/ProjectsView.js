'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, FolderKanban, ExternalLink } from 'lucide-react';
import useTodoStore from '@/stores/useTodoStore';
import TodoItem from './TodoItem';
import styles from './ProjectsView.module.css';

function BoardSection({ board, tasks }) {
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const doneTasks = tasks.filter((t) => t.is_done);
  const overdueTasks = tasks.filter((t) => !t.is_done && t.due_date && t.due_date < today);
  const completionRate = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0;

  return (
    <div className={styles.boardSection}>
      <button className={styles.boardHeader} onClick={() => setOpen(!open)}>
        <div className={styles.boardLeft}>
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <FolderKanban size={16} color="var(--accent)" />
          <span className={styles.boardTitle}>{board.title}</span>
          <span className={styles.taskCount}>{tasks.length} tarefas</span>
        </div>
        <div className={styles.boardRight}>
          {overdueTasks.length > 0 && (
            <span className={styles.overdueTag}>{overdueTasks.length} vencidas</span>
          )}
          <div className={styles.miniProgress}>
            <div
              className={styles.miniProgressFill}
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <span className={styles.pct}>{completionRate}%</span>
          <a
            href={`/board/${board.id}`}
            className={styles.boardLink}
            title="Abrir board"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </button>

      {open && (
        <div className={styles.taskList}>
          {tasks.length === 0 ? (
            <p className={styles.noTasks}>Nenhuma tarefa atribuida.</p>
          ) : (
            tasks.map((task) => (
              <TodoItem key={task.id} item={task} isTodo={false} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjectsView({ myTasks }) {
  const { boards } = useTodoStore();

  const tasksByBoard = useMemo(() => {
    const map = {};
    for (const task of myTasks) {
      if (!map[task.board_id]) map[task.board_id] = [];
      map[task.board_id].push(task);
    }
    return map;
  }, [myTasks]);

  if (boards.length === 0) {
    return (
      <div className={styles.empty}>
        <FolderKanban size={40} color="var(--text-muted)" />
        <p>Nenhum projeto encontrado.</p>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      {boards.map((board) => (
        <BoardSection
          key={board.id}
          board={board}
          tasks={tasksByBoard[board.id] || []}
        />
      ))}
    </div>
  );
}
