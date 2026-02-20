import { z } from 'zod';

export const createTaskSchema = z.object({
  column_id: z.string().uuid('column_id deve ser UUID valido'),
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
});

export const moveTaskSchema = z.object({
  column_id: z.string().uuid(),
  position: z.number().positive(),
});
