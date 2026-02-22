import { describe, it, expect, beforeEach } from 'vitest';
import useBoardStore from '../useBoardStore';
import useUIStore from '../useUIStore';

const COL_1 = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01';
const COL_2 = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02';

const makeTasks = () => [
  {
    id: 't1',
    column_id: COL_1,
    title: 'Bug critico no login',
    description: 'Erro ao autenticar',
    type: 'bug',
    priority: 'urgent',
    assignee: 'andrey',
    position: 1000,
    due_date: null,
  },
  {
    id: 't2',
    column_id: COL_1,
    title: 'Feature dashboard',
    description: null,
    type: 'task',
    priority: 'medium',
    assignee: null,
    position: 2000,
    due_date: '2026-03-01',
  },
  {
    id: 't3',
    column_id: COL_2,
    title: 'Setup CI',
    description: 'Configurar pipeline',
    type: 'spike',
    priority: 'low',
    assignee: 'felipe',
    position: 1000,
    due_date: null,
  },
  {
    id: 't4',
    column_id: COL_1,
    title: 'Correcao login mobile',
    description: 'Bug no mobile',
    type: 'bug',
    priority: 'high',
    assignee: 'andrey',
    position: 3000,
    due_date: null,
  },
];

describe('useBoardStore - getFilteredTasksByColumn', () => {
  beforeEach(() => {
    useBoardStore.setState({ tasks: makeTasks(), columns: [{ id: COL_1, title: 'To Do' }, { id: COL_2, title: 'Done' }] });
    useUIStore.setState({ filters: { type: null, priority: null, assignee: null, search: '' } });
  });

  it('retorna todas as tasks da coluna sem filtros', () => {
    const tasks = useBoardStore.getState().getFilteredTasksByColumn(COL_1);
    expect(tasks).toHaveLength(3);
  });

  it('filtra por tipo', () => {
    useUIStore.getState().setFilter('type', 'bug');
    const tasks = useBoardStore.getState().getFilteredTasksByColumn(COL_1);
    expect(tasks).toHaveLength(2);
    expect(tasks.every((t) => t.type === 'bug')).toBe(true);
  });

  it('filtra por prioridade', () => {
    useUIStore.getState().setFilter('priority', 'urgent');
    const tasks = useBoardStore.getState().getFilteredTasksByColumn(COL_1);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('t1');
  });

  it('filtra por assignee', () => {
    useUIStore.getState().setFilter('assignee', 'andrey');
    const tasks = useBoardStore.getState().getFilteredTasksByColumn(COL_1);
    expect(tasks).toHaveLength(2);
    expect(tasks.every((t) => t.assignee === 'andrey')).toBe(true);
  });

  it('filtra por assignee __unassigned__', () => {
    useUIStore.getState().setFilter('assignee', '__unassigned__');
    const tasks = useBoardStore.getState().getFilteredTasksByColumn(COL_1);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('t2');
  });

  it('filtra por search no titulo', () => {
    useUIStore.getState().setFilter('search', 'login');
    const tasks = useBoardStore.getState().getFilteredTasksByColumn(COL_1);
    expect(tasks).toHaveLength(2);
  });

  it('filtra por search na descricao', () => {
    useUIStore.getState().setFilter('search', 'autenticar');
    const tasks = useBoardStore.getState().getFilteredTasksByColumn(COL_1);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('t1');
  });

  it('composicao AND de filtros', () => {
    useUIStore.getState().setFilter('type', 'bug');
    useUIStore.getState().setFilter('priority', 'high');
    const tasks = useBoardStore.getState().getFilteredTasksByColumn(COL_1);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('t4');
  });

  it('retorna vazio se nenhuma task corresponde', () => {
    useUIStore.getState().setFilter('type', 'epic');
    const tasks = useBoardStore.getState().getFilteredTasksByColumn(COL_1);
    expect(tasks).toHaveLength(0);
  });

  it('retorna tasks ordenadas por position', () => {
    const tasks = useBoardStore.getState().getFilteredTasksByColumn(COL_1);
    expect(tasks[0].position).toBeLessThan(tasks[1].position);
    expect(tasks[1].position).toBeLessThan(tasks[2].position);
  });
});

describe('useBoardStore - getters', () => {
  beforeEach(() => {
    useBoardStore.setState({ tasks: makeTasks() });
  });

  it('getTaskById retorna task correta', () => {
    const task = useBoardStore.getState().getTaskById('t1');
    expect(task).toBeTruthy();
    expect(task.title).toBe('Bug critico no login');
  });

  it('getTaskById retorna undefined para id inexistente', () => {
    expect(useBoardStore.getState().getTaskById('xxx')).toBeUndefined();
  });

  it('getTasksByColumn retorna tasks filtradas por coluna', () => {
    const tasks = useBoardStore.getState().getTasksByColumn(COL_2);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('t3');
  });

  it('getNextPosition calcula posicao correta', () => {
    const pos = useBoardStore.getState().getNextPosition(COL_1);
    expect(pos).toBe(4000); // max(1000,2000,3000) + 1000
  });

  it('getNextPosition retorna POSITION_GAP para coluna vazia', () => {
    const pos = useBoardStore.getState().getNextPosition('empty-col');
    expect(pos).toBe(1000);
  });
});

describe('useBoardStore - hydrate', () => {
  it('hydrate seta board, columns e tasks', () => {
    const board = { id: 'b1', title: 'Test' };
    const columns = [{ id: 'c1', title: 'Col' }];
    const tasks = [{ id: 't1', title: 'T1' }];

    useBoardStore.getState().hydrate(board, columns, tasks);

    expect(useBoardStore.getState().board).toEqual(board);
    expect(useBoardStore.getState().columns).toEqual(columns);
    expect(useBoardStore.getState().tasks).toEqual(tasks);
    expect(useBoardStore.getState().isLoading).toBe(false);
  });
});
