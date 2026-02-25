'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import useTodoStore from '@/stores/useTodoStore';
import styles from './AddTodoModal.module.css';

const PRIORITIES = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
];

export default function AddTodoModal({ isOpen, onClose }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { addTodo, boards } = useTodoStore();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    await addTodo({
      title: title.trim(),
      priority,
      due_date: dueDate || null,
      description: description.trim() || null,
    });
    setIsSaving(false);

    // Reset
    setTitle('');
    setPriority('medium');
    setDueDate('');
    setDescription('');
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Nova Tarefa">
        <div className={styles.header}>
          <h2 className={styles.title}>Nova Tarefa</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="todo-title">
              Titulo <span className={styles.required}>*</span>
            </label>
            <input
              id="todo-title"
              type="text"
              className={styles.input}
              placeholder="O que precisa ser feito?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="todo-priority">Prioridade</label>
              <select
                id="todo-priority"
                className={styles.select}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="todo-due">Vencimento</label>
              <input
                id="todo-due"
                type="date"
                className={styles.input}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="todo-desc">Descricao</label>
            <textarea
              id="todo-desc"
              className={styles.textarea}
              placeholder="Detalhes opcionais..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={!title.trim() || isSaving}
            >
              {isSaving ? 'Criando...' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
