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
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Titulo e obrigatorio').max(500).optional(),
  type: z.enum(['task', 'user_story', 'bug', 'epic', 'spike']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  description: z.string().max(5000).nullable().optional(),
  assignee: z.string().max(100).nullable().optional(),
  due_date: z.string().nullable().optional(),
  timer_elapsed_ms: z.number().min(0).optional(),
  timer_running: z.boolean().optional(),
  timer_started_at: z.string().nullable().optional(),
});

export const moveTaskSchema = z.object({
  column_id: z.string().uuid(),
  position: z.number().positive(),
  column_entered_at: z.string().optional(),
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
