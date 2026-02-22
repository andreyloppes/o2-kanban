'use client';

import { Play, Pause } from 'lucide-react';
import useTaskTimer from '@/hooks/useTaskTimer';
import { formatElapsed } from '@/lib/dateUtils';
import styles from './TaskTimerBadge.module.css';

export default function TaskTimerBadge({ taskId }) {
  const { elapsed, isRunning, start, pause } = useTaskTimer(taskId);

  // Nao mostra se nao tem tempo e nao esta rodando
  if (!isRunning && elapsed <= 0) return null;

  function handleToggle(e) {
    e.stopPropagation();
    if (isRunning) {
      pause();
    } else {
      start();
    }
  }

  return (
    <div className={`${styles.badge} ${isRunning ? styles.running : ''}`}>
      {isRunning && <span className={styles.dot} />}
      <span className={styles.time}>{formatElapsed(elapsed)}</span>
      <button
        className={styles.toggleBtn}
        onClick={handleToggle}
        aria-label={isRunning ? 'Pausar timer' : 'Iniciar timer'}
        title={isRunning ? 'Pausar' : 'Continuar'}
      >
        {isRunning ? <Pause size={12} /> : <Play size={12} />}
      </button>
    </div>
  );
}
