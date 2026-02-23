'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldOff, UserX } from 'lucide-react';
import { BOARD_ROLES } from '@/lib/constants';
import Avatar from '@/components/ui/Avatar';
import { staggerItem, cardHover } from '@/lib/motion';
import styles from './MemberCard.module.css';

export default function MemberCard({ member, isOwner, boardId, onRoleChanged, onMemberRemoved }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const user = member.user;
  const name = user?.name || 'Usuario';
  const email = user?.email || '';
  const avatarColor = user?.avatar_color || '#3b82f6';
  const role = member.role || 'member';
  const roleLabel = BOARD_ROLES[role] || role;

  const handleToggleRole = async () => {
    if (isUpdating) return;
    const newRole = role === 'owner' ? 'member' : 'owner';

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/boards/${boardId}/members/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Erro ao alterar funcao');
        return;
      }

      onRoleChanged?.(member.id, newRole);
    } catch {
      alert('Erro de conexao');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (isUpdating) return;
    if (!confirm(`Remover ${name} deste board?`)) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/boards/${boardId}/members/${member.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Erro ao remover membro');
        return;
      }

      onMemberRemoved?.(member.id);
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

      <span
        className={`${styles.roleBadge} ${role === 'owner' ? styles.roleOwner : styles.roleMember}`}
      >
        {roleLabel}
      </span>

      {isOwner && (
        <div className={styles.actions}>
          <button
            className={styles.actionBtn}
            onClick={handleToggleRole}
            disabled={isUpdating}
            title={role === 'owner' ? 'Rebaixar para Membro' : 'Promover a Admin'}
          >
            {role === 'owner' ? <ShieldOff size={15} /> : <Shield size={15} />}
          </button>
          <button
            className={`${styles.actionBtn} ${styles.actionDanger}`}
            onClick={handleRemove}
            disabled={isUpdating}
            title="Remover do board"
          >
            <UserX size={15} />
          </button>
        </div>
      )}
    </motion.div>
  );
}
