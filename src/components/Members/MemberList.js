'use client';

import { motion } from 'framer-motion';
import { staggerContainer } from '@/lib/motion';
import MemberCard from './MemberCard';
import styles from './MemberList.module.css';

export default function MemberList({ members }) {
  return (
    <motion.div
      className={styles.grid}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {members.map((member) => (
        <MemberCard key={member.id} member={member} />
      ))}
    </motion.div>
  );
}
