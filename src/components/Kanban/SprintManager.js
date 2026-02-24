'use client';

import { useState, useEffect } from 'react';
import { Zap, Plus, Calendar, Target, ChevronDown, ChevronRight, X } from 'lucide-react';
import useBoardStore from '@/stores/useBoardStore';
import useUIStore from '@/stores/useUIStore';
import styles from './SprintManager.module.css';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function getSprintStatusColor(sprint) {
  if (sprint.status === 'completed') return 'var(--color-success)';
  if (sprint.status === 'active') return 'var(--accent)';
  return 'var(--text-muted)';
}

export default function SprintManager({ boardId }) {
  const [sprints, setSprints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ name: '', goal: '', start_date: '', end_date: '' });

  useEffect(() => {
    if (!boardId) return;
    fetchSprints();
  }, [boardId]);

  async function fetchSprints() {
    try {
      const res = await fetch(`/api/boards/${boardId}/sprints`);
      if (res.ok) {
        const data = await res.json();
        setSprints(data.sprints || []);
      }
    } catch {}
    setIsLoading(false);
  }

  async function handleCreateSprint(e) {
    e.preventDefault();
    if (!form.name || !form.start_date || !form.end_date) return;

    try {
      const res = await fetch(`/api/boards/${boardId}/sprints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const { sprint } = await res.json();
        setSprints((prev) => [{ ...sprint, task_count: 0 }, ...prev]);
        setForm({ name: '', goal: '', start_date: '', end_date: '' });
        setIsCreating(false);
        useUIStore.getState().addToast('Sprint criado', 'success');
      }
    } catch {
      useUIStore.getState().addToast('Erro ao criar sprint', 'error');
    }
  }

  async function handleStatusChange(sprintId, newStatus) {
    try {
      await fetch(`/api/boards/${boardId}/sprints/${sprintId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setSprints((prev) =>
        prev.map((s) => (s.id === sprintId ? { ...s, status: newStatus } : s))
      );
    } catch {}
  }

  async function handleDelete(sprintId) {
    useUIStore.getState().showConfirmDialog({
      title: 'Excluir Sprint',
      message: 'Tem certeza? As tarefas nao serao excluidas, apenas desvinculadas.',
      confirmLabel: 'Excluir',
      onConfirm: async () => {
        await fetch(`/api/boards/${boardId}/sprints/${sprintId}`, { method: 'DELETE' });
        setSprints((prev) => prev.filter((s) => s.id !== sprintId));
        useUIStore.getState().hideConfirmDialog();
        useUIStore.getState().addToast('Sprint excluido', 'success');
      },
    });
  }

  const activeSprint = sprints.find((s) => s.status === 'active');

  return (
    <div className={styles.container}>
      <button className={styles.header} onClick={() => setIsExpanded(!isExpanded)} type="button">
        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <Zap size={14} className={styles.headerIcon} />
        <span>Sprints</span>
        {activeSprint && (
          <span className={styles.activeBadge}>{activeSprint.name}</span>
        )}
      </button>

      {isExpanded && (
        <div className={styles.content}>
          {sprints.map((sprint) => (
            <div key={sprint.id} className={styles.sprintCard}>
              <div className={styles.sprintHeader}>
                <span
                  className={styles.statusDot}
                  style={{ backgroundColor: getSprintStatusColor(sprint) }}
                />
                <span className={styles.sprintName}>{sprint.name}</span>
                <span className={styles.sprintDates}>
                  {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
                </span>
              </div>
              {sprint.goal && <p className={styles.sprintGoal}>{sprint.goal}</p>}
              <div className={styles.sprintFooter}>
                <span className={styles.taskCount}>{sprint.task_count} tarefas</span>
                <div className={styles.sprintActions}>
                  {sprint.status === 'planned' && (
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleStatusChange(sprint.id, 'active')}
                    >
                      Iniciar
                    </button>
                  )}
                  {sprint.status === 'active' && (
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleStatusChange(sprint.id, 'completed')}
                    >
                      Finalizar
                    </button>
                  )}
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(sprint.id)}
                    title="Excluir"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!isCreating ? (
            <button className={styles.createBtn} onClick={() => setIsCreating(true)} type="button">
              <Plus size={14} />
              <span>Novo Sprint</span>
            </button>
          ) : (
            <form className={styles.createForm} onSubmit={handleCreateSprint}>
              <input
                type="text"
                placeholder="Nome do sprint..."
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={styles.input}
                autoFocus
                required
              />
              <textarea
                placeholder="Objetivo (opcional)..."
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
                className={styles.textarea}
                rows={2}
              />
              <div className={styles.dateRow}>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className={styles.dateInput}
                  required
                />
                <span className={styles.dateSep}>ate</span>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className={styles.dateInput}
                  required
                />
              </div>
              <div className={styles.formActions}>
                <button type="submit" className={styles.submitBtn} disabled={!form.name || !form.start_date || !form.end_date}>
                  Criar Sprint
                </button>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsCreating(false)}>
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
