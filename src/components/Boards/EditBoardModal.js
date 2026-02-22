'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import useUIStore from '@/stores/useUIStore';
import { modalOverlay, modalContent } from '@/lib/motion';
import styles from './CreateBoardModal.module.css';

export default function EditBoardModal({ board, onClose, onUpdated }) {
  const [title, setTitle] = useState(board.title || '');
  const [description, setDescription] = useState(board.description || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    if (titleRef.current) {
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, []);

  const handleClose = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        handleClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Titulo e obrigatorio');
      return;
    }

    if (trimmedTitle.length > 200) {
      setError('Titulo deve ter no maximo 200 caracteres');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/boards/${board.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmedTitle,
          description: description.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Falha ao atualizar board');
      }

      useUIStore.getState().addToast('Board atualizado com sucesso', 'success');
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.message);
      useUIStore.getState().addToast('Erro ao atualizar board', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Editar board"
      variants={modalOverlay}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div className={styles.modal} variants={modalContent}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Editar board</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleClose}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.body}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="edit-board-title">
                Titulo <span className={styles.required}>*</span>
              </label>
              <input
                id="edit-board-title"
                ref={titleRef}
                type="text"
                className={styles.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nome do board..."
                maxLength={200}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="edit-board-description">
                Descricao
              </label>
              <textarea
                id="edit-board-description"
                className={styles.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descricao opcional..."
                maxLength={2000}
                rows={3}
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.btnGhost}
              onClick={handleClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
