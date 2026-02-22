'use client';

import { motion } from 'framer-motion';
import { staggerContainer } from '@/lib/motion';
import BoardCard from './BoardCard';
import styles from './BoardGrid.module.css';

export default function BoardGrid({ boards, onEdit, onDelete }) {
  return (
    <motion.div
      className={styles.grid}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {boards.map((board) => (
        <BoardCard
          key={board.id}
          board={board}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </motion.div>
  );
}
