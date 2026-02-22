'use client';

import { Play, Pause, RotateCcw } from 'lucide-react';
import useTaskTimer from '@/hooks/useTaskTimer';
import { formatElapsedClock } from '@/lib/dateUtils';
import styles from './TaskTimerControls.module.css';

export default function TaskTimerControls({ taskId }) {
  const { elapsed, isRunning, start, pause, reset } = useTaskTimer(taskId);

  function handleToggle() {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>Cronometro</span>
        {isRunning && <span className={styles.runningIndicator}>Rodando</span>}
      </div>

      <div className={styles.display}>
        <span className={`${styles.clock} ${isRunning ? styles.clockRunning : ''}`}>
          {formatElapsedClock(elapsed)}
        </span>
      </div>

      <div className={styles.controls}>
        <button
          className={`${styles.btn} ${isRunning ? styles.btnPause : styles.btnPlay}`}
          onClick={handleToggle}
          aria-label={isRunning ? 'Pausar cronometro' : 'Iniciar cronometro'}
        >
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
          {isRunning ? 'Pausar' : elapsed > 0 ? 'Continuar' : 'Iniciar'}
        </button>

        {elapsed > 0 && (
          <button
            className={styles.btnReset}
            onClick={reset}
            aria-label="Resetar cronometro"
            title="Resetar"
          >
            <RotateCcw size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
