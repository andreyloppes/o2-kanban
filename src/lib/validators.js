import { z } from 'zod';

export const createTaskSchema = z.object({
  column_id: z.string().uuid('column_id deve ser UUID valido'),
  board_id: z.string().uuid('board_id deve ser UUID valido').optional(),
  title: z.string().min(1, 'Titulo e obrigatorio').max(500),
  type: z.enum(['task', 'user_story', 'bug', 'epic', 'spike']).default('task'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  description: z.string().max(5000).nullable().optional(),
  assignee: z.string().max(100).nullable().optional(),
  due_date: z.string().nullable().optional(),
  start_date: z.string().nullable().optional(),
  estimated_duration_min: z.number().int().min(0).max(99999).nullable().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Titulo e obrigatorio').max(500).optional(),
  type: z.enum(['task', 'user_story', 'bug', 'epic', 'spike']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  description: z.string().max(5000).nullable().optional(),
  assignee: z.string().max(100).nullable().optional(),
  due_date: z.string().nullable().optional(),
  start_date: z.string().nullable().optional(),
  estimated_duration_min: z.number().int().min(0).max(99999).nullable().optional(),
});

export const moveTaskSchema = z.object({
  column_id: z.string().uuid(),
  position: z.number().positive(),
});

// --- Colunas ---

export const createColumnSchema = z.object({
  title: z.string().min(1, 'Titulo e obrigatorio').max(200),
  color: z.string().max(50).optional().default('neutral'),
});

export const updateColumnSchema = z.object({
  title: z.string().min(1, 'Titulo e obrigatorio').max(200).optional(),
  color: z.string().max(50).optional(),
  position: z.number().positive().optional(),
});

// --- Sprint 2: Comentarios ---

export const createCommentSchema = z.object({
  author: z.string().min(1, 'Autor e obrigatorio').max(100),
  content: z.string().min(1, 'Conteudo e obrigatorio').max(5000),
});

// --- Multi-page: Boards & Users ---

export const createBoardSchema = z.object({
  title: z.string().min(1, 'Titulo e obrigatorio').max(200),
  description: z.string().max(1000).nullable().optional(),
});

export const updateBoardSchema = z.object({
  title: z.string().min(1, 'Titulo e obrigatorio').max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Nome e obrigatorio').max(100).optional(),
  email: z.string().email('Email invalido').max(200).optional(),
  avatar_color: z.string().max(20).optional(),
});

// --- Automacoes ---

export const createAutomationSchema = z.object({
  name: z.string().min(1, 'Nome e obrigatorio').max(200),
  trigger_type: z.enum(['task_moved_to_column', 'task_created', 'task_overdue', 'timer_completed']),
  trigger_config: z.record(z.any()).default({}),
  action_type: z.enum(['set_priority', 'assign_member', 'log_execution', 'move_to_column', 'add_comment']),
  action_config: z.record(z.any()).default({}),
});
