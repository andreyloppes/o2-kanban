'use client';

import { motion } from 'framer-motion';
import { BOARD_ROLES } from '@/lib/constants';
import Avatar from '@/components/ui/Avatar';
import { staggerItem, cardHover } from '@/lib/motion';
import styles from './MemberCard.module.css';

export default function MemberCard({ member }) {
  const user = member.user;
  const name = user?.name || 'Usuario';
  const email = user?.email || '';
  const avatarColor = user?.avatar_color || '#3b82f6';
  const role = member.role || 'member';
  const roleLabel = BOARD_ROLES[role] || role;

  return (
    <motion.div className={styles.card} variants={staggerItem} whileHover={cardHover}>
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
    </motion.div>
  );
}
