'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, Plus, Tag } from 'lucide-react';
import styles from './LabelPicker.module.css';

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
 * Dropdown para atribuir labels a uma task.
 * @param {Object} props
 * @param {string} props.boardId - ID do board
 * @param {string} props.taskId - ID da task
 * @param {string[]} props.selectedLabelIds - IDs das labels ja atribuidas
 * @param {function} props.onToggle - Handler (labelId, isAdding) => void
 * @param {Array<{id: string, name: string, color: string}>} props.labels - Labels do board
 * @param {function} [props.onCreateLabel] - Handler para criar nova label (name, color) => Promise
 */
export default function LabelPicker({ boardId, taskId, selectedLabelIds = [], onToggle, labels = [], onCreateLabel }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(LABEL_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const wrapperRef = useRef(null);
  const nameInputRef = useRef(null);

  // Click outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setIsCreating(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleEscape(e) {
      if (e.key === 'Escape') {
        if (isCreating) {
          setIsCreating(false);
        } else {
          setIsOpen(false);
        }
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isCreating]);

  // Focus name input when creating
  useEffect(() => {
    if (isCreating && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isCreating]);

  const handleToggle = (labelId) => {
    const isSelected = selectedLabelIds.includes(labelId);
    onToggle(labelId, !isSelected);
  };

  const handleCreate = async () => {
    if (!newName.trim() || !onCreateLabel || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onCreateLabel(newName.trim(), newColor);
      setNewName('');
      setNewColor(LABEL_COLORS[0]);
      setIsCreating(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreate();
    }
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Tag size={14} />
        <span>Labels</span>
        {selectedLabelIds.length > 0 && (
          <span className={styles.countBadge}>{selectedLabelIds.length}</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="listbox" aria-label="Labels">
          {labels.length === 0 && !isCreating && (
            <div className={styles.emptyState}>Nenhuma label criada</div>
          )}

          {labels.map((label) => {
            const isSelected = selectedLabelIds.includes(label.id);
            return (
              <div
                key={label.id}
                className={`${styles.option} ${isSelected ? styles.optionSelected : ''}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleToggle(label.id)}
              >
                <span className={`${styles.checkbox} ${isSelected ? styles.checkboxChecked : ''}`}>
                  {isSelected && <Check size={10} className={styles.checkIcon} />}
                </span>
                <span
                  className={styles.colorDot}
                  style={{ backgroundColor: label.color }}
                />
                <span className={styles.labelName}>{label.name}</span>
              </div>
            );
          })}

          <div className={styles.divider} />

          {isCreating ? (
            <div className={styles.createForm}>
              <input
                ref={nameInputRef}
                type="text"
                className={styles.createInput}
                placeholder="Nome da label..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleCreateKeyDown}
                maxLength={50}
              />
              <div className={styles.colorGrid}>
                {LABEL_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`${styles.colorSwatch} ${newColor === color ? styles.colorSwatchSelected : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewColor(color)}
                    aria-label={`Cor ${color}`}
                  />
                ))}
              </div>
              <div className={styles.createActions}>
                <button
                  type="button"
                  className={styles.btnCancel}
                  onClick={() => setIsCreating(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={styles.btnCreate}
                  onClick={handleCreate}
                  disabled={!newName.trim() || isSubmitting}
                >
                  {isSubmitting ? 'Criando...' : 'Criar'}
                </button>
              </div>
            </div>
          ) : (
            <div
              className={styles.createTrigger}
              onClick={() => setIsCreating(true)}
            >
              <Plus size={14} />
              <span>Criar nova label</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
