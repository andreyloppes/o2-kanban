/**
 * Classifica uma due_date em relacao a hoje.
 * @param {string|null} dueDateStr - Data no formato 'YYYY-MM-DD' ou null
 * @returns {'overdue'|'today'|'soon'|'future'|null}
 */
export function getDueDateStatus(dueDateStr) {
  if (!dueDateStr) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(dueDateStr + 'T00:00:00');

  const diffMs = dueDate.getTime() - today.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'today';
  if (diffDays <= 7) return 'soon';
  return 'future';
}

/**
 * Retorna label em PT-BR para o status de due date.
 * @param {'overdue'|'today'|'soon'|'future'|null} status
 * @returns {string}
 */
export function getDueDateLabel(status) {
  switch (status) {
    case 'overdue': return 'Atrasado';
    case 'today': return 'Vence hoje';
    case 'soon': return 'Vence esta semana';
    case 'future': return '';
    default: return '';
  }
}

/**
 * Formata data para exibicao no Card (formato curto PT-BR).
 * @param {string|null} dueDateStr - Data no formato 'YYYY-MM-DD'
 * @returns {string} Ex: '20 fev' ou '5 mar'
 */
export function formatDueDateShort(dueDateStr) {
  if (!dueDateStr) return '';
  const date = new Date(dueDateStr + 'T00:00:00');
  const months = [
    'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
    'jul', 'ago', 'set', 'out', 'nov', 'dez',
  ];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

/**
 * Formata millisegundos em formato compacto para badges.
 * @param {number} ms - Tempo em millisegundos
 * @returns {string} Ex: '23min', '1h 23min', '2h 05min'
 */
export function formatElapsed(ms) {
  if (ms <= 0) return '0min';
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}min`;
  return `${hours}h ${String(minutes).padStart(2, '0')}min`;
}

/**
 * Formata millisegundos em HH:MM:SS para display grande.
 * @param {number} ms - Tempo em millisegundos
 * @returns {string} Ex: '00:23:45', '01:05:30'
 */
export function formatElapsedClock(ms) {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Classifica a idade na coluna (dias).
 * @param {string|null} columnEnteredAt - ISO timestamp
 * @returns {{ days: number, status: 'neutral'|'warning'|'danger' }|null}
 */
export function getColumnAgeStatus(columnEnteredAt) {
  if (!columnEnteredAt) return null;
  const entered = new Date(columnEnteredAt);
  const now = new Date();
  const diffMs = now.getTime() - entered.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return null;
  let status = 'neutral';
  if (days >= 8) status = 'danger';
  else if (days >= 4) status = 'warning';
  return { days, status };
}
