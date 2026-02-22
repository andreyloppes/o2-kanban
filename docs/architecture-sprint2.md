# O2 Kanban -- Arquitetura de Implementacao do Sprint 2

> **Autor:** Aria (System Architect Agent)
> **Data:** 2026-02-20
> **Versao:** 1.0
> **Status:** Blueprint de Implementacao -- Para uso direto pelo Dex (Dev Agent)
> **Baseado em:** Architecture Sprint 1 (Aria, v1.0) + PRD (Morgan, v1.0)
> **Pre-requisito:** Sprint 1 COMPLETO (commit 9c47f00)

---

## Indice

1. [Resumo Executivo](#1-resumo-executivo)
2. [Schema Changes](#2-schema-changes)
3. [Novas API Routes](#3-novas-api-routes)
4. [Store Changes](#4-store-changes)
5. [Arquitetura de Filtros](#5-arquitetura-de-filtros)
6. [Sistema de Comentarios](#6-sistema-de-comentarios)
7. [Sistema de Due Date](#7-sistema-de-due-date)
8. [Arquitetura de Testes](#8-arquitetura-de-testes)
9. [Mapa de Novos Componentes](#9-mapa-de-novos-componentes)
10. [Plano de Migracao](#10-plano-de-migracao)
11. [Dependencias a Instalar](#11-dependencias-a-instalar)

---

## 1. Resumo Executivo

O Sprint 2 ("Usability") adiciona quatro capacidades arquiteturais ao O2 Kanban, todas focadas em tornar o produto utilizavel no dia a dia do time:

1. **Sistema de Filtros e Busca** -- Filtragem client-side por tipo, prioridade, responsavel e busca textual com debounce. Atende diretamente as necessidades da PM Camila (filtros por prioridade/tipo) e do Lead Felipe (filtro por responsavel).

2. **Sistema de Comentarios** -- Comentarios planos (flat, sem threading) em tarefas, carregados sob demanda ao abrir o TaskModal. Atende o Dev Andrey (contexto rapido) e serve de base para a integracao Slack no Sprint 3.

3. **Indicadores Visuais de Due Date** -- Utilidades para classificacao temporal (atrasado, vence hoje, vence esta semana) com indicadores visuais no Card e no TaskModal. O campo `due_date` ja existe na tabela `tasks` desde o Sprint 1.

4. **Infraestrutura de Testes** -- Setup de Vitest + Testing Library + jsdom para testes unitarios e de integracao. Cobertura inicial: validators, stores, API routes e componentes-chave.

### O que NAO entra no Sprint 2

- Supabase Realtime (DIFERIDO pelo usuario -- sem conexoes de API externas por enquanto)
- Autenticacao / multi-board (Sprint 3)
- Integracao Slack real (Sprint 3)
- Testes E2E com Playwright (Sprint 4)
- Migracao para TypeScript (ADR-009: manter JavaScript)

### Decisoes Arquiteturais Chave

| Decisao | Justificativa |
|---------|---------------|
| Filtragem client-side | Dataset pequeno (~10 usuarios, ~50-100 tasks). Tasks ja estao em memoria via `hydrate()`. Evita round-trips desnecessarios ao servidor. |
| Busca textual client-side com `String.includes()` | Para o volume atual, full-text search no Postgres seria over-engineering. Reservamos o indice GIN para quando houver >500 tasks. |
| Comentarios sem threading | MVP de comentarios. Threading adiciona complexidade de UI e banco sem beneficio claro para ~10 usuarios. |
| Lazy-loading de comentarios | Nao inflar o payload inicial do `hydrate()`. Comentarios so sao necessarios quando o modal esta aberto. |
| Vitest (nao Jest) | Mais rapido, ESM nativo, configuracao minima com Vite. Alinhado com ecossistema moderno do Next.js. |

---

## 2. Schema Changes

### 2.1 Nova Tabela: `task_comments`

```sql
-- ============================================
-- O2 Kanban: Sprint 2 Migration
-- Nova tabela: task_comments
-- ============================================

CREATE TABLE task_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  board_id    UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  author      VARCHAR(100) NOT NULL,
  content     TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 5000),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indice principal: listar comentarios de uma task ordenados por data
CREATE INDEX idx_comments_task_created ON task_comments(task_id, created_at ASC);

-- Indice secundario: buscar comentarios por board (para futuro cleanup/admin)
CREATE INDEX idx_comments_board ON task_comments(board_id);

-- Trigger: auto-update updated_at
CREATE TRIGGER trg_comments_updated_at
  BEFORE UPDATE ON task_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: Acesso publico temporario (Sprint 2, sem auth)
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sprint 2: acesso publico a comments"
  ON task_comments FOR ALL
  USING (true)
  WITH CHECK (true);
```

### 2.2 Novos Indices para Filtros

Embora a filtragem principal seja client-side, adicionamos indices que serao uteis quando o dataset crescer ou quando migrarmos para filtragem server-side:

```sql
-- Indice para filtro por tipo (futuro server-side filter)
CREATE INDEX idx_tasks_type ON tasks(board_id, type);

-- Indice para filtro por prioridade (futuro server-side filter)
CREATE INDEX idx_tasks_priority ON tasks(board_id, priority);

-- Indice para filtro por responsavel (futuro server-side filter)
CREATE INDEX idx_tasks_assignee ON tasks(board_id, assignee);

-- Indice para filtro por due_date (vencimento)
CREATE INDEX idx_tasks_due_date ON tasks(board_id, due_date)
  WHERE due_date IS NOT NULL;
```

### 2.3 Full-Text Search (Preparacao Futura)

Para o Sprint 2, a busca textual sera client-side (`String.toLowerCase().includes()`). Porem, documentamos aqui o indice GIN para quando o volume justificar busca server-side:

```sql
-- NAO EXECUTAR NO SPRINT 2 — Documentado para referencia futura
-- Quando houver >500 tasks, migrar busca para server-side com:

-- CREATE EXTENSION IF NOT EXISTS unaccent;
--
-- CREATE INDEX idx_tasks_title_fts ON tasks
--   USING GIN (to_tsvector('portuguese', title));
--
-- Query exemplo:
-- SELECT * FROM tasks
-- WHERE to_tsvector('portuguese', title) @@ plainto_tsquery('portuguese', 'mapeamento');
```

**Decisao:** Nao criar o indice FTS agora. O custo de manutencao do indice GIN nao se justifica para ~50-100 tasks. Quando o volume crescer (Sprint 3+), o Dex pode aplicar esta migracao.

### 2.4 Resumo do Schema Apos Sprint 2

```
boards (Sprint 1 — sem alteracao)
├── id, title, description, is_archived, created_at, updated_at

columns (Sprint 1 — sem alteracao)
├── id, board_id, title, color, position, wip_limit, is_done_column, created_at

tasks (Sprint 1 — sem alteracao de schema, novos indices)
├── id, board_id, column_id, title, description, type, priority
├── assignee, position, due_date, created_at, updated_at
├── [NOVO INDEX] idx_tasks_type (board_id, type)
├── [NOVO INDEX] idx_tasks_priority (board_id, priority)
├── [NOVO INDEX] idx_tasks_assignee (board_id, assignee)
├── [NOVO INDEX] idx_tasks_due_date (board_id, due_date) WHERE due_date IS NOT NULL

task_comments (NOVO — Sprint 2)
├── id, task_id, board_id, author, content, created_at, updated_at
├── [INDEX] idx_comments_task_created (task_id, created_at)
├── [INDEX] idx_comments_board (board_id)
```

### 2.5 Arquivo de Migracao

Criar arquivo `supabase/migration-sprint2.sql` com todo o SQL acima (exceto o bloco de FTS comentado).

---

## 3. Novas API Routes

### 3.1 Convencoes (herdadas do Sprint 1)

- **Formato:** JSON
- **Erros:** `{ error: string }` com HTTP status code apropriado
- **Sucesso:** `{ [resource]: data }` (ex: `{ comment: {...} }`, `{ comments: [...] }`)
- **Sem autenticacao** no Sprint 2
- **Supabase server client** em todas as routes
- **Validacao Zod** em todos os inputs

### 3.2 GET /api/tasks/[taskId]/comments — Listar Comentarios

**Arquivo:** `src/app/api/tasks/[taskId]/comments/route.js`

**Request:**
```
GET /api/tasks/{taskId}/comments
```

**Response (200):**
```json
{
  "comments": [
    {
      "id": "uuid",
      "task_id": "uuid",
      "board_id": "uuid",
      "author": "andrey",
      "content": "Preciso de mais contexto sobre o mapeamento de categorias.",
      "created_at": "2026-02-20T14:30:00Z",
      "updated_at": "2026-02-20T14:30:00Z"
    }
  ]
}
```

**Response (404):**
```json
{ "error": "Tarefa nao encontrada" }
```

**Implementacao:**
```javascript
// src/app/api/tasks/[taskId]/comments/route.js
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createCommentSchema } from '@/lib/validators';
import { DEFAULT_BOARD_ID } from '@/lib/constants';

export async function GET(request, { params }) {
  const { taskId } = await params;
  const supabase = createServerClient();

  // Verificar que a task existe
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('id')
    .eq('id', taskId)
    .single();

  if (taskError || !task) {
    return NextResponse.json(
      { error: 'Tarefa nao encontrada' },
      { status: 404 }
    );
  }

  // Buscar comentarios ordenados por data de criacao (mais antigo primeiro)
  const { data: comments, error } = await supabase
    .from('task_comments')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comments: comments || [] });
}

export async function POST(request, { params }) {
  const { taskId } = await params;
  const supabase = createServerClient();
  const body = await request.json();

  // Validar com Zod
  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  // Verificar que a task existe
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('id, board_id')
    .eq('id', taskId)
    .single();

  if (taskError || !task) {
    return NextResponse.json(
      { error: 'Tarefa nao encontrada' },
      { status: 404 }
    );
  }

  const { author, content } = parsed.data;

  // Inserir comentario
  const { data: comment, error } = await supabase
    .from('task_comments')
    .insert({
      task_id: taskId,
      board_id: task.board_id,
      author,
      content,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comment }, { status: 201 });
}
```

### 3.3 DELETE /api/tasks/[taskId]/comments/[commentId] — Deletar Comentario

**Arquivo:** `src/app/api/tasks/[taskId]/comments/[commentId]/route.js`

**Request:**
```
DELETE /api/tasks/{taskId}/comments/{commentId}
```

**Response (200):**
```json
{ "success": true }
```

**Implementacao:**
```javascript
// src/app/api/tasks/[taskId]/comments/[commentId]/route.js
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function DELETE(request, { params }) {
  const { taskId, commentId } = await params;
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('task_comments')
    .delete()
    .eq('id', commentId)
    .eq('task_id', taskId)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: 'Comentario nao encontrado' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
```

### 3.4 Novos Validators (Zod)

Adicionar ao arquivo `src/lib/validators.js`:

```javascript
// --- Sprint 2: Comentarios ---

export const createCommentSchema = z.object({
  author: z.string().min(1, 'Autor e obrigatorio').max(100),
  content: z.string().min(1, 'Conteudo e obrigatorio').max(5000),
});
```

### 3.5 Resumo das API Routes (Sprint 1 + Sprint 2)

| Metodo | Path | Descricao | Sprint | Status Codes |
|--------|------|-----------|--------|-------------|
| GET | `/api/boards/[boardId]` | Board completo (columns + tasks) | 1 | 200, 404 |
| GET | `/api/tasks` | Listar tasks do board | 1 | 200, 500 |
| POST | `/api/tasks` | Criar task | 1 | 201, 400, 500 |
| GET | `/api/tasks/[taskId]` | Obter task por ID | 1 | 200, 404 |
| PATCH | `/api/tasks/[taskId]` | Atualizar task | 1 | 200, 400, 500 |
| DELETE | `/api/tasks/[taskId]` | Deletar task | 1 | 200, 500 |
| PATCH | `/api/tasks/[taskId]/move` | Mover task | 1 | 200, 400, 500 |
| **GET** | **`/api/tasks/[taskId]/comments`** | **Listar comentarios da task** | **2** | **200, 404, 500** |
| **POST** | **`/api/tasks/[taskId]/comments`** | **Criar comentario** | **2** | **201, 400, 404, 500** |
| **DELETE** | **`/api/tasks/[taskId]/comments/[commentId]`** | **Deletar comentario** | **2** | **200, 404, 500** |

---

## 4. Store Changes

### 4.1 useUIStore — Adicoes para Filtros

O estado de filtros vive no `useUIStore` porque e estado de UI (nao persiste no servidor, nao afeta dados). O filtro determina **o que o usuario ve**, nao o que existe.

```javascript
// Adicoes ao stores/useUIStore.js

// === State novo ===
filters: {
  type: null,        // 'task' | 'user_story' | 'bug' | 'epic' | 'spike' | null
  priority: null,    // 'low' | 'medium' | 'high' | 'urgent' | null
  assignee: null,    // 'andrey' | 'felipe' | ... | null
  search: '',        // string de busca (debounced no componente)
},

// === Actions novos ===
setFilter: (filterKey, value) =>
  set((state) => ({
    filters: {
      ...state.filters,
      [filterKey]: value,
    },
  })),

clearFilters: () =>
  set({
    filters: {
      type: null,
      priority: null,
      assignee: null,
      search: '',
    },
  }),

hasActiveFilters: () => {
  const { type, priority, assignee, search } = get().filters;
  return type !== null || priority !== null || assignee !== null || search !== '';
},
```

### 4.2 useBoardStore — Adicoes para Filtragem e Comentarios

```javascript
// Adicoes ao stores/useBoardStore.js

// === State novo ===
commentsCache: {},  // { [taskId]: Comment[] }
commentsLoading: {},  // { [taskId]: boolean }

// === Getter novo: Tasks filtradas por coluna ===
getFilteredTasksByColumn: (columnId) => {
  const { filters } = useUIStore.getState();
  let tasks = get().tasks.filter((t) => t.column_id === columnId);

  // Aplicar filtros
  if (filters.type) {
    tasks = tasks.filter((t) => t.type === filters.type);
  }
  if (filters.priority) {
    tasks = tasks.filter((t) => t.priority === filters.priority);
  }
  if (filters.assignee) {
    tasks = tasks.filter((t) => t.assignee === filters.assignee);
  }
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    tasks = tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(searchLower) ||
        (t.description && t.description.toLowerCase().includes(searchLower))
    );
  }

  return tasks.sort((a, b) => a.position - b.position);
},

// === Actions novos: Comentarios ===

/**
 * Carrega comentarios de uma task (lazy, chamado quando TaskModal abre).
 * Usa cache para evitar re-fetch se ja carregou.
 * @param {string} taskId - UUID da task
 * @param {boolean} force - Forcar re-fetch ignorando cache
 * @returns {Promise<Comment[]>} Lista de comentarios
 */
fetchComments: async (taskId, force = false) => {
  // Retornar cache se existir e nao for forcado
  if (!force && get().commentsCache[taskId]) {
    return get().commentsCache[taskId];
  }

  set((state) => ({
    commentsLoading: { ...state.commentsLoading, [taskId]: true },
  }));

  try {
    const res = await fetch(`/api/tasks/${taskId}/comments`);
    if (!res.ok) throw new Error('Falha ao carregar comentarios');

    const { comments } = await res.json();

    set((state) => ({
      commentsCache: { ...state.commentsCache, [taskId]: comments },
      commentsLoading: { ...state.commentsLoading, [taskId]: false },
    }));

    return comments;
  } catch (error) {
    set((state) => ({
      commentsLoading: { ...state.commentsLoading, [taskId]: false },
    }));
    useUIStore.getState().addToast('Erro ao carregar comentarios', 'error');
    return [];
  }
},

/**
 * Adiciona comentario (optimistic + persist).
 * @param {string} taskId - UUID da task
 * @param {string} author - Nome do autor
 * @param {string} content - Conteudo do comentario
 * @returns {Promise<Object|null>} Comentario criado ou null
 */
addComment: async (taskId, author, content) => {
  const tempId = `temp-comment-${Date.now()}`;
  const optimisticComment = {
    id: tempId,
    task_id: taskId,
    board_id: get().board?.id,
    author,
    content,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Optimistic: adicionar ao cache
  set((state) => ({
    commentsCache: {
      ...state.commentsCache,
      [taskId]: [...(state.commentsCache[taskId] || []), optimisticComment],
    },
  }));

  try {
    const res = await fetch(`/api/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, content }),
    });

    if (!res.ok) throw new Error('Falha ao adicionar comentario');

    const { comment: savedComment } = await res.json();

    // Substituir temp pelo real
    set((state) => ({
      commentsCache: {
        ...state.commentsCache,
        [taskId]: (state.commentsCache[taskId] || []).map((c) =>
          c.id === tempId ? savedComment : c
        ),
      },
    }));

    return savedComment;
  } catch (error) {
    // Rollback: remover o optimistic
    set((state) => ({
      commentsCache: {
        ...state.commentsCache,
        [taskId]: (state.commentsCache[taskId] || []).filter(
          (c) => c.id !== tempId
        ),
      },
    }));
    useUIStore.getState().addToast('Erro ao adicionar comentario', 'error');
    return null;
  }
},

/**
 * Remove comentario (optimistic + persist).
 * @param {string} taskId - UUID da task
 * @param {string} commentId - UUID do comentario
 * @returns {Promise<boolean>} Sucesso
 */
deleteComment: async (taskId, commentId) => {
  const previousComments = get().commentsCache[taskId] || [];
  const commentToDelete = previousComments.find((c) => c.id === commentId);
  if (!commentToDelete) return false;

  // Optimistic: remover do cache
  set((state) => ({
    commentsCache: {
      ...state.commentsCache,
      [taskId]: previousComments.filter((c) => c.id !== commentId),
    },
  }));

  try {
    const res = await fetch(`/api/tasks/${taskId}/comments/${commentId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Falha ao deletar comentario');
    return true;
  } catch (error) {
    // Rollback
    set((state) => ({
      commentsCache: {
        ...state.commentsCache,
        [taskId]: previousComments,
      },
    }));
    useUIStore.getState().addToast('Erro ao deletar comentario', 'error');
    return false;
  }
},

// Limpar cache de comentarios quando task e deletada
// (Adicionar ao final do deleteTask existente, apos sucesso)
// set(state => {
//   const { [taskId]: _, ...restCache } = state.commentsCache;
//   return { commentsCache: restCache };
// });
```

### 4.3 Relacionamento Atualizado entre Stores

```
useBoardStore                         useUIStore
├── board (metadata)                  ├── sidebarCollapsed
├── columns[]                         ├── collapsedColumns{}
├── tasks[]                           ├── activeTaskId
├── commentsCache{}       [NOVO]      ├── isCreateModalOpen
├── commentsLoading{}     [NOVO]      ├── createModalColumnId
├── isLoading                         ├── confirmDialog
├── error                             ├── toasts[]
│                                     ├── filters{}          [NOVO]
├── hydrate()                         │   ├── type
├── addTask()                         │   ├── priority
├── updateTask()                      │   ├── assignee
├── deleteTask()                      │   ├── search
├── moveTask()                        │
├── getFilteredTasksByColumn() [NOVO] ├── setFilter()        [NOVO]
├── fetchComments()        [NOVO]     ├── clearFilters()     [NOVO]
├── addComment()           [NOVO]     ├── hasActiveFilters()  [NOVO]
├── deleteComment()        [NOVO]     │
└── getTasksByColumn()                └── toggleSidebar()
```

**Nota sobre acoplamento:** `getFilteredTasksByColumn()` le de `useUIStore.getState().filters`. Este e o unico ponto onde `useBoardStore` consulta `useUIStore` diretamente (alem do toast). Isso e aceitavel porque a filtragem e uma funcao de projecao sobre dados existentes, nao uma mutacao de estado.

---

## 5. Arquitetura de Filtros

### 5.1 Decisao: Client-Side vs Server-Side

| Criterio | Client-Side | Server-Side |
|----------|:-----------:|:-----------:|
| Latencia | ~0ms (dados em memoria) | ~50-200ms (round-trip) |
| Complexidade | Baixa (filter/includes) | Media (query params, SQL) |
| Escalabilidade | Ate ~500 tasks | Ilimitado |
| Volume atual | ~50-100 tasks | -- |
| Volume estimado Sprint 4 | ~200 tasks | -- |

**Decisao:** Client-side para Sprint 2. O dataset inteiro ja esta em memoria apos `hydrate()`. Nao ha beneficio em adicionar round-trips ao servidor para filtrar ~50 tasks.

**Ponto de virada:** Quando o numero de tasks ultrapassar ~500 ou quando multi-board for implementado (Sprint 3+), migrar para filtragem server-side usando os indices criados na secao 2.2.

### 5.2 Fluxo de Dados dos Filtros

```
[FilterBar Component]
        |
        | setFilter('type', 'bug')
        v
[useUIStore.filters]
        |
        | (leitura direta via getState())
        v
[useBoardStore.getFilteredTasksByColumn(columnId)]
        |
        | filters.type === 'bug' → tasks.filter(t => t.type === 'bug')
        | filters.priority → tasks.filter(...)
        | filters.assignee → tasks.filter(...)
        | filters.search → tasks.filter(t => t.title.includes(...))
        v
[Column Component]
        |
        | Renderiza apenas tasks filtradas
        v
[Cards visíveis]
```

### 5.3 Composicao de Filtros

Filtros sao **aditivos** (AND): se o usuario seleciona tipo="bug" E prioridade="urgent", so aparecem bugs urgentes. A busca textual tambem compoe com os demais filtros.

```javascript
// Pseudocodigo da logica de filtragem
let filtered = tasks.filter(t => t.column_id === columnId);

if (filters.type)     filtered = filtered.filter(t => t.type === filters.type);
if (filters.priority) filtered = filtered.filter(t => t.priority === filters.priority);
if (filters.assignee) filtered = filtered.filter(t => t.assignee === filters.assignee);
if (filters.search)   filtered = filtered.filter(t =>
  t.title.toLowerCase().includes(filters.search.toLowerCase()) ||
  (t.description && t.description.toLowerCase().includes(filters.search.toLowerCase()))
);
```

### 5.4 Debounce da Busca Textual

O campo de busca textual usa debounce de 300ms para evitar re-renders a cada keystroke.

```javascript
// Implementacao no componente FilterBar
import { useState, useEffect } from 'react';
import useUIStore from '@/stores/useUIStore';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// No componente:
const [searchInput, setSearchInput] = useState('');
const debouncedSearch = useDebounce(searchInput, 300);

useEffect(() => {
  useUIStore.getState().setFilter('search', debouncedSearch);
}, [debouncedSearch]);
```

**Alternativa:** Extrair `useDebounce` como hook em `src/hooks/useDebounce.js` para reuso.

### 5.5 Indicador Visual de Filtros Ativos

Quando `hasActiveFilters()` retorna `true`:
- O icone de filtro no header do board muda de cor (ex: `var(--accent)`)
- Um badge numerico ou ponto indicador aparece no botao de filtro
- Um botao "Limpar filtros" fica visivel na FilterBar

### 5.6 Integracao com Column

O componente `Column` deve trocar de `getTasksByColumn` para `getFilteredTasksByColumn`:

```javascript
// ANTES (Sprint 1):
const tasks = useBoardStore((state) => state.getTasksByColumn(column.id));

// DEPOIS (Sprint 2):
const tasks = useBoardStore((state) => state.getFilteredTasksByColumn(column.id));
```

O `task count` no header da coluna tambem deve refletir o numero filtrado, com indicacao do total quando filtros estao ativos:

```
Em Progresso (2 de 5)  -- quando filtro ativo
Em Progresso (5)       -- quando sem filtro
```

---

## 6. Sistema de Comentarios

### 6.1 Modelo de Dados

```javascript
/**
 * @typedef {Object} Comment
 * @property {string} id - UUID
 * @property {string} task_id - UUID
 * @property {string} board_id - UUID
 * @property {string} author - Nome/ID do autor (ex: 'andrey')
 * @property {string} content - Conteudo do comentario (max 5000 chars)
 * @property {string} created_at - ISO 8601
 * @property {string} updated_at - ISO 8601
 */
```

### 6.2 Fluxo: Carregar Comentarios

```
1. Usuario clica em um Card → TaskModal abre
2. TaskModal detecta activeTaskId via useUIStore
3. useEffect no TaskModal chama useBoardStore.fetchComments(taskId)
4. fetchComments verifica commentsCache[taskId]:
   a. Se existir → retorna cache (sem fetch)
   b. Se nao existir → GET /api/tasks/{taskId}/comments
5. Comentarios armazenados em commentsCache[taskId]
6. CommentSection renderiza a lista
```

### 6.3 Fluxo: Adicionar Comentario

```
1. Usuario digita no campo de comentario dentro do TaskModal
2. Usuario clica "Enviar" (ou Enter)
3. CommentSection chama useBoardStore.addComment(taskId, author, content)
4. addComment faz optimistic update:
   a. Cria comentario temporario (id: temp-comment-xxx)
   b. Adiciona ao commentsCache[taskId]
   c. Comentario aparece instantaneamente na lista
5. addComment faz POST /api/tasks/{taskId}/comments
6. API valida com Zod, insere no Supabase, retorna comment com ID real
7. Store substitui ID temporario pelo ID real no cache
8. Se falhar → rollback (remove o temp do cache) + toast de erro
```

### 6.4 Fluxo: Deletar Comentario

```
1. Usuario clica no icone de lixeira em um comentario proprio
2. ConfirmDialog pergunta confirmacao
3. Ao confirmar: useBoardStore.deleteComment(taskId, commentId)
4. Optimistic: comentario removido da lista imediatamente
5. DELETE /api/tasks/{taskId}/comments/{commentId}
6. Se falhar → rollback (comentario reaparece) + toast de erro
```

### 6.5 Autor do Comentario

No Sprint 2 (sem auth), o `author` e selecionado pelo usuario via dropdown dos `TEAM_MEMBERS` existentes. O dropdown e persistido na sessao (ultimo autor selecionado).

```javascript
// O campo 'author' no Sprint 2 vem do TEAM_MEMBERS em constants.js
// No Sprint 3, quando auth for implementado, vira automatico do user logado
```

### 6.6 Limpeza de Cache

- Quando uma task e deletada, o cache de comentarios dessa task deve ser removido
- Ao fechar o TaskModal, o cache e **mantido** (evita re-fetch ao reabrir)
- Um botao de "atualizar" pode forcar re-fetch (`fetchComments(taskId, true)`)

---

## 7. Sistema de Due Date

### 7.1 Estado Atual

O campo `due_date` (tipo `DATE`) ja existe na tabela `tasks` desde o Sprint 1. O `TaskForm` (criacao) e o `TaskModal` (edicao) ja podem receber `due_date` via o schema Zod. O que falta e:

1. Campo de input de data no TaskForm e TaskModal
2. Indicadores visuais no Card
3. Funcoes utilitarias para classificacao temporal

### 7.2 Funcoes Utilitarias de Data

Criar arquivo `src/lib/dateUtils.js`:

```javascript
// src/lib/dateUtils.js

/**
 * Classifica uma due_date em relacao a hoje.
 * @param {string|null} dueDateStr - Data no formato 'YYYY-MM-DD' ou null
 * @returns {'overdue'|'today'|'this-week'|'future'|null}
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
  if (diffDays <= 7) return 'this-week';
  return 'future';
}

/**
 * Retorna label em PT-BR para o status de due date.
 * @param {'overdue'|'today'|'this-week'|'future'|null} status
 * @returns {string}
 */
export function getDueDateLabel(status) {
  switch (status) {
    case 'overdue': return 'Atrasado';
    case 'today': return 'Vence hoje';
    case 'this-week': return 'Vence esta semana';
    case 'future': return '';
    default: return '';
  }
}

/**
 * Formata data para exibicao no Card (formato curto PT-BR).
 * @param {string} dueDateStr - Data no formato 'YYYY-MM-DD'
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
```

### 7.3 Indicadores Visuais no Card

O componente `Card` exibira um indicador de due date com cores semanticas:

| Status | Classe CSS | Cor | Icone |
|--------|-----------|-----|-------|
| `overdue` | `due-overdue` | `var(--color-danger)` / vermelho | `Clock` (lucide) |
| `today` | `due-today` | `var(--color-warning)` / laranja | `Clock` |
| `this-week` | `due-week` | `#eab308` / amarelo | `Clock` |
| `future` | `due-future` | `var(--text-muted)` / cinza | `Clock` |
| `null` | (nao renderiza) | -- | -- |

### 7.4 Design Tokens para Due Date

Adicionar ao `globals.css`:

```css
/* Due Date Indicators */
--due-overdue-bg: rgba(239, 68, 68, 0.15);
--due-overdue-text: var(--color-danger);
--due-overdue-border: rgba(239, 68, 68, 0.3);

--due-today-bg: rgba(245, 158, 11, 0.15);
--due-today-text: var(--color-warning);
--due-today-border: rgba(245, 158, 11, 0.3);

--due-week-bg: rgba(234, 179, 8, 0.15);
--due-week-text: #eab308;
--due-week-border: rgba(234, 179, 8, 0.3);
```

### 7.5 Campo de Data no TaskForm e TaskModal

Adicionar input de data nos formularios de criacao e edicao:

```javascript
// No TaskForm (criacao) e TaskModal (edicao):
<FormField label="Data de vencimento" htmlFor="task-due-date">
  <Input
    id="task-due-date"
    type="date"
    value={dueDate}
    onChange={(e) => setDueDate(e.target.value)}
  />
</FormField>
```

O campo `due_date` ja e aceito pelo `createTaskSchema` e `updateTaskSchema` existentes.

---

## 8. Arquitetura de Testes

### 8.1 Decisao: Vitest

| Criterio | Vitest | Jest |
|----------|:------:|:----:|
| Velocidade | Muito rapido (Vite) | Lento (babel transform) |
| ESM nativo | Sim | Parcial (experimental) |
| Config | Minima | Verbosa |
| Compatibilidade Testing Library | Total | Total |
| Watch mode | HMR-like | Padrao |

**Decisao:** Vitest. Mais rapido, menos configuracao, ESM nativo.

### 8.2 Configuracao do Vitest

Criar arquivo `vitest.config.js` na raiz do projeto:

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/test/**',
        'src/types/**',
        'src/app/layout.js',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 8.3 Arquivo de Setup

Criar `src/test/setup.js`:

```javascript
// src/test/setup.js
import '@testing-library/jest-dom';
```

### 8.4 Estrutura de Arquivos de Teste

Testes ficam adjacentes ao codigo fonte em pastas `__tests__/`:

```
src/
├── lib/
│   ├── validators.js
│   ├── dateUtils.js            [NOVO]
│   └── __tests__/
│       ├── validators.test.js  [NOVO]
│       └── dateUtils.test.js   [NOVO]
│
├── stores/
│   ├── useBoardStore.js
│   ├── useUIStore.js
│   └── __tests__/
│       ├── useBoardStore.test.js   [NOVO]
│       └── useUIStore.test.js      [NOVO]
│
├── components/
│   ├── Kanban/
│   │   ├── Card.js
│   │   ├── Column.js
│   │   ├── FilterBar.js        [NOVO]
│   │   └── __tests__/
│   │       ├── Card.test.js         [NOVO]
│   │       └── FilterBar.test.js    [NOVO]
│   └── ui/
│       └── __tests__/
│           └── Badge.test.js        [NOVO]
│
├── app/
│   └── api/
│       └── tasks/
│           └── [taskId]/
│               └── comments/
│                   └── __tests__/
│                       └── route.test.js  [NOVO]
│
└── test/
    └── setup.js                [NOVO]
```

### 8.5 O Que Testar no Sprint 2

#### Prioridade Alta (MUST TEST)

| Arquivo | O que testar | Tipo |
|---------|-------------|------|
| `lib/validators.js` | Schemas Zod: inputs validos e invalidos para create/update/move/comment | Unitario |
| `lib/dateUtils.js` | `getDueDateStatus()`, `getDueDateLabel()`, `formatDueDateShort()` com datas passadas, hoje, futuro, null | Unitario |
| `stores/useUIStore.js` | setFilter, clearFilters, hasActiveFilters, addToast, removeToast | Unitario |
| `stores/useBoardStore.js` | getFilteredTasksByColumn com diferentes combinacoes de filtros | Unitario |

#### Prioridade Media (SHOULD TEST)

| Arquivo | O que testar | Tipo |
|---------|-------------|------|
| `components/Kanban/Card.js` | Renderiza titulo, tipo, prioridade, assignee, due date indicator | Componente |
| `components/Kanban/FilterBar.js` | Interacao: selecionar filtro → state atualiza; limpar filtros | Componente |
| `components/ui/Badge.js` | Renderiza com cada variante de prioridade | Componente |
| `api/tasks/[taskId]/comments/route.js` | GET retorna lista; POST cria comentario; validacao de input | API Route |

#### Prioridade Baixa (COULD TEST)

| Arquivo | O que testar | Tipo |
|---------|-------------|------|
| `stores/useBoardStore.js` | addComment optimistic + rollback, deleteComment | Unitario |
| `components/Kanban/Column.js` | Exibe contagem filtrada vs total | Componente |

### 8.6 Exemplos de Testes

#### Teste de Validators

```javascript
// src/lib/__tests__/validators.test.js
import { describe, it, expect } from 'vitest';
import { createTaskSchema, createCommentSchema } from '../validators';

describe('createTaskSchema', () => {
  it('aceita dados validos', () => {
    const result = createTaskSchema.safeParse({
      column_id: 'c0000001-0000-0000-0000-000000000001',
      title: 'Nova tarefa',
      type: 'bug',
      priority: 'urgent',
    });
    expect(result.success).toBe(true);
  });

  it('rejeita titulo vazio', () => {
    const result = createTaskSchema.safeParse({
      column_id: 'c0000001-0000-0000-0000-000000000001',
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
});

describe('createCommentSchema', () => {
  it('aceita dados validos', () => {
    const result = createCommentSchema.safeParse({
      author: 'andrey',
      content: 'Preciso de mais contexto.',
    });
    expect(result.success).toBe(true);
  });

  it('rejeita conteudo vazio', () => {
    const result = createCommentSchema.safeParse({
      author: 'andrey',
      content: '',
    });
    expect(result.success).toBe(false);
  });
});
```

#### Teste de dateUtils

```javascript
// src/lib/__tests__/dateUtils.test.js
import { describe, it, expect, vi, afterEach } from 'vitest';
import { getDueDateStatus, getDueDateLabel, formatDueDateShort } from '../dateUtils';

describe('getDueDateStatus', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('retorna null para due_date null', () => {
    expect(getDueDateStatus(null)).toBeNull();
  });

  it('retorna "overdue" para data no passado', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-20'));
    expect(getDueDateStatus('2026-02-19')).toBe('overdue');
  });

  it('retorna "today" para data de hoje', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-20'));
    expect(getDueDateStatus('2026-02-20')).toBe('today');
  });

  it('retorna "this-week" para data dentro de 7 dias', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-20'));
    expect(getDueDateStatus('2026-02-25')).toBe('this-week');
  });

  it('retorna "future" para data alem de 7 dias', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-20'));
    expect(getDueDateStatus('2026-03-15')).toBe('future');
  });
});

describe('getDueDateLabel', () => {
  it('retorna label PT-BR correto', () => {
    expect(getDueDateLabel('overdue')).toBe('Atrasado');
    expect(getDueDateLabel('today')).toBe('Vence hoje');
    expect(getDueDateLabel('this-week')).toBe('Vence esta semana');
    expect(getDueDateLabel('future')).toBe('');
    expect(getDueDateLabel(null)).toBe('');
  });
});

describe('formatDueDateShort', () => {
  it('formata data corretamente', () => {
    expect(formatDueDateShort('2026-02-20')).toBe('20 fev');
    expect(formatDueDateShort('2026-03-05')).toBe('5 mar');
  });

  it('retorna string vazia para null', () => {
    expect(formatDueDateShort(null)).toBe('');
  });
});
```

#### Teste de Store (useUIStore — filtros)

```javascript
// src/stores/__tests__/useUIStore.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import useUIStore from '../useUIStore';

describe('useUIStore - Filtros', () => {
  beforeEach(() => {
    // Reset store state
    useUIStore.setState({
      filters: { type: null, priority: null, assignee: null, search: '' },
    });
  });

  it('setFilter atualiza filtro especifico', () => {
    useUIStore.getState().setFilter('type', 'bug');
    expect(useUIStore.getState().filters.type).toBe('bug');
    expect(useUIStore.getState().filters.priority).toBeNull();
  });

  it('clearFilters reseta todos os filtros', () => {
    useUIStore.getState().setFilter('type', 'bug');
    useUIStore.getState().setFilter('priority', 'urgent');
    useUIStore.getState().clearFilters();

    const { filters } = useUIStore.getState();
    expect(filters.type).toBeNull();
    expect(filters.priority).toBeNull();
    expect(filters.assignee).toBeNull();
    expect(filters.search).toBe('');
  });

  it('hasActiveFilters retorna true quando filtro ativo', () => {
    expect(useUIStore.getState().hasActiveFilters()).toBe(false);
    useUIStore.getState().setFilter('type', 'bug');
    expect(useUIStore.getState().hasActiveFilters()).toBe(true);
  });
});
```

### 8.7 Scripts npm

Adicionar ao `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

---

## 9. Mapa de Novos Componentes

### 9.1 Componentes a Criar

| Componente | Arquivo | Tipo | Descricao |
|-----------|---------|------|-----------|
| `FilterBar` | `src/components/Kanban/FilterBar.js` | Client | Barra de filtros no header do board (tipo, prioridade, responsavel, busca) |
| `FilterBar.module.css` | `src/components/Kanban/FilterBar.module.css` | CSS | Estilos da barra de filtros |
| `SearchInput` | `src/components/ui/SearchInput.js` | Client | Campo de busca com icone e debounce embutido |
| `SearchInput.module.css` | `src/components/ui/SearchInput.module.css` | CSS | Estilos do campo de busca |
| `CommentSection` | `src/components/Kanban/CommentSection.js` | Client | Lista de comentarios + formulario de novo comentario |
| `CommentSection.module.css` | `src/components/Kanban/CommentSection.module.css` | CSS | Estilos da secao de comentarios |
| `CommentItem` | `src/components/Kanban/CommentItem.js` | Client | Comentario individual (avatar, autor, data, conteudo, delete) |
| `DueDateBadge` | `src/components/ui/DueDateBadge.js` | Client | Badge de due date com cor semantica |
| `DueDateBadge.module.css` | `src/components/ui/DueDateBadge.module.css` | CSS | Estilos do badge de due date |

### 9.2 Componentes a Modificar

| Componente | Modificacao |
|-----------|-------------|
| `Board.js` | Adicionar `<FilterBar />` no header, entre titulo e avatares |
| `Column.js` | Trocar `getTasksByColumn` por `getFilteredTasksByColumn`; exibir contagem filtrada/total |
| `Card.js` | Adicionar `<DueDateBadge />` quando task tem due_date |
| `TaskModal.js` | Adicionar campo de due_date + `<CommentSection />` no corpo |
| `TaskForm.js` | Adicionar campo de input date para due_date |
| `useUIStore.js` | Adicionar state e actions de filtros (secao 4.1) |
| `useBoardStore.js` | Adicionar `getFilteredTasksByColumn`, `commentsCache`, actions de comentarios (secao 4.2) |
| `validators.js` | Adicionar `createCommentSchema` (secao 3.4) |
| `constants.js` | Adicionar constante `COMMENT_AUTHOR_KEY` para localStorage |
| `globals.css` | Adicionar tokens de due date (secao 7.4) |
| `types/index.js` | Adicionar typedef `Comment` |

### 9.3 Arquivos Utilitarios a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/lib/dateUtils.js` | Funcoes de classificacao e formatacao de due date |
| `src/hooks/useDebounce.js` | Hook generico de debounce |
| `src/test/setup.js` | Setup do ambiente de testes |
| `vitest.config.js` | Configuracao do Vitest |
| `supabase/migration-sprint2.sql` | SQL de migracao do Sprint 2 |

### 9.4 Hierarquia de Componentes Atualizada (Sprint 2)

```
KanbanPage (page.js)
├── Sidebar
├── DndProvider
│   └── Board
│       ├── BoardHeader
│       │   ├── Titulo
│       │   ├── FilterBar                    [NOVO]
│       │   │   ├── Select (tipo)
│       │   │   ├── Select (prioridade)
│       │   │   ├── Select (responsavel)
│       │   │   ├── SearchInput              [NOVO]
│       │   │   └── Botao "Limpar filtros"
│       │   └── AvatarGroup
│       └── BoardContent
│           ├── Column
│           │   ├── ColumnHeader (contagem filtrada/total)
│           │   ├── SortableContext
│           │   │   └── Card
│           │   │       ├── CardHeader (tipo)
│           │   │       ├── CardTitle
│           │   │       ├── TagsContainer (priority badge)
│           │   │       ├── DueDateBadge     [NOVO]
│           │   │       └── CardFooter (assignee)
│           │   └── CreateTaskButton
│           └── Column...
├── TaskForm
├── TaskModal
│   ├── (campos existentes)
│   ├── DueDateInput                         [NOVO no form]
│   └── CommentSection                       [NOVO]
│       ├── CommentItem                      [NOVO]
│       ├── CommentItem...
│       └── CommentForm (input + enviar)
├── ConfirmDialog
└── ToastContainer
```

---

## 10. Plano de Migracao

Passos ordenados para implementar o Sprint 2 **sem quebrar nada em nenhum momento**. Cada fase e deployavel independentemente.

### Fase 0: Infraestrutura de Testes (Dia 1)

**Passo 0.1 — Instalar dependencias de teste**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Passo 0.2 — Criar `vitest.config.js`** (raiz do projeto, conforme secao 8.2)

**Passo 0.3 — Criar `src/test/setup.js`** (conforme secao 8.3)

**Passo 0.4 — Adicionar scripts ao `package.json`** (conforme secao 8.7)

**Passo 0.5 — Criar teste de validacao (smoke test)**
Criar `src/lib/__tests__/validators.test.js` e rodar `npm test` para verificar que o setup funciona.

**Checkpoint:** `npm test` executa e passa.

### Fase 1: Schema e API de Comentarios (Dia 1-2)

**Passo 1.1 — Criar `supabase/migration-sprint2.sql`**
Conteudo: tabela `task_comments` + novos indices (secao 2.1 e 2.2).

**Passo 1.2 — Executar migracao no Supabase**
SQL Editor > Executar migration-sprint2.sql.

**Passo 1.3 — Adicionar `createCommentSchema` ao `validators.js`** (secao 3.4)

**Passo 1.4 — Criar API route de comentarios**
- `src/app/api/tasks/[taskId]/comments/route.js` (GET + POST)
- `src/app/api/tasks/[taskId]/comments/[commentId]/route.js` (DELETE)

**Passo 1.5 — Testar API routes manualmente** (curl ou browser)

**Passo 1.6 — Escrever testes para validators (incluindo createCommentSchema)**

**Checkpoint:** API de comentarios funciona. Testes de validators passam.

### Fase 2: Utilitarios e Testes (Dia 2)

**Passo 2.1 — Criar `src/lib/dateUtils.js`** (secao 7.2)

**Passo 2.2 — Criar `src/hooks/useDebounce.js`** (secao 5.4)

**Passo 2.3 — Escrever testes para dateUtils** (secao 8.6)

**Passo 2.4 — Atualizar `src/types/index.js`** com typedef Comment

**Checkpoint:** Testes de dateUtils passam. Hook useDebounce pronto.

### Fase 3: Store Changes (Dia 2-3)

**Passo 3.1 — Adicionar filtros ao `useUIStore`** (secao 4.1)

**Passo 3.2 — Adicionar `getFilteredTasksByColumn` ao `useBoardStore`** (secao 4.2)

**Passo 3.3 — Adicionar actions de comentarios ao `useBoardStore`** (secao 4.2)

**Passo 3.4 — Escrever testes para stores** (secao 8.6)

**Passo 3.5 — Atualizar `deleteTask` no useBoardStore** para limpar commentsCache da task

**Checkpoint:** Testes de stores passam. Filtros e comentarios funcionam a nivel de store.

### Fase 4: Componentes de Filtros (Dia 3-4)

**Passo 4.1 — Criar `FilterBar.js` + `FilterBar.module.css`**
Componente com selects para tipo, prioridade, responsavel + campo de busca.

**Passo 4.2 — Criar `SearchInput.js` + `SearchInput.module.css`**
Campo de busca com icone e debounce.

**Passo 4.3 — Modificar `Board.js`**
Adicionar `<FilterBar />` no header.

**Passo 4.4 — Modificar `Column.js`**
Trocar `getTasksByColumn` por `getFilteredTasksByColumn`. Exibir contagem filtrada.

**Passo 4.5 — Adicionar tokens de filtro ao `globals.css`** (se necessario)

**Passo 4.6 — Escrever testes para FilterBar**

**Checkpoint:** Filtros funcionais na UI. Busca com debounce funciona.

### Fase 5: Componentes de Due Date (Dia 4)

**Passo 5.1 — Adicionar tokens de due date ao `globals.css`** (secao 7.4)

**Passo 5.2 — Criar `DueDateBadge.js` + `DueDateBadge.module.css`**

**Passo 5.3 — Modificar `Card.js`**
Adicionar `<DueDateBadge dueDate={task.due_date} />` no card.

**Passo 5.4 — Modificar `TaskModal.js`**
Adicionar campo de input date para due_date.

**Passo 5.5 — Modificar `TaskForm.js`**
Adicionar campo de input date para due_date na criacao.

**Checkpoint:** Due dates visiveis nos cards com indicadores de cor.

### Fase 6: Sistema de Comentarios na UI (Dia 4-5)

**Passo 6.1 — Criar `CommentItem.js`**
Componente individual de comentario.

**Passo 6.2 — Criar `CommentSection.js` + `CommentSection.module.css`**
Lista de comentarios + formulario de novo comentario.

**Passo 6.3 — Modificar `TaskModal.js`**
Adicionar `<CommentSection taskId={taskId} />` no corpo, apos os meta-dados.

**Passo 6.4 — Adicionar useEffect no TaskModal** para chamar `fetchComments(taskId)` ao abrir.

**Checkpoint:** Comentarios carregam ao abrir o modal. Criar e deletar comentarios funciona.

### Fase 7: Testes e Polish (Dia 5)

**Passo 7.1 — Escrever testes de componentes** (Card, FilterBar, Badge)

**Passo 7.2 — Rodar suite completa** (`npm test`)

**Passo 7.3 — Rodar coverage** (`npm run test:coverage`)

**Passo 7.4 — Testes manuais end-to-end:**
- Criar tarefa com due_date → verificar indicador no card
- Filtrar por tipo → colunas exibem apenas tasks filtradas
- Combinar filtros → filtragem aditiva funciona
- Buscar por texto → debounce + resultados corretos
- Limpar filtros → board restaura visao completa
- Abrir task → comentarios carregam
- Adicionar comentario → aparece instantaneamente (optimistic)
- Deletar comentario → removido instantaneamente (optimistic)
- Verificar todos os textos em PT-BR
- Verificar que funcionalidades do Sprint 1 continuam funcionando

**Checkpoint:** Todos os testes passam. Sprint 2 completo.

### Ordem Resumida

```
Dia 1: Fase 0 (infra testes) + Fase 1 (schema + API comments)
Dia 2: Fase 2 (utilitarios) + Fase 3 (stores)
Dia 3: Fase 4 (componentes filtros)
Dia 4: Fase 5 (due date) + Fase 6 (comments UI)
Dia 5: Fase 7 (testes + polish)
```

---

## 11. Dependencias a Instalar

### 11.1 DevDependencies (Testes)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

| Pacote | Versao | Proposito |
|--------|--------|-----------|
| `vitest` | ^3.x | Test runner (alternativa rapida ao Jest) |
| `@testing-library/react` | ^16.x | Renderizacao de componentes React para testes |
| `@testing-library/jest-dom` | ^6.x | Matchers extras para DOM (toBeInTheDocument, etc.) |
| `@testing-library/user-event` | ^14.x | Simulacao realista de interacoes do usuario |
| `jsdom` | ^26.x | Ambiente DOM para testes (substitui browser) |

### 11.2 Nenhuma Dependencia de Producao Nova

O Sprint 2 **nao requer** novas dependencias de producao. Tudo e construido com o stack existente:

- Filtros: Zustand + React (ja instalados)
- Comentarios: Supabase + Zustand + React (ja instalados)
- Due date: Funcoes utilitarias puras (sem dependencia)
- CSS: CSS Modules + globals.css (padrao existente)

### 11.3 Impacto no Bundle

| Metrica | Sprint 1 | Sprint 2 | Delta |
|---------|:--------:|:--------:|:-----:|
| Deps producao | 9 pacotes | 9 pacotes | 0 |
| Deps dev | 3 pacotes | 8 pacotes | +5 |
| Bundle size (estimativa) | ~149KB (gzipped) | ~151KB (gzipped) | +~2KB (dateUtils + filterBar) |

**Nota:** As dependencias de teste (vitest, testing-library, jsdom) sao devDependencies e nao afetam o bundle de producao.

### 11.4 Scripts Finais do package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

---

## Checklist de Conclusao do Sprint 2

Antes de considerar o Sprint 2 completo, verificar todos os itens:

### Filtros e Busca
- [ ] FilterBar renderiza no header do board com selects de tipo, prioridade, responsavel
- [ ] Campo de busca textual com debounce de 300ms
- [ ] Filtros sao aditivos (AND) e combinam entre si
- [ ] Busca textual pesquisa em titulo e descricao (case-insensitive)
- [ ] Contagem de tasks por coluna reflete filtros ativos
- [ ] Indicador visual quando filtros estao ativos
- [ ] Botao "Limpar filtros" funciona
- [ ] Filtro por responsavel inclui opcao "Sem responsavel"

### Due Date
- [ ] Campo de data funcional no TaskForm (criacao) e TaskModal (edicao)
- [ ] Badge de due date visivel no Card quando task tem due_date
- [ ] Cores corretas: vermelho (atrasado), laranja (hoje), amarelo (esta semana)
- [ ] Label em PT-BR ("Atrasado", "Vence hoje", "Vence esta semana")

### Comentarios
- [ ] Tabela task_comments criada no Supabase
- [ ] API GET/POST/DELETE de comentarios funcionando
- [ ] Comentarios carregam ao abrir TaskModal (lazy loading)
- [ ] Adicionar comentario com optimistic update
- [ ] Deletar comentario com optimistic update e confirmacao
- [ ] Selecao de autor via dropdown (TEAM_MEMBERS)
- [ ] Comentarios ordenados por data de criacao (mais antigo primeiro)

### Testes
- [ ] Vitest configurado e rodando (`npm test`)
- [ ] Testes de validators passando
- [ ] Testes de dateUtils passando
- [ ] Testes de stores (filtros) passando
- [ ] Ao menos 1 teste de componente (Card ou FilterBar) passando
- [ ] Coverage report funcional (`npm run test:coverage`)

### Regressao (Sprint 1 continua funcionando)
- [ ] CRUD de tarefas funciona normalmente
- [ ] Drag-and-drop persiste posicao
- [ ] Colapsar sidebar e colunas funciona
- [ ] Toasts de sucesso/erro aparecem
- [ ] Recarregar pagina mantem dados

### UI/UX
- [ ] Todos os textos novos em PT-BR
- [ ] Nenhum botao novo sem funcionalidade
- [ ] Transicoes suaves nos filtros
- [ ] Layout responsivo mantido

---

*Documento gerado por Aria (System Architect Agent) como blueprint de implementacao do Sprint 2 do O2 Kanban.*
*Para uso direto pelo Dex (Dev Agent) -- Fevereiro 2026.*
