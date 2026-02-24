'use client';

import { useState, useEffect } from 'react';
import { Plus, Check, Circle, ChevronDown, ChevronRight } from 'lucide-react';
import styles from './SubtaskList.module.css';

export default function SubtaskList({ taskId, canEdit = true }) {
  const [subtasks, setSubtasks] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!taskId) return;
    fetch(`/api/tasks/${taskId}/subtasks`)
      .then((res) => res.ok ? res.json() : { subtasks: [] })
      .then((data) => setSubtasks(data.subtasks || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [taskId]);

  const completedCount = subtasks.filter((s) => s.type === 'done' || s.column_id).length;
  const totalCount = subtasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  async function handleAddSubtask(e) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    try {
      const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        const { subtask } = await res.json();
        setSubtasks((prev) => [...prev, subtask]);
        setNewTitle('');
        setIsAdding(false);
      }
    } catch {}
  }

  if (isLoading) return null;

  return (
    <div className={styles.container}>
      <button
        className={styles.header}
        onClick={() => setIsExpanded(!isExpanded)}
        type="button"
      >
        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span className={styles.headerTitle}>
          Subtarefas
          {totalCount > 0 && (
            <span className={styles.count}>{completedCount}/{totalCount}</span>
          )}
        </span>
        {totalCount > 0 && (
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
        )}
      </button>

      {isExpanded && (
        <div className={styles.list}>
          {subtasks.map((subtask) => (
            <div key={subtask.id} className={styles.item}>
              <Circle size={14} className={styles.itemIcon} />
              <span className={styles.itemTitle}>{subtask.title}</span>
            </div>
          ))}

          {canEdit && !isAdding && (
            <button
              className={styles.addBtn}
              onClick={() => setIsAdding(true)}
              type="button"
            >
              <Plus size={14} />
              <span>Adicionar subtarefa</span>
            </button>
          )}

          {canEdit && isAdding && (
            <form onSubmit={handleAddSubtask} className={styles.addForm}>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Titulo da subtarefa..."
                className={styles.addInput}
                autoFocus
                maxLength={500}
              />
              <div className={styles.addActions}>
                <button type="submit" className={styles.confirmBtn} disabled={!newTitle.trim()}>
                  Adicionar
                </button>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => { setIsAdding(false); setNewTitle(''); }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
