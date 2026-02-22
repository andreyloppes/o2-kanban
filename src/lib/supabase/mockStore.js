import { randomUUID } from 'crypto';

const DEFAULT_BOARD_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const MARKETING_BOARD_ID = 'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';

const COL = {
  backlog: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  todo: 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
  progress: 'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
  review: 'b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a04',
  done: 'b5eebc99-9c0b-4ef8-bb6d-6bb9bd380a05',
};

const MKT_COL = {
  backlog: 'b6eebc99-9c0b-4ef8-bb6d-6bb9bd380a06',
  todo: 'b7eebc99-9c0b-4ef8-bb6d-6bb9bd380a07',
  progress: 'b8eebc99-9c0b-4ef8-bb6d-6bb9bd380a08',
  review: 'b9eebc99-9c0b-4ef8-bb6d-6bb9bd380a09',
  done: 'baeebc99-9c0b-4ef8-bb6d-6bb9bd380a10',
};

const USER = {
  andrey: 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  felipe: 'd2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
  caio: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
  matheus: 'd4eebc99-9c0b-4ef8-bb6d-6bb9bd380a04',
};

function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(10, 0, 0, 0);
  return d.toISOString();
}

function createSeedData() {
  return {
    users: [
      { id: USER.andrey, slug: 'andrey', name: 'Andrey', email: 'andrey@o2inc.com', avatar_color: '#3b82f6', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
      { id: USER.felipe, slug: 'felipe', name: 'Felipe', email: 'felipe@o2inc.com', avatar_color: '#ef4444', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
      { id: USER.caio, slug: 'caio', name: 'Caio', email: 'caio@o2inc.com', avatar_color: '#f59e0b', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
      { id: USER.matheus, slug: 'matheus', name: 'Matheus', email: 'matheus@o2inc.com', avatar_color: '#10b981', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
    ],
    boards: [
      {
        id: DEFAULT_BOARD_ID,
        title: 'AI GUYS',
        description: 'Board principal do projeto',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
      {
        id: MARKETING_BOARD_ID,
        title: 'Marketing',
        description: 'Campanhas e estrategias de marketing',
        created_at: '2026-01-15T00:00:00Z',
        updated_at: '2026-01-15T00:00:00Z',
      },
    ],
    board_members: [
      { id: 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', board_id: DEFAULT_BOARD_ID, user_id: USER.andrey, role: 'owner', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
      { id: 'e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', board_id: DEFAULT_BOARD_ID, user_id: USER.felipe, role: 'member', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
      { id: 'e3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', board_id: DEFAULT_BOARD_ID, user_id: USER.caio, role: 'member', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
      { id: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', board_id: DEFAULT_BOARD_ID, user_id: USER.matheus, role: 'member', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
      { id: 'e5eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', board_id: MARKETING_BOARD_ID, user_id: USER.andrey, role: 'owner', created_at: '2026-01-15T00:00:00Z', updated_at: '2026-01-15T00:00:00Z' },
      { id: 'e6eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', board_id: MARKETING_BOARD_ID, user_id: USER.felipe, role: 'member', created_at: '2026-01-15T00:00:00Z', updated_at: '2026-01-15T00:00:00Z' },
    ],
    columns: [
      // AI GUYS columns
      { id: COL.backlog, board_id: DEFAULT_BOARD_ID, title: 'Backlog', position: 1000, color: 'neutral' },
      { id: COL.todo, board_id: DEFAULT_BOARD_ID, title: 'A Fazer', position: 2000, color: 'info' },
      { id: COL.progress, board_id: DEFAULT_BOARD_ID, title: 'Em Progresso', position: 3000, color: 'progress' },
      { id: COL.review, board_id: DEFAULT_BOARD_ID, title: 'Revisao', position: 4000, color: 'review' },
      { id: COL.done, board_id: DEFAULT_BOARD_ID, title: 'Concluido', position: 5000, color: 'done' },
      // Marketing columns
      { id: MKT_COL.backlog, board_id: MARKETING_BOARD_ID, title: 'Backlog', position: 1000, color: 'neutral' },
      { id: MKT_COL.todo, board_id: MARKETING_BOARD_ID, title: 'A Fazer', position: 2000, color: 'info' },
      { id: MKT_COL.progress, board_id: MARKETING_BOARD_ID, title: 'Em Progresso', position: 3000, color: 'progress' },
      { id: MKT_COL.review, board_id: MARKETING_BOARD_ID, title: 'Revisao', position: 4000, color: 'review' },
      { id: MKT_COL.done, board_id: MARKETING_BOARD_ID, title: 'Concluido', position: 5000, color: 'done' },
    ],
    tasks: [
      // === AI GUYS tasks ===
      {
        id: 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
        board_id: DEFAULT_BOARD_ID,
        column_id: COL.backlog,
        title: 'Implementar notificacoes push',
        description: 'Adicionar sistema de notificacoes em tempo real para o app',
        type: 'feature',
        priority: 'low',
        assignee: null,
        due_date: null,
        position: 1000,
        column_entered_at: daysAgo(12),
        timer_elapsed_ms: 0,
        timer_running: false,
        timer_started_at: null,
        created_at: '2026-01-10T10:00:00Z',
        updated_at: '2026-01-10T10:00:00Z',
      },
      {
        id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
        board_id: DEFAULT_BOARD_ID,
        column_id: COL.backlog,
        title: 'Melhorar responsividade mobile',
        description: 'Ajustar layouts para funcionar bem em telas menores',
        type: 'task',
        priority: 'medium',
        assignee: null,
        due_date: null,
        position: 2000,
        column_entered_at: daysAgo(2),
        timer_elapsed_ms: 0,
        timer_running: false,
        timer_started_at: null,
        created_at: '2026-01-11T10:00:00Z',
        updated_at: '2026-01-11T10:00:00Z',
      },
      {
        id: 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
        board_id: DEFAULT_BOARD_ID,
        column_id: COL.todo,
        title: 'Configurar autenticacao OAuth',
        description: 'Implementar login com Google e GitHub via Supabase Auth',
        type: 'task',
        priority: 'high',
        assignee: 'andrey',
        due_date: '2026-03-01',
        position: 1000,
        column_entered_at: daysAgo(7),
        timer_elapsed_ms: 1800000,
        timer_running: false,
        timer_started_at: null,
        created_at: '2026-01-15T10:00:00Z',
        updated_at: '2026-01-15T10:00:00Z',
      },
      {
        id: 'c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a04',
        board_id: DEFAULT_BOARD_ID,
        column_id: COL.todo,
        title: 'Criar tela de relatorios',
        description: 'Dashboard com metricas de velocidade do time',
        type: 'user_story',
        priority: 'medium',
        assignee: 'felipe',
        due_date: null,
        position: 2000,
        column_entered_at: daysAgo(3),
        timer_elapsed_ms: 0,
        timer_running: false,
        timer_started_at: null,
        created_at: '2026-01-16T10:00:00Z',
        updated_at: '2026-01-16T10:00:00Z',
      },
      {
        id: 'c5eebc99-9c0b-4ef8-bb6d-6bb9bd380a05',
        board_id: DEFAULT_BOARD_ID,
        column_id: COL.todo,
        title: 'Corrigir bug no drag-and-drop',
        description: 'Cards ficam duplicados ao mover rapidamente entre colunas',
        type: 'bug',
        priority: 'urgent',
        assignee: 'caio',
        due_date: '2026-02-25',
        position: 3000,
        column_entered_at: daysAgo(5),
        timer_elapsed_ms: 900000,
        timer_running: false,
        timer_started_at: null,
        created_at: '2026-01-17T10:00:00Z',
        updated_at: '2026-01-17T10:00:00Z',
      },
      {
        id: 'c6eebc99-9c0b-4ef8-bb6d-6bb9bd380a06',
        board_id: DEFAULT_BOARD_ID,
        column_id: COL.progress,
        title: 'Implementar filtros do board',
        description: 'Filtrar tasks por tipo, prioridade e responsavel',
        type: 'feature',
        priority: 'high',
        assignee: 'andrey',
        due_date: '2026-02-28',
        position: 1000,
        column_entered_at: daysAgo(14),
        timer_elapsed_ms: 5400000,
        timer_running: false,
        timer_started_at: null,
        created_at: '2026-01-20T10:00:00Z',
        updated_at: '2026-02-10T10:00:00Z',
      },
      {
        id: 'c7eebc99-9c0b-4ef8-bb6d-6bb9bd380a07',
        board_id: DEFAULT_BOARD_ID,
        column_id: COL.progress,
        title: 'Adicionar sistema de comentarios',
        description: 'Permitir comentarios em cada task do board',
        type: 'feature',
        priority: 'medium',
        assignee: 'matheus',
        due_date: null,
        position: 2000,
        column_entered_at: daysAgo(4),
        timer_elapsed_ms: 3600000,
        timer_running: false,
        timer_started_at: null,
        created_at: '2026-01-21T10:00:00Z',
        updated_at: '2026-02-12T10:00:00Z',
      },
      {
        id: 'c8eebc99-9c0b-4ef8-bb6d-6bb9bd380a08',
        board_id: DEFAULT_BOARD_ID,
        column_id: COL.review,
        title: 'Refatorar componente TaskModal',
        description: 'Separar logica em hooks e simplificar o componente',
        type: 'task',
        priority: 'medium',
        assignee: 'felipe',
        due_date: null,
        position: 1000,
        column_entered_at: daysAgo(1),
        timer_elapsed_ms: 7200000,
        timer_running: false,
        timer_started_at: null,
        created_at: '2026-01-25T10:00:00Z',
        updated_at: '2026-02-15T10:00:00Z',
      },
      {
        id: 'c9eebc99-9c0b-4ef8-bb6d-6bb9bd380a09',
        board_id: DEFAULT_BOARD_ID,
        column_id: COL.done,
        title: 'Setup inicial do projeto',
        description: 'Next.js, Supabase, Zustand, CSS Modules',
        type: 'task',
        priority: 'high',
        assignee: 'andrey',
        due_date: null,
        position: 1000,
        column_entered_at: daysAgo(52),
        timer_elapsed_ms: 0,
        timer_running: false,
        timer_started_at: null,
        created_at: '2026-01-01T10:00:00Z',
        updated_at: '2026-01-05T10:00:00Z',
      },
      {
        id: 'caeebc99-9c0b-4ef8-bb6d-6bb9bd380a10',
        board_id: DEFAULT_BOARD_ID,
        column_id: COL.done,
        title: 'CRUD basico de tasks',
        description: 'Criar, editar, mover e deletar tasks no board',
        type: 'feature',
        priority: 'high',
        assignee: 'caio',
        due_date: null,
        position: 2000,
        column_entered_at: daysAgo(48),
        timer_elapsed_ms: 0,
        timer_running: false,
        timer_started_at: null,
        created_at: '2026-01-05T10:00:00Z',
        updated_at: '2026-01-15T10:00:00Z',
      },
      // === Marketing tasks ===
      {
        id: 'cb1ebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
        board_id: MARKETING_BOARD_ID,
        column_id: MKT_COL.backlog,
        title: 'Analise de metricas de conversao',
        description: 'Levantar dados de conversao dos ultimos 3 meses',
        type: 'spike',
        priority: 'low',
        assignee: null,
        due_date: null,
        position: 1000,
        column_entered_at: daysAgo(5),
        timer_elapsed_ms: 0,
        timer_running: false,
        timer_started_at: null,
        created_at: '2026-01-20T10:00:00Z',
        updated_at: '2026-01-20T10:00:00Z',
      },
      {
        id: 'cb2ebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
        board_id: MARKETING_BOARD_ID,
        column_id: MKT_COL.todo,
        title: 'Campanha redes sociais Q1',
        description: 'Planejar e executar campanha para o primeiro trimestre',
        type: 'task',
        priority: 'medium',
        assignee: 'felipe',
        due_date: '2026-03-15',
        position: 1000,
        column_entered_at: daysAgo(3),
        timer_elapsed_ms: 0,
        timer_running: false,
        timer_started_at: null,
        created_at: '2026-01-22T10:00:00Z',
        updated_at: '2026-01-22T10:00:00Z',
      },
      {
        id: 'cb3ebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
        board_id: MARKETING_BOARD_ID,
        column_id: MKT_COL.progress,
        title: 'Redesign da landing page',
        description: 'Atualizar visual e copy da landing page principal',
        type: 'feature',
        priority: 'high',
        assignee: 'andrey',
        due_date: '2026-02-28',
        position: 1000,
        column_entered_at: daysAgo(7),
        timer_elapsed_ms: 3600000,
        timer_running: false,
        timer_started_at: null,
        created_at: '2026-01-18T10:00:00Z',
        updated_at: '2026-02-10T10:00:00Z',
      },
    ],
    task_comments: [
      {
        id: 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
        task_id: 'c6eebc99-9c0b-4ef8-bb6d-6bb9bd380a06',
        board_id: DEFAULT_BOARD_ID,
        author: 'andrey',
        content: 'Comecei a implementacao dos filtros por tipo e prioridade.',
        created_at: '2026-02-10T14:00:00Z',
        updated_at: '2026-02-10T14:00:00Z',
      },
      {
        id: 'd2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
        task_id: 'c6eebc99-9c0b-4ef8-bb6d-6bb9bd380a06',
        board_id: DEFAULT_BOARD_ID,
        author: 'felipe',
        content: 'Lembra de usar single-select nos filtros conforme decidimos.',
        created_at: '2026-02-11T09:00:00Z',
        updated_at: '2026-02-11T09:00:00Z',
      },
    ],
  };
}

function getStore() {
  if (!globalThis.__o2MockStore) {
    globalThis.__o2MockStore = createSeedData();
  }
  return globalThis.__o2MockStore;
}

class MockQueryBuilder {
  constructor(table) {
    this._table = table;
    this._operation = null;
    this._insertData = null;
    this._updateData = null;
    this._filters = [];
    this._orderBy = null;
    this._limit = null;
    this._selectCols = '*';
    this._single = false;
  }

  select(cols = '*') {
    if (!this._operation) this._operation = 'select';
    this._selectCols = cols;
    return this;
  }

  insert(data) {
    this._operation = 'insert';
    this._insertData = data;
    return this;
  }

  update(data) {
    this._operation = 'update';
    this._updateData = data;
    return this;
  }

  delete() {
    this._operation = 'delete';
    return this;
  }

  eq(col, val) {
    this._filters.push({ col, val });
    return this;
  }

  order(col, opts = {}) {
    this._orderBy = { col, ascending: opts.ascending !== false };
    return this;
  }

  limit(n) {
    this._limit = n;
    return this;
  }

  single() {
    this._single = true;
    return this;
  }

  _applyFilters(items) {
    return items.filter((item) =>
      this._filters.every((f) => item[f.col] === f.val)
    );
  }

  _applyOrder(items) {
    if (!this._orderBy) return items;
    const { col, ascending } = this._orderBy;
    return [...items].sort((a, b) => {
      if (a[col] < b[col]) return ascending ? -1 : 1;
      if (a[col] > b[col]) return ascending ? 1 : -1;
      return 0;
    });
  }

  _applySelectCols(items) {
    if (this._selectCols === '*') return items;
    const cols = this._selectCols.split(',').map((c) => c.trim());
    return items.map((item) => {
      const result = {};
      cols.forEach((c) => {
        result[c] = item[c];
      });
      return result;
    });
  }

  _execute() {
    const store = getStore();
    const table = store[this._table];
    if (!table) {
      return { data: null, error: { message: `Table ${this._table} not found` } };
    }

    let resultData;

    switch (this._operation) {
      case 'select': {
        let results = this._applyFilters([...table]);
        results = this._applyOrder(results);
        if (this._limit) results = results.slice(0, this._limit);
        resultData = this._applySelectCols(results);
        break;
      }
      case 'insert': {
        const now = new Date().toISOString();
        const newItem = {
          id: randomUUID(),
          ...this._insertData,
          created_at: now,
          updated_at: now,
        };
        table.push(newItem);
        resultData = this._applySelectCols([{ ...newItem }]);
        break;
      }
      case 'update': {
        const now = new Date().toISOString();
        const updated = [];
        for (let i = 0; i < table.length; i++) {
          const match = this._filters.every((f) => table[i][f.col] === f.val);
          if (match) {
            table[i] = { ...table[i], ...this._updateData, updated_at: now };
            updated.push({ ...table[i] });
          }
        }
        if (updated.length === 0) {
          return { data: null, error: { code: 'PGRST116', message: 'Not found' } };
        }
        resultData = this._applySelectCols(updated);
        break;
      }
      case 'delete': {
        const deleted = [];
        const remaining = [];
        for (const item of table) {
          const match = this._filters.every((f) => item[f.col] === f.val);
          if (match) {
            deleted.push({ ...item });
          } else {
            remaining.push(item);
          }
        }
        store[this._table] = remaining;
        resultData = this._applySelectCols(deleted);
        break;
      }
      default:
        return { data: null, error: { message: 'Unknown operation' } };
    }

    if (this._single) {
      if (!resultData || resultData.length === 0) {
        return { data: null, error: { code: 'PGRST116', message: 'Not found' } };
      }
      return { data: resultData[0], error: null };
    }

    return { data: resultData, error: null };
  }

  then(resolve, reject) {
    try {
      resolve(this._execute());
    } catch (err) {
      if (reject) reject(err);
      else resolve({ data: null, error: { message: err.message } });
    }
  }
}

export class MockSupabaseClient {
  from(table) {
    return new MockQueryBuilder(table);
  }
}
