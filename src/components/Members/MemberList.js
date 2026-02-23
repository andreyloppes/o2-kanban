'use client';

import { motion } from 'framer-motion';
import { staggerContainer } from '@/lib/motion';
import MemberCard from './MemberCard';
import styles from './MemberList.module.css';

export default function MemberList({ members, isOwner, boardId, onRoleChanged, onMemberRemoved }) {
  // Sort: owners first, then alphabetically by name
  const sorted = [...members].sort((a, b) => {
    if (a.role === 'owner' && b.role !== 'owner') return -1;
    if (a.role !== 'owner' && b.role === 'owner') return 1;
    return (a.user?.name || '').localeCompare(b.user?.name || '');
  });

  return (
    <motion.div
      className={styles.grid}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {sorted.map((member) => (
        <MemberCard
          key={member.id}
          member={member}
          isOwner={isOwner}
          boardId={boardId}
          onRoleChanged={onRoleChanged}
          onMemberRemoved={onMemberRemoved}
        />
      ))}
    </motion.div>
  );
}
