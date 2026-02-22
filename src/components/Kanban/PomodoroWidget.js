'use client';

import { useState } from 'react';
import { Play, Pause, SkipForward, Settings, Square, Timer } from 'lucide-react';
import usePomodoro from '@/hooks/usePomodoro';
import { formatElapsedClock } from '@/lib/dateUtils';
import PomodoroSettings from './PomodoroSettings';
import styles from './PomodoroWidget.module.css';

const MODE_LABELS = {
  idle: 'Pomodoro',
  focus: 'FOCO',
  shortBreak: 'PAUSA',
  longBreak: 'PAUSA LONGA',
};

export default function PomodoroWidget() {
  const {
    mode,
    timeRemainingMs,
    isRunning,
    completedSessions,
    settings,
    startFocus,
    togglePause,
    skip,
    stop,
  } = usePomodoro();

  const [showSettings, setShowSettings] = useState(false);

  const isActive = mode !== 'idle';
  const isBreak = mode === 'shortBreak' || mode === 'longBreak';
  const modeClass = isBreak ? styles.break : mode === 'focus' ? styles.focus : '';

  // Calcular progresso
  let totalDuration;
  if (mode === 'focus') totalDuration = settings.focusDurationMs;
  else if (mode === 'longBreak') totalDuration = settings.longBreakMs;
  else if (mode === 'shortBreak') totalDuration = settings.shortBreakMs;
  else totalDuration = settings.focusDurationMs;

  const progress = isActive ? ((totalDuration - timeRemainingMs) / totalDuration) * 100 : 0;

  return (
    <div className={`${styles.widget} ${modeClass}`}>
      <div className={styles.content}>
        <Timer size={16} className={styles.icon} />
        <span className={styles.modeLabel}>{MODE_LABELS[mode]}</span>

        {isActive && (
          <>
            <span className={styles.time}>
              {formatElapsedClock(Math.max(0, timeRemainingMs))}
            </span>

            {completedSessions > 0 && (
              <span className={styles.sessions} title={`${completedSessions} sessoes concluidas`}>
                {completedSessions}
              </span>
            )}
          </>
        )}

        <div className={styles.actions}>
          {!isActive ? (
            <button
              className={styles.actionBtn}
              onClick={startFocus}
              aria-label="Iniciar Pomodoro"
              title="Iniciar"
            >
              <Play size={14} />
            </button>
          ) : (
            <>
              <button
                className={styles.actionBtn}
                onClick={togglePause}
                aria-label={isRunning ? 'Pausar' : 'Continuar'}
                title={isRunning ? 'Pausar' : 'Continuar'}
              >
                {isRunning ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <button
                className={styles.actionBtn}
                onClick={skip}
                aria-label="Pular sessao"
                title="Pular"
              >
                <SkipForward size={14} />
              </button>
              <button
                className={styles.actionBtn}
                onClick={stop}
                aria-label="Parar Pomodoro"
                title="Parar"
              >
                <Square size={12} />
              </button>
            </>
          )}

          <button
            className={`${styles.actionBtn} ${showSettings ? styles.actionBtnActive : ''}`}
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Configuracoes do Pomodoro"
            title="Configuracoes"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {isActive && (
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      )}

      {showSettings && (
        <PomodoroSettings onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
