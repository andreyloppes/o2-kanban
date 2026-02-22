'use client';

import { useState, useEffect, useCallback } from 'react';
import useBoardStore from '@/stores/useBoardStore';
import { TIMER_UPDATE_INTERVAL_MS } from '@/lib/constants';

/**
 * Hook para gerenciar o timer de uma task individual.
 * Retorna elapsed em tempo real (atualiza a cada 1s quando rodando).
 */
export default function useTaskTimer(taskId) {
  const task = useBoardStore((state) => state.getTaskById(taskId));
  const [liveElapsed, setLiveElapsed] = useState(0);

  const isRunning = task?.timer_running ?? false;
  const baseElapsed = task?.timer_elapsed_ms ?? 0;
  const startedAt = task?.timer_started_at ?? null;

  // Atualiza elapsed em tempo real quando o timer esta rodando
  useEffect(() => {
    if (!isRunning || !startedAt) {
      setLiveElapsed(baseElapsed);
      return;
    }

    function tick() {
      const sessionMs = Date.now() - new Date(startedAt).getTime();
      setLiveElapsed(baseElapsed + sessionMs);
    }

    tick(); // imediato
    const interval = setInterval(tick, TIMER_UPDATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isRunning, startedAt, baseElapsed]);

  const start = useCallback(() => {
    useBoardStore.getState().startTaskTimer(taskId);
  }, [taskId]);

  const pause = useCallback(() => {
    useBoardStore.getState().pauseTaskTimer(taskId);
  }, [taskId]);

  const reset = useCallback(() => {
    useBoardStore.getState().resetTaskTimer(taskId);
  }, [taskId]);

  return {
    elapsed: liveElapsed,
    isRunning,
    start,
    pause,
    reset,
  };
}
