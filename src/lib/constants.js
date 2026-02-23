// ID fixo do board "AI GUYS" (board padrao)
export const DEFAULT_BOARD_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

// Posicao base para novas tasks (incremento grande para float positioning)
export const POSITION_GAP = 1000.0;

// Tipos de task com labels em PT-BR
export const TASK_TYPES = {
  task: 'Tarefa',
  user_story: 'User Story',
  bug: 'Bug',
  epic: 'Epico',
  spike: 'Spike',
};

// Prioridades com labels em PT-BR
export const TASK_PRIORITIES = {
  low: 'Baixa',
  medium: 'Media',
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

// Chave para persistir ultimo autor de comentario no localStorage
export const COMMENT_AUTHOR_KEY = 'o2kanban_comment_author';

// Chave para persistir usuario atual no localStorage
export const CURRENT_USER_KEY = 'o2kanban_current_user';

// Roles de board
export const BOARD_ROLES = {
  owner: 'Admin',
  member: 'Membro',
};

// Colunas padrao ao criar novo board
export const DEFAULT_COLUMNS = [
  { title: 'Backlog', color: 'neutral' },
  { title: 'A Fazer', color: 'info' },
  { title: 'Em Progresso', color: 'progress' },
  { title: 'Revisao', color: 'review' },
  { title: 'Concluido', color: 'done' },
];

// Cores disponiveis para avatar
export const AVATAR_COLORS = [
  '#3b82f6',
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316',
];

// Status de solicitacao de acesso
export const JOIN_REQUEST_STATUS = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
};

// --- Pomodoro ---
export const POMODORO_DEFAULTS = {
  focusDurationMs: 25 * 60 * 1000,
  shortBreakMs: 5 * 60 * 1000,
  longBreakMs: 15 * 60 * 1000,
  sessionsBeforeLongBreak: 4,
  autoStartBreak: true,
  autoStartFocus: false,
  linkToTaskTimer: true,
};

export const POMODORO_SETTINGS_KEY = 'o2kanban_pomodoro_settings';

// --- Column Age Thresholds ---
export const COLUMN_AGE_THRESHOLDS = {
  warning: 4,  // dias
  danger: 8,   // dias
};

// --- Timer ---
export const TIMER_UPDATE_INTERVAL_MS = 1000;

// --- Automacoes ---
export const AUTOMATION_TRIGGERS = {
  task_moved_to_column: 'Tarefa movida para coluna',
  task_created: 'Tarefa criada',
  task_overdue: 'Tarefa atrasada',
  timer_completed: 'Timer finalizado',
};

export const AUTOMATION_ACTIONS = {
  set_priority: 'Definir prioridade',
  assign_member: 'Atribuir responsavel',
  log_execution: 'Registrar execucao',
  move_to_column: 'Mover para coluna',
  add_comment: 'Adicionar comentario',
};
