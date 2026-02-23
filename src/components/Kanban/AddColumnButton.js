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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleSubmit = async () => {
    const trimmed = title.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    await useBoardStore.getState().addColumn(trimmed, color);
    setTitle('');
    setColor('neutral');
    setIsSubmitting(false);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setTitle('');
    setColor('neutral');
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
