# O2 Kanban -- Source Tree (Sprint 1)

> **Documento:** Lista de Arquivos a Criar e Modificar
> **Projeto:** O2 Kanban -- Sprint 1 Enhancement
> **Fase:** Phase 3 -- Validation & Sharding
> **Data:** 20 de Fevereiro de 2026
> **Autor:** Pax (Product Owner Agent)
> **Versao:** 1.0

---

## Instrucoes para o Dex

Esta lista esta **ordenada por dependencia** -- implemente de cima para baixo. Cada item depende dos anteriores estarem prontos. Os grupos (fases) podem ser executados em sequencia. Dentro de cada grupo, a ordem e sugerida mas nao estritamente obrigatoria.

---

## Fase 1: Infraestrutura (sem alterar UI existente)

```
[CREATE] .env.local                                  -- Variaveis Supabase (URL, ANON_KEY, SERVICE_KEY)
[CREATE] .env.example                                -- Template para novos devs (sem valores reais)
[MODIFY] .gitignore                                  -- Adicionar .env.local e .env*.local
[MODIFY] package.json                                -- Adicionar @supabase/supabase-js, zustand, zod
[CREATE] src/lib/supabase/client.js                  -- createBrowserClient (client-side Supabase)
[CREATE] src/lib/supabase/server.js                  -- createServerClient (server-side, API routes)
[CREATE] src/lib/constants.js                        -- Enums, tipos, prioridades, cores, DEFAULT_BOARD_ID
[CREATE] src/lib/validators.js                       -- Schemas Zod (createTask, updateTask, moveTask)
[CREATE] src/types/index.js                          -- JSDoc @typedef para Board, Column, Task
```

**Validacao da Fase 1:**
- `npm install` roda sem erros
- Supabase client conecta ao projeto
- Constantes e validators estao acessiveis

---

## Fase 2: Schema Supabase (executar no Supabase Dashboard)

```
[EXECUTE] SQL: Criar tabela boards                   -- Via Supabase Dashboard > SQL Editor
[EXECUTE] SQL: Criar tabela columns                  -- Com index UNIQUE(board_id, position)
[EXECUTE] SQL: Criar tabela tasks                    -- Com index em column_id, board_id
[EXECUTE] SQL: Criar triggers updated_at             -- Auto-update em boards e tasks
[EXECUTE] SQL: Criar policies RLS (acesso publico)   -- Temporario para Sprint 1
[EXECUTE] SQL: Seed board "Oxy" + 6 colunas + 4 tasks -- Dados iniciais do prototipo
```

**Validacao da Fase 2:**
- Tabelas visiveis no Supabase Table Editor
- Seed data inserido corretamente (1 board, 6 colunas, 4 tasks)
- Queries basicas funcionam (SELECT * FROM tasks)

---

## Fase 3: API Routes

```
[CREATE] src/app/api/boards/[boardId]/route.js       -- GET: board completo (board + columns + tasks)
[CREATE] src/app/api/tasks/route.js                  -- GET: listar tasks | POST: criar task
[CREATE] src/app/api/tasks/[taskId]/route.js         -- GET: task por ID | PATCH: atualizar | DELETE: deletar
[CREATE] src/app/api/tasks/[taskId]/move/route.js    -- PATCH: mover task (column_id + position)
```

**Validacao da Fase 3:**
- Cada endpoint testado manualmente (curl ou browser)
- POST /api/tasks cria task no Supabase
- PATCH /api/tasks/[id] atualiza campos
- DELETE /api/tasks/[id] remove do banco
- PATCH /api/tasks/[id]/move altera column_id e position

---

## Fase 4: Zustand Stores

```
[CREATE] src/stores/useBoardStore.js                 -- Store principal: board, columns, tasks, CRUD + move
[CREATE] src/stores/useUIStore.js                    -- Store UI: sidebar, colunas colapsadas, modais, toasts
```

**Validacao da Fase 4:**
- Stores podem ser importados sem erros
- Actions (addTask, moveTask, etc.) chamam API routes corretas
- Optimistic updates funcionam (state local atualiza antes da resposta)

---

## Fase 5: Hooks

```
[CREATE] src/hooks/useDragAndDrop.js                 -- Logica DnD extraida de page.js (handlers + calculo de posicao)
```

**Validacao da Fase 5:**
- Hook exporta handleDragStart, handleDragOver, handleDragEnd
- Calculo de float position funciona (media, final, inicio)

---

## Fase 6: Novos Componentes (na ordem de dependencia)

### 6a. Componentes Atomicos (ui/)

```
[CREATE] src/components/ui/Input.js                  -- Input text/textarea reutilizavel
[CREATE] src/components/ui/Input.module.css           -- Estilos do Input
[CREATE] src/components/ui/Select.js                 -- Dropdown customizado com keyboard nav
[CREATE] src/components/ui/Select.module.css          -- Estilos do Select
[CREATE] src/components/ui/IconButton.js             -- Botao de icone (ghost, subtle, danger)
[CREATE] src/components/ui/IconButton.module.css      -- Estilos do IconButton
[CREATE] src/components/ui/Badge.js                  -- Badge de prioridade (low, medium, high, urgent)
[CREATE] src/components/ui/Badge.module.css           -- Estilos do Badge
[CREATE] src/components/ui/FormField.js              -- Label + Input + Error wrapper
[CREATE] src/components/ui/FormField.module.css       -- Estilos do FormField
```

### 6b. Componentes Moleculares (ui/)

```
[CREATE] src/components/ui/TaskTypeSelector.js       -- Seletor de tipo (Task, User Story, Bug, Epic, Spike)
[CREATE] src/components/ui/TaskTypeSelector.module.css -- Estilos do TaskTypeSelector
[CREATE] src/components/ui/PrioritySelector.js       -- Seletor de prioridade (Baixa, Media, Alta, Urgente)
[CREATE] src/components/ui/PrioritySelector.module.css -- Estilos do PrioritySelector
```

### 6c. Componentes de Feedback (ui/)

```
[CREATE] src/components/ui/Toast.js                  -- Notificacoes toast (success, error, info)
[CREATE] src/components/ui/Toast.module.css           -- Estilos do Toast
[CREATE] src/components/ui/ConfirmDialog.js          -- Dialog de confirmacao (delete, descartar)
[CREATE] src/components/ui/ConfirmDialog.module.css   -- Estilos do ConfirmDialog
```

### 6d. Componentes Kanban (kanban/)

```
[CREATE] src/components/Kanban/DndProvider.js        -- Wrapper DndContext + sensores + handlers
[CREATE] src/components/Kanban/CreateTaskButton.js   -- Botao "+ Adicionar tarefa" no rodape da coluna
[CREATE] src/components/Kanban/CreateTaskButton.module.css -- Estilos
[CREATE] src/components/Kanban/TaskForm.js           -- Formulario de criacao/edicao de tarefa
[CREATE] src/components/Kanban/TaskForm.module.css    -- Estilos do TaskForm
[CREATE] src/components/Kanban/TaskModal.js          -- Modal de detalhes/edicao/criacao
[CREATE] src/components/Kanban/TaskModal.module.css   -- Estilos do TaskModal
```

**Validacao da Fase 6:**
- Cada componente renderiza isoladamente sem erros
- CSS Modules aplicam estilos corretamente
- Componentes usam tokens do globals.css

---

## Fase 7: Modificar Componentes Existentes

```
[MODIFY] src/app/globals.css                         -- Adicionar ~40 novos design tokens (inputs, toasts, prioridades, layout, transitions)
[MODIFY] src/app/kanban.css                          -- Adicionar estilos para sidebar collapsed, column collapsed
[MODIFY] src/app/page.js                             -- Refatorar: remover mock data, remover polling, integrar stores, fetch Supabase, renderizar novos componentes
[MODIFY] src/components/Kanban/Sidebar.js            -- Adicionar collapse funcional via useUIStore
[MODIFY] src/components/Kanban/Column.js             -- Adicionar collapse + CreateTaskButton no footer
[MODIFY] src/components/Kanban/Card.js               -- Adicionar onClick (abre modal) + Badge de prioridade
[MODIFY] src/components/Kanban/Board.js              -- Remover botoes mortos (Bell, Filter, LayoutGrid, ArrowLeft), titulo dinamico do store
```

**Validacao da Fase 7:**
- page.js carrega dados do Supabase (nao mais hardcoded)
- Sidebar colapsa e expande com animacao
- Colunas colapsam com titulo vertical
- Clicar em card abre TaskModal
- Board header nao tem botoes sem funcionalidade

---

## Fase 8: Testes Manuais e Polish

```
[VERIFY] CRUD completo: criar, editar, deletar tarefa
[VERIFY] DnD entre colunas persiste no Supabase
[VERIFY] DnD dentro da mesma coluna (reordenar) persiste
[VERIFY] Recarregar pagina mantem todos os dados
[VERIFY] Sidebar collapse funciona em desktop e tablet
[VERIFY] Column collapse funciona (titulo vertical, drop em coluna colapsada)
[VERIFY] Nenhum botao visivel esta "morto"
[VERIFY] Todos os textos em PT-BR
[VERIFY] Toast aparece em sucesso e erro
[VERIFY] ConfirmDialog aparece antes de delete
[VERIFY] Modal fecha com X, Escape, e click fora
```

---

## Resumo Quantitativo

| Operacao | Quantidade |
|----------|:---------:|
| Arquivos a CRIAR | 35 |
| Arquivos a MODIFICAR | 8 |
| SQL a EXECUTAR | 6 scripts |
| Verificacoes manuais | 11 |
| **TOTAL de arquivos** | **43** |

### Distribuicao por Pasta

| Pasta | Criar | Modificar |
|-------|:-----:|:---------:|
| `src/lib/` | 4 | 0 |
| `src/types/` | 1 | 0 |
| `src/stores/` | 2 | 0 |
| `src/hooks/` | 1 | 0 |
| `src/app/api/` | 4 | 0 |
| `src/components/ui/` | 16 | 0 |
| `src/components/Kanban/` | 7 | 4 |
| `src/app/` | 0 | 3 |
| Raiz (`.env`, `.gitignore`, `package.json`) | 2 | 2 |

---

> **Documento preparado por Pax (Product Owner Agent)**
> **Para uso do Dex (Dev Agent) -- Fevereiro 2026**
