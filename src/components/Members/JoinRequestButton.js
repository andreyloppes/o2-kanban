'use client';

import { useState } from 'react';
import { UserPlus, Clock, Loader2 } from 'lucide-react';
import useBoardStore from '@/stores/useBoardStore';
import styles from './JoinRequestButton.module.css';

export default function JoinRequestButton() {
  const board = useBoardStore((state) => state.board);
  const [status, setStatus] = useState(board?.join_request_status || null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const isPending = status === 'pending';

  const handleRequest = async () => {
    if (isLoading || isPending) return;

    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/boards/${board.id}/join-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: 'error', message: data.error || 'Erro ao solicitar acesso' });
        return;
      }

      setStatus('pending');
      setFeedback({ type: 'success', message: 'Solicitacao enviada!' });
    } catch {
      setFeedback({ type: 'error', message: 'Erro de conexao' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <button
        className={`${styles.btn} ${isPending ? styles.btnPending : ''}`}
        onClick={handleRequest}
        disabled={isLoading || isPending}
        title={isPending ? 'Solicitacao pendente' : 'Solicitar acesso a este board'}
      >
        {isLoading ? (
          <Loader2 size={16} className={styles.spinner} />
        ) : isPending ? (
          <Clock size={16} />
        ) : (
          <UserPlus size={16} />
        )}
        <span>{isPending ? 'Solicitacao Enviada' : 'Solicitar Acesso'}</span>
      </button>
      {feedback && (
        <span className={`${styles.toast} ${feedback.type === 'error' ? styles.toastError : styles.toastSuccess}`}>
          {feedback.message}
        </span>
      )}
    </div>
  );
}
