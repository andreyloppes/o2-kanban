'use client';

import { useState } from 'react';
import { CheckSquare, Trash2, ArrowRight, X, Tag } from 'lucide-react';
import useBoardStore from '@/stores/useBoardStore';
import useUIStore from '@/stores/useUIStore';
import styles from './BulkActions.module.css';

export default function BulkActions({ selectedIds, onClearSelection }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const columns = useBoardStore((state) => state.columns);
  const [showMoveDropdown, setShowMoveDropdown] = useState(false);

  const count = selectedIds.length;
  if (count === 0) return null;

  async function handleBulkUpdate(updates) {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/tasks/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_ids: selectedIds, updates }),
      });
      if (res.ok) {
        const { updated_count } = await res.json();
        useUIStore.getState().addToast(`${updated_count} tarefas atualizadas`, 'success');
        onClearSelection();
        // Reload page to reflect changes
        window.location.reload();
      } else {
        useUIStore.getState().addToast('Erro na operacao em lote', 'error');
      }
    } catch {
      useUIStore.getState().addToast('Erro na operacao em lote', 'error');
    }
    setIsProcessing(false);
  }

  async function handleBulkDelete() {
    useUIStore.getState().showConfirmDialog({
      title: 'Excluir tarefas em lote',
      message: `Tem certeza que deseja excluir ${count} tarefas? Esta acao nao pode ser desfeita.`,
      confirmLabel: `Excluir ${count} tarefas`,
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          const res = await fetch('/api/tasks/bulk', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task_ids: selectedIds }),
          });
          if (res.ok) {
            useUIStore.getState().addToast(`${count} tarefas excluidas`, 'success');
            onClearSelection();
            window.location.reload();
          }
        } catch {}
        setIsProcessing(false);
        useUIStore.getState().hideConfirmDialog();
      },
    });
  }

  return (
    <div className={styles.toolbar}>
      <div className={styles.info}>
        <CheckSquare size={14} />
        <span>{count} selecionada{count > 1 ? 's' : ''}</span>
      </div>

      <div className={styles.actions}>
        <div className={styles.priorityGroup}>
          {['low', 'medium', 'high', 'urgent'].map((p) => (
            <button
              key={p}
              className={`${styles.actionBtn} ${styles[`priority-${p}`]}`}
              onClick={() => handleBulkUpdate({ priority: p })}
              disabled={isProcessing}
              title={`Prioridade: ${p}`}
            >
              {p.charAt(0).toUpperCase()}
            </button>
          ))}
        </div>

        <div className={styles.moveWrap}>
          <button
            className={styles.actionBtn}
            onClick={() => setShowMoveDropdown(!showMoveDropdown)}
            disabled={isProcessing}
          >
            <ArrowRight size={14} />
            Mover
          </button>
          {showMoveDropdown && (
            <div className={styles.moveDropdown}>
              {columns.map((col) => (
                <button
                  key={col.id}
                  className={styles.moveItem}
                  onClick={() => {
                    handleBulkUpdate({ column_id: col.id });
                    setShowMoveDropdown(false);
                  }}
                >
                  {col.title}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          className={`${styles.actionBtn} ${styles.danger}`}
          onClick={handleBulkDelete}
          disabled={isProcessing}
        >
          <Trash2 size={14} />
          Excluir
        </button>

        <button
          className={styles.closeBtn}
          onClick={onClearSelection}
          title="Limpar selecao"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
