'use client';

import { useState, useEffect } from 'react';
import { Link2, ArrowRight, ArrowLeft, Plus, X } from 'lucide-react';
import useBoardStore from '@/stores/useBoardStore';
import useUIStore from '@/stores/useUIStore';
import styles from './DependencyList.module.css';

export default function DependencyList({ taskId, canEdit = true }) {
  const [blocks, setBlocks] = useState([]);
  const [blockedBy, setBlockedBy] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDropdown, setShowAddDropdown] = useState(null); // 'blocks' | 'blocked_by' | null
  const tasks = useBoardStore((state) => state.tasks);

  useEffect(() => {
    if (!taskId) return;
    fetch(`/api/tasks/${taskId}/dependencies`)
      .then((res) => res.ok ? res.json() : { blocks: [], blocked_by: [] })
      .then((data) => {
        setBlocks(data.blocks || []);
        setBlockedBy(data.blocked_by || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [taskId]);

  const existingIds = new Set([
    taskId,
    ...blocks.map((b) => b.blocked_task_id),
    ...blockedBy.map((b) => b.blocker_task_id),
  ]);

  const availableTasks = tasks.filter((t) => !existingIds.has(t.id));

  async function addDependency(type, otherTaskId) {
    const body = type === 'blocks'
      ? { blocked_task_id: otherTaskId }
      : { blocker_task_id: otherTaskId };

    try {
      const res = await fetch(`/api/tasks/${taskId}/dependencies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        // Refresh
        const refreshRes = await fetch(`/api/tasks/${taskId}/dependencies`);
        const data = await refreshRes.json();
        setBlocks(data.blocks || []);
        setBlockedBy(data.blocked_by || []);
      }
    } catch {}
    setShowAddDropdown(null);
  }

  async function removeDependency(depId) {
    try {
      await fetch(`/api/tasks/${taskId}/dependencies?id=${depId}`, { method: 'DELETE' });
      setBlocks((prev) => prev.filter((b) => b.id !== depId));
      setBlockedBy((prev) => prev.filter((b) => b.id !== depId));
    } catch {}
  }

  if (isLoading) return null;
  if (blocks.length === 0 && blockedBy.length === 0 && !canEdit) return null;

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <Link2 size={14} />
        <span>Dependencias</span>
      </div>

      {blockedBy.length > 0 && (
        <div className={styles.section}>
          <span className={styles.sectionLabel}>Bloqueada por</span>
          {blockedBy.map((dep) => (
            <div key={dep.id} className={styles.depItem}>
              <ArrowLeft size={12} className={styles.iconDanger} />
              <span className={styles.depTitle}
                onClick={() => {
                  useUIStore.getState().openTaskModal(dep.blocker_task_id);
                }}
                role="button"
                tabIndex={0}
              >
                {dep.blocker_task?.title || dep.blocker_task_id}
              </span>
              {canEdit && (
                <button className={styles.removeBtn} onClick={() => removeDependency(dep.id)} title="Remover">
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {blocks.length > 0 && (
        <div className={styles.section}>
          <span className={styles.sectionLabel}>Bloqueia</span>
          {blocks.map((dep) => (
            <div key={dep.id} className={styles.depItem}>
              <ArrowRight size={12} className={styles.iconWarning} />
              <span className={styles.depTitle}
                onClick={() => {
                  useUIStore.getState().openTaskModal(dep.blocked_task_id);
                }}
                role="button"
                tabIndex={0}
              >
                {dep.blocked_task?.title || dep.blocked_task_id}
              </span>
              {canEdit && (
                <button className={styles.removeBtn} onClick={() => removeDependency(dep.id)} title="Remover">
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {canEdit && (
        <div className={styles.addSection}>
          {!showAddDropdown ? (
            <div className={styles.addBtns}>
              <button className={styles.addBtn} onClick={() => setShowAddDropdown('blocked_by')} type="button">
                <Plus size={12} /> Bloqueada por
              </button>
              <button className={styles.addBtn} onClick={() => setShowAddDropdown('blocks')} type="button">
                <Plus size={12} /> Bloqueia
              </button>
            </div>
          ) : (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <span>Selecione a tarefa</span>
                <button className={styles.removeBtn} onClick={() => setShowAddDropdown(null)}>
                  <X size={12} />
                </button>
              </div>
              <div className={styles.dropdownList}>
                {availableTasks.length === 0 ? (
                  <span className={styles.emptyDropdown}>Nenhuma tarefa disponivel</span>
                ) : (
                  availableTasks.slice(0, 10).map((t) => (
                    <button
                      key={t.id}
                      className={styles.dropdownItem}
                      onClick={() => addDependency(showAddDropdown, t.id)}
                      type="button"
                    >
                      {t.title}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
