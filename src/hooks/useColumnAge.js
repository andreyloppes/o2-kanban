import { useMemo } from 'react';
import { getColumnAgeStatus } from '@/lib/dateUtils';

/**
 * Hook que calcula dias e status da idade na coluna.
 * @param {string|null} columnEnteredAt - ISO timestamp
 * @returns {{ days: number, status: 'neutral'|'warning'|'danger' }|null}
 */
export default function useColumnAge(columnEnteredAt) {
  return useMemo(() => getColumnAgeStatus(columnEnteredAt), [columnEnteredAt]);
}
