'use client';

import { useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import styles from './LabelManager.module.css';

const LABEL_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#6b7280', // gray
];

/**
 * Componente de gerenciamento de labels do board (settings).
 * @param {Object} props
 * @param {string} props.boardId - ID do board
 * @param {Array<{id: string, name: string, color: string}>} props.labels - Labels do board
 * @param {function} props.onUpdate - Handler para atualizar label (labelId, { name, color }) => Promise
 * @param {function} props.onDelete - Handler para deletar label (labelId) => Promise
 */
export default function LabelManager({ boardId, labels = [], onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startEditing = (label) => {
    setEditingId(label.id);
    setEditName(label.name);
    setEditColor(label.color);
    setDeletingId(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
    setEditColor('');
  };

  const handleSave = async () => {
    if (!editName.trim() || !onUpdate || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onUpdate(editingId, { name: editName.trim(), color: editColor });
      setEditingId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const handleDelete = async (labelId) => {
    if (!onDelete || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onDelete(labelId);
      setDeletingId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (labels.length === 0) {
    return (
      <div className={styles.empty}>
        Nenhuma label criada neste board.
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {labels.map((label) => (
        <div key={label.id} className={styles.item}>
          {editingId === label.id ? (
            <div className={styles.editRow}>
              <input
                type="text"
                className={styles.editInput}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleSaveKeyDown}
                maxLength={50}
                autoFocus
              />
              <div className={styles.editColorGrid}>
                {LABEL_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`${styles.colorSwatch} ${editColor === color ? styles.colorSwatchSelected : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setEditColor(color)}
                    aria-label={`Cor ${color}`}
                  />
                ))}
              </div>
              <div className={styles.editActions}>
                <button
                  type="button"
                  className={styles.btnSave}
                  onClick={handleSave}
                  disabled={!editName.trim() || isSubmitting}
                  aria-label="Salvar"
                >
                  <Check size={14} />
                </button>
                <button
                  type="button"
                  className={styles.btnCancelEdit}
                  onClick={cancelEditing}
                  aria-label="Cancelar"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ) : deletingId === label.id ? (
            <div className={styles.deleteConfirm}>
              <span className={styles.deleteMessage}>
                Deletar <strong>{label.name}</strong>?
              </span>
              <div className={styles.deleteActions}>
                <button
                  type="button"
                  className={styles.btnDeleteConfirm}
                  onClick={() => handleDelete(label.id)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Deletando...' : 'Deletar'}
                </button>
                <button
                  type="button"
                  className={styles.btnCancelDelete}
                  onClick={() => setDeletingId(null)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.viewRow}>
              <span
                className={styles.labelPreview}
                style={{
                  backgroundColor: `${label.color}20`,
                  color: label.color,
                  borderColor: `${label.color}40`,
                }}
              >
                {label.name}
              </span>
              <div className={styles.viewActions}>
                <button
                  type="button"
                  className={styles.btnIcon}
                  onClick={() => startEditing(label)}
                  aria-label={`Editar ${label.name}`}
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  className={`${styles.btnIcon} ${styles.btnDanger}`}
                  onClick={() => setDeletingId(label.id)}
                  aria-label={`Deletar ${label.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
