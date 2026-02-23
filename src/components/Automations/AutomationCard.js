'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { AUTOMATION_TRIGGERS, AUTOMATION_ACTIONS } from '@/lib/constants';
import { staggerItem, cardHover } from '@/lib/motion';
import styles from './AutomationCard.module.css';

export default function AutomationCard({ automation, boardId, onToggled, onDeleted }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const triggerLabel = AUTOMATION_TRIGGERS[automation.trigger_type] || automation.trigger_type;
  const actionLabel = AUTOMATION_ACTIONS[automation.action_type] || automation.action_type;

  const handleToggle = async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/boards/${boardId}/automations/${automation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !automation.enabled }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Erro ao atualizar automacao');
        return;
      }

      onToggled?.(automation.id, !automation.enabled);
    } catch {
      alert('Erro de conexao');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (isUpdating) return;
    if (!confirm(`Excluir automacao "${automation.name}"?`)) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/boards/${boardId}/automations/${automation.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Erro ao excluir automacao');
        return;
      }

      onDeleted?.(automation.id);
    } catch {
      alert('Erro de conexao');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      className={`${styles.card} ${isUpdating ? styles.updating : ''} ${!automation.enabled ? styles.disabled : ''}`}
      variants={staggerItem}
      whileHover={cardHover}
    >
      <div className={styles.info}>
        <span className={styles.name}>{automation.name}</span>
        <div className={styles.meta}>
          <span className={`${styles.badge} ${styles.badgeTrigger}`}>{triggerLabel}</span>
          <span className={`${styles.badge} ${styles.badgeAction}`}>{actionLabel}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <div
          className={`${styles.switch} ${automation.enabled ? styles.switchOn : ''}`}
          onClick={handleToggle}
          role="switch"
          aria-checked={automation.enabled}
          tabIndex={0}
          title={automation.enabled ? 'Desativar' : 'Ativar'}
        >
          <div className={styles.switchThumb} />
        </div>

        <button
          className={`${styles.actionBtn} ${styles.actionDanger}`}
          onClick={handleDelete}
          disabled={isUpdating}
          title="Excluir automacao"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </motion.div>
  );
}
