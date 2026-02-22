import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getDueDateStatus, getDueDateLabel, formatDueDateShort } from '../dateUtils';

describe('getDueDateStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-20T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('retorna null para null', () => {
    expect(getDueDateStatus(null)).toBeNull();
  });

  it('retorna null para undefined', () => {
    expect(getDueDateStatus(undefined)).toBeNull();
  });

  it('retorna null para string vazia', () => {
    expect(getDueDateStatus('')).toBeNull();
  });

  it('retorna "overdue" para datas passadas', () => {
    expect(getDueDateStatus('2026-02-19')).toBe('overdue');
    expect(getDueDateStatus('2025-01-01')).toBe('overdue');
  });

  it('retorna "today" para hoje', () => {
    expect(getDueDateStatus('2026-02-20')).toBe('today');
  });

  it('retorna "soon" para 1-7 dias no futuro', () => {
    expect(getDueDateStatus('2026-02-21')).toBe('soon');
    expect(getDueDateStatus('2026-02-27')).toBe('soon');
  });

  it('retorna "future" para mais de 7 dias no futuro', () => {
    expect(getDueDateStatus('2026-02-28')).toBe('future');
    expect(getDueDateStatus('2026-12-31')).toBe('future');
  });
});

describe('getDueDateLabel', () => {
  it('retorna "Atrasado" para overdue', () => {
    expect(getDueDateLabel('overdue')).toBe('Atrasado');
  });

  it('retorna "Vence hoje" para today', () => {
    expect(getDueDateLabel('today')).toBe('Vence hoje');
  });

  it('retorna "Vence esta semana" para soon', () => {
    expect(getDueDateLabel('soon')).toBe('Vence esta semana');
  });

  it('retorna string vazia para future', () => {
    expect(getDueDateLabel('future')).toBe('');
  });

  it('retorna string vazia para null', () => {
    expect(getDueDateLabel(null)).toBe('');
  });
});

describe('formatDueDateShort', () => {
  it('retorna string vazia para null', () => {
    expect(formatDueDateShort(null)).toBe('');
  });

  it('retorna string vazia para string vazia', () => {
    expect(formatDueDateShort('')).toBe('');
  });

  it('formata corretamente fevereiro', () => {
    expect(formatDueDateShort('2026-02-20')).toBe('20 fev');
  });

  it('formata corretamente janeiro', () => {
    expect(formatDueDateShort('2026-01-05')).toBe('5 jan');
  });

  it('formata corretamente dezembro', () => {
    expect(formatDueDateShort('2026-12-25')).toBe('25 dez');
  });

  it('formata corretamente marco', () => {
    expect(formatDueDateShort('2026-03-01')).toBe('1 mar');
  });
});
