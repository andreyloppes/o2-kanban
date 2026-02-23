'use client';

import { motion } from 'framer-motion';
import { staggerContainer } from '@/lib/motion';
import AutomationCard from './AutomationCard';
import styles from './AutomationList.module.css';

export default function AutomationList({ automations, boardId, onToggled, onDeleted }) {
  return (
    <motion.div
      className={styles.grid}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {automations.map((automation) => (
        <AutomationCard
          key={automation.id}
          automation={automation}
          boardId={boardId}
          onToggled={onToggled}
          onDeleted={onDeleted}
        />
      ))}
    </motion.div>
  );
}
