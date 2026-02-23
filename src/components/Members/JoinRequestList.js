'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Clock } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import { staggerItem, cardHover } from '@/lib/motion';
import styles from './MemberCard.module.css';

export default function JoinRequestList({ requests, boardId, onRequestHandled }) {
  if (!requests || requests.length === 0) return null;

  return (
    <div>
      <h3 style={{
        fontSize: '0.95rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: 'var(--space-4)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
      }}>
        <Clock size={18} />
        Solicitacoes de Acesso ({requests.length})
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {requests.map((req) => (
          <JoinRequestCard
            key={req.id}
            request={req}
            boardId={boardId}
            onHandled={onRequestHandled}
          />
        ))}
      </div>
    </div>
  );
}

function JoinRequestCard({ request, boardId, onHandled }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const user = request.user;
  const name = user?.name || 'Usuario';
  const email = user?.email || '';
  const avatarColor = user?.avatar_color || '#3b82f6';

  const handleAction = async (action) => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/boards/${boardId}/join-requests/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Erro ao processar solicitacao');
        return;
      }

      onHandled?.(request.id, action);
    } catch {
      alert('Erro de conexao');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      className={`${styles.card} ${isUpdating ? styles.updating : ''}`}
      variants={staggerItem}
      whileHover={cardHover}
    >
      <Avatar name={name} color={avatarColor} size="lg" />

      <div className={styles.info}>
        <span className={styles.name}>{name}</span>
        {email && <span className={styles.email}>{email}</span>}
      </div>

      <span className={styles.roleBadge} style={{
        background: 'rgba(245, 158, 11, 0.15)',
        color: 'var(--color-warning, #f59e0b)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
      }}>
        Pendente
      </span>

      <div className={styles.actions}>
        <button
          className={styles.actionBtn}
          onClick={() => handleAction('approve')}
          disabled={isUpdating}
          title="Aprovar solicitacao"
          style={{ '--hover-bg': 'rgba(16, 185, 129, 0.12)', '--hover-color': 'var(--color-success, #10b981)' }}
        >
          <Check size={15} />
        </button>
        <button
          className={`${styles.actionBtn} ${styles.actionDanger}`}
          onClick={() => handleAction('reject')}
          disabled={isUpdating}
          title="Rejeitar solicitacao"
        >
          <X size={15} />
        </button>
      </div>
    </motion.div>
  );
}
