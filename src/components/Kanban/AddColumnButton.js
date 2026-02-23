'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Check, X } from 'lucide-react';
import useBoardStore from '@/stores/useBoardStore';
import { COLUMN_COLOR_MAP } from '@/lib/constants';

const COLOR_OPTIONS = [
  { value: 'neutral', label: 'Neutro' },
  { value: 'info', label: 'Azul' },
  { value: 'progress', label: 'Verde' },
  { value: 'review', label: 'Amarelo' },
  { value: 'danger', label: 'Vermelho' },
  { value: 'done', label: 'Sucesso' },
];

export default function AddColumnButton() {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('neutral');
  const [afterColumnId, setAfterColumnId] = useState('__last__');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);
  const columns = useBoardStore((state) => state.columns);

  const sortedColumns = columns.slice().sort((a, b) => a.position - b.position);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleSubmit = async () => {
    const trimmed = title.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    await useBoardStore.getState().addColumn(trimmed, color, afterColumnId);
    setTitle('');
    setColor('neutral');
    setAfterColumnId('__last__');
    setIsSubmitting(false);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setTitle('');
    setColor('neutral');
    setAfterColumnId('__last__');
    setIsAdding(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') handleCancel();
  };

  if (!isAdding) {
    return (
      <button
        className="add-column-btn"
        onClick={() => setIsAdding(true)}
        title="Adicionar coluna"
      >
        <Plus size={20} />
        <span>Coluna</span>
      </button>
    );
  }

  return (
    <div className="add-column-form">
      <input
        ref={inputRef}
        className="add-column-input"
        type="text"
        placeholder="Nome da coluna..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={200}
        disabled={isSubmitting}
      />
      <div className="add-column-colors">
        {COLOR_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`add-column-color-btn ${COLUMN_COLOR_MAP[opt.value] || 'status-backlog'} ${color === opt.value ? 'active' : ''}`}
            onClick={() => setColor(opt.value)}
            title={opt.label}
          />
        ))}
      </div>
      {sortedColumns.length > 0 && (
        <select
          value={afterColumnId}
          onChange={(e) => setAfterColumnId(e.target.value)}
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontSize: '0.8rem',
            padding: 'var(--space-2) var(--space-3)',
            fontFamily: 'inherit',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="__first__">Inserir no inicio</option>
          {sortedColumns.map((col) => (
            <option key={col.id} value={col.id}>
              Apos: {col.title}
            </option>
          ))}
          <option value="__last__">Inserir no final</option>
        </select>
      )}
      <div className="add-column-actions">
        <button
          className="add-column-confirm"
          onClick={handleSubmit}
          disabled={!title.trim() || isSubmitting}
        >
          <Check size={16} />
          Criar
        </button>
        <button className="add-column-cancel" onClick={handleCancel}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
