// ID fixo do board "Oxy" para Sprint 1 (unico board)
export const DEFAULT_BOARD_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

// Posicao base para novas tasks (incremento grande para float positioning)
export const POSITION_GAP = 1000.0;

// Tipos de task com labels em PT-BR
export const TASK_TYPES = {
  task: 'Tarefa',
  user_story: 'User Story',
  bug: 'Bug',
  epic: 'Épico',
  spike: 'Spike',
};

// Prioridades com labels em PT-BR
export const TASK_PRIORITIES = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
};

// Mapeamento de prioridades para classes de cor CSS
export const PRIORITY_COLORS = {
  low: 'neutral',
  medium: 'warning',
  high: 'high',
  urgent: 'danger',
};

// Mapeamento de cor da coluna (DB) para classe CSS
export const COLUMN_COLOR_MAP = {
  info: 'status-todo',
  danger: 'status-urgent',
  progress: 'status-progress',
  review: 'status-review',
  done: 'status-done',
  success: 'status-done',
  neutral: 'status-backlog',
};

// Membros do time
export const TEAM_MEMBERS = [
  { id: 'andrey', name: 'Andrey' },
  { id: 'felipe', name: 'Felipe' },
  { id: 'caio', name: 'Caio' },
  { id: 'matheus', name: 'Matheus' },
];
