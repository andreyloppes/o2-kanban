'use client';

import { useEffect, useCallback, useRef } from 'react';
import useUIStore from '@/stores/useUIStore';
import useBoardStore from '@/stores/useBoardStore';
import { POMODORO_DEFAULTS, POMODORO_SETTINGS_KEY } from '@/lib/constants';

function getSettings() {
  if (typeof window === 'undefined') return POMODORO_DEFAULTS;
  try {
    const saved = localStorage.getItem(POMODORO_SETTINGS_KEY);
    return saved ? { ...POMODORO_DEFAULTS, ...JSON.parse(saved) } : POMODORO_DEFAULTS;
  } catch {
    return POMODORO_DEFAULTS;
  }
}

function saveSettings(settings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(POMODORO_SETTINGS_KEY, JSON.stringify(settings));
}

/**
 * Hook principal do Pomodoro.
 * Gerencia countdown, transicoes focus<->break, vinculacao com task timer.
 */
export default function usePomodoro() {
  const pomodoro = useUIStore((state) => state.pomodoro);
  const setPomodoroState = useUIStore((state) => state.setPomodoroState);
  const resetPomodoro = useUIStore((state) => state.resetPomodoro);
  const intervalRef = useRef(null);
  const lastTickRef = useRef(null);

  const settings = getSettings();

  // Countdown interval
  useEffect(() => {
    if (!pomodoro.isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    lastTickRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      const current = useUIStore.getState().pomodoro;
      const newRemaining = current.timeRemainingMs - delta;

      if (newRemaining <= 0) {
        handleSessionEnd();
      } else {
        setPomodoroState({ timeRemainingMs: newRemaining });
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [pomodoro.isRunning]);

  const handleSessionEnd = useCallback(() => {
    const current = useUIStore.getState().pomodoro;
    const settings = getSettings();

    if (current.mode === 'focus') {
      const newCompleted = current.completedSessions + 1;
      const isLongBreak = newCompleted % settings.sessionsBeforeLongBreak === 0;

      // Pausar task timer vinculado
      if (current.linkedTaskId) {
        useBoardStore.getState().pauseTaskTimer(current.linkedTaskId);
      }

      const breakMode = isLongBreak ? 'longBreak' : 'shortBreak';
      const breakDuration = isLongBreak ? settings.longBreakMs : settings.shortBreakMs;

      setPomodoroState({
        mode: breakMode,
        timeRemainingMs: breakDuration,
        completedSessions: newCompleted,
        isRunning: settings.autoStartBreak,
      });
    } else {
      // Break acabou -> volta para focus
      const settings = getSettings();

      // Retomar task timer vinculado se auto-start focus
      if (settings.autoStartFocus && current.linkedTaskId) {
        useBoardStore.getState().startTaskTimer(current.linkedTaskId);
      }

      setPomodoroState({
        mode: 'focus',
        timeRemainingMs: settings.focusDurationMs,
        isRunning: settings.autoStartFocus,
      });
    }
  }, [setPomodoroState]);

  const startFocus = useCallback(() => {
    const settings = getSettings();
    const boardState = useBoardStore.getState();

    // Vincular ao task timer ativo se configurado
    let linkedTaskId = null;
    if (settings.linkToTaskTimer && boardState.activeTimerTaskId) {
      linkedTaskId = boardState.activeTimerTaskId;
    }

    setPomodoroState({
      mode: 'focus',
      timeRemainingMs: settings.focusDurationMs,
      isRunning: true,
      linkedTaskId,
    });
  }, [setPomodoroState]);

  const togglePause = useCallback(() => {
    const current = useUIStore.getState().pomodoro;
    if (current.mode === 'idle') {
      startFocus();
      return;
    }
    setPomodoroState({ isRunning: !current.isRunning });
  }, [setPomodoroState, startFocus]);

  const skip = useCallback(() => {
    handleSessionEnd();
  }, [handleSessionEnd]);

  const stop = useCallback(() => {
    const current = useUIStore.getState().pomodoro;
    if (current.linkedTaskId) {
      useBoardStore.getState().pauseTaskTimer(current.linkedTaskId);
    }
    resetPomodoro();
  }, [resetPomodoro]);

  const updateSettings = useCallback((newSettings) => {
    const current = getSettings();
    saveSettings({ ...current, ...newSettings });
  }, []);

  return {
    ...pomodoro,
    settings,
    startFocus,
    togglePause,
    skip,
    stop,
    updateSettings,
    getSettings,
  };
}
