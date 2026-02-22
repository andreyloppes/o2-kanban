import { describe, it, expect } from 'vitest';
import { createTaskSchema, updateTaskSchema, moveTaskSchema, createCommentSchema } from '../validators';

describe('createTaskSchema', () => {
  it('aceita dados validos com defaults', () => {
    const result = createTaskSchema.safeParse({
      column_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      title: 'Nova tarefa',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe('task');
      expect(result.data.priority).toBe('medium');
    }
  });

  it('aceita dados validos completos', () => {
    const result = createTaskSchema.safeParse({
      column_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      title: 'Bug urgente',
      type: 'bug',
      priority: 'urgent',
      description: 'Descricao do bug',
      assignee: 'andrey',
      due_date: '2026-03-01',
    });
    expect(result.success).toBe(true);
  });

  it('rejeita titulo vazio', () => {
    const result = createTaskSchema.safeParse({
      column_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      title: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejeita column_id invalido', () => {
    const result = createTaskSchema.safeParse({
      column_id: 'nao-e-uuid',
      title: 'Tarefa',
    });
    expect(result.success).toBe(false);
  });

  it('rejeita tipo invalido', () => {
    const result = createTaskSchema.safeParse({
      column_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      title: 'Tarefa',
      type: 'invalid',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateTaskSchema', () => {
  it('aceita objeto vazio (todos opcionais)', () => {
    const result = updateTaskSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('aceita atualizacao parcial', () => {
    const result = updateTaskSchema.safeParse({
      title: 'Titulo atualizado',
      priority: 'high',
    });
    expect(result.success).toBe(true);
  });
});

describe('moveTaskSchema', () => {
  it('aceita dados validos', () => {
    const result = moveTaskSchema.safeParse({
      column_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      position: 1000,
    });
    expect(result.success).toBe(true);
  });

  it('rejeita position negativa', () => {
    const result = moveTaskSchema.safeParse({
      column_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      position: -1,
    });
    expect(result.success).toBe(false);
  });
});

describe('createCommentSchema', () => {
  it('aceita dados validos', () => {
    const result = createCommentSchema.safeParse({
      author: 'andrey',
      content: 'Preciso de mais contexto.',
    });
    expect(result.success).toBe(true);
  });

  it('rejeita autor vazio', () => {
    const result = createCommentSchema.safeParse({
      author: '',
      content: 'Conteudo valido',
    });
    expect(result.success).toBe(false);
  });

  it('rejeita conteudo vazio', () => {
    const result = createCommentSchema.safeParse({
      author: 'andrey',
      content: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejeita conteudo com mais de 5000 caracteres', () => {
    const result = createCommentSchema.safeParse({
      author: 'andrey',
      content: 'a'.repeat(5001),
    });
    expect(result.success).toBe(false);
  });
});
