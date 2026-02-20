# O2 Kanban -- User Stories do Sprint 1

> **Documento:** Stories Sprint 1 -- Detalhamento para Implementacao
> **Projeto:** O2 Kanban -- Sprint 1 Enhancement
> **Fase:** Phase 3b -- Story Creation
> **Data:** 20 de Fevereiro de 2026
> **Autor:** River (Scrum Master Agent)
> **Versao:** 1.0
> **Baseado em:** PRD (Morgan, v1.0) + Architecture Sprint 1 (Aria, v1.0) + Frontend Spec (Uma, v1.0) + Source Tree (Pax, v1.0) + Validation Report (Pax, v1.0)

---

## Decisoes Incorporadas (Pax -- Validation Report)

Antes de iniciar as stories, estas decisoes do PO foram incorporadas:

1. **2 Zustand stores** (nao 3): `useBoardStore` (board + columns + tasks) + `useUIStore` (sidebar, modals, toasts). Referencias a `useTaskStore` no PRD foram unificadas em `useBoardStore`.
2. **Dropdown de responsavel com lista hardcoded** em `lib/constants.js` (membros: Andrey, Felipe, Caio, Matheus, etc.) -- sem tabela `users` no Sprint 1.
3. **Tipo `spike` incluido** no TaskTypeSelector (5 tipos: task, user_story, bug, epic, spike).
4. **Duracao de toasts**: 4s sucesso, 6s erro (conforme Frontend Spec).
5. **Sem Realtime no Sprint 1**: dois usuarios nao verao alteracoes em tempo real sem recarregar a pagina. Limitacao documentada.
6. **ConfirmDialog em `components/ui/`** (generico, nao Kanban-especifico).
7. **Valores de tipo em lowercase** no pipeline (`task`, `user_story`, `bug`, `epic`, `spike`). Labels PT-BR apenas no display via `lib/constants.js`.

---

## Indice de Stories

| Epico | Story | Titulo | Estimativa |
|-------|-------|--------|:----------:|
| 0 | 0.1 | Setup Supabase (client, env vars, schema SQL, seed data) | G |
| 0 | 0.2 | Instalar dependencias e criar constantes/validators | P |
| 0 | 0.3 | Criar Zustand stores (useBoardStore + useUIStore) | M |
| 0 | 0.4 | Criar API routes (boards, tasks CRUD, move) | M |
| 1 | 1.1 | Criar tarefa (CreateTaskButton + TaskForm + API POST) | G |
| 1 | 1.2 | Visualizar tarefa (TaskModal com detalhes ao clicar no card) | G |
| 1 | 1.3 | Editar tarefa (edicao inline no TaskModal) | M |
| 1 | 1.4 | Deletar tarefa (ConfirmDialog + API DELETE) | P |
| 2 | 2.1 | Migrar page.js de mock data para Supabase (hydrate do store) | G |
| 2 | 2.2 | Persistir drag-and-drop (salvar posicao no banco via API move) | M |
| 3 | 3.1 | Sidebar colapsavel (toggle 240px -> 60px) | P |
| 3 | 3.2 | Colunas colapsaveis (toggle 320px -> 48px com titulo vertical) | M |
| 3 | 3.3 | Toast notifications (feedback de CRUD) | P |

**Total: 13 stories | Estimativa: 4P + 5M + 4G**

---

## Epico 0: Setup de Infraestrutura

---

# Story 0.1: Setup Supabase (client, env vars, schema SQL, seed data)

## Status: Draft

## Descricao
Como **desenvolvedor**, eu quero ter o Supabase configurado com schema de banco de dados, seed data e clients (browser + server) para que todas as demais stories tenham infraestrutura de persistencia disponivel.

## Contexto Tecnico
- Arquivos a criar:
  - `.env.local` -- variaveis Supabase (URL, ANON_KEY, SERVICE_ROLE_KEY)
  - `.env.example` -- template para novos devs (sem valores reais)
  - `src/lib/supabase/client.js` -- createBrowserClient usando `@supabase/supabase-js`
  - `src/lib/supabase/server.js` -- createServerClient para API routes (usa SERVICE_ROLE_KEY)
- Arquivos a modificar:
  - `.gitignore` -- adicionar `.env.local` e `.env*.local`
- SQL a executar no Supabase Dashboard:
  - Criar tabelas `boards`, `columns`, `tasks` (conforme architecture-sprint1.md, secao 3.1)
  - Criar triggers `updated_at` automaticos
  - Criar policies RLS de acesso publico (temporario Sprint 1)
  - Executar seed data: board "Oxy" + 6 colunas + 4 tasks iniciais (secao 3.2)
- Dependencias: nenhuma (primeira story do sprint)
- Stack: Supabase (PostgreSQL), @supabase/supabase-js

## Criterios de Aceite
- [ ] Given que o projeto Supabase foi criado, when eu acesso o Dashboard > Table Editor, then as tabelas `boards`, `columns` e `tasks` existem com os campos definidos no architecture-sprint1.md (secao 3.1)
- [ ] Given que o seed foi executado, when eu faco `SELECT * FROM boards`, then retorna 1 registro com title "Oxy"
- [ ] Given que o seed foi executado, when eu faco `SELECT * FROM columns WHERE board_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' ORDER BY position`, then retorna 6 colunas na ordem: A Fazer, Priorizado, Em Progresso, Revisao, Concluido, Backlog
- [ ] Given que o seed foi executado, when eu faco `SELECT * FROM tasks`, then retorna 4 tasks distribuidas nas colunas corretas (2 em A Fazer, 1 em Priorizado, 1 em Em Progresso)
- [ ] Given que `.env.local` esta configurado com as keys do Supabase, when eu importo `src/lib/supabase/client.js` no browser, then o client conecta ao Supabase sem erros
- [ ] Given que `.env.local` esta configurado, when eu importo `src/lib/supabase/server.js` numa API route, then o server client conecta ao Supabase usando a SERVICE_ROLE_KEY
- [ ] Given que `.gitignore` foi atualizado, when eu rodo `git status`, then `.env.local` nao aparece como untracked
- [ ] Given que `.env.example` existe, when um novo dev clona o repo, then ele ve o template com os nomes das variaveis necessarias (sem valores reais)
- [ ] Given que o schema tem RLS habilitado, when eu faco uma query via anon key, then a policy publica permite acesso total (temporario Sprint 1)

## Notas Tecnicas
- **Schema SQL completo**: ver architecture-sprint1.md, secao 3.1. Tabela `tasks` usa `DOUBLE PRECISION` para position (float positioning, ADR-004). Campo `assignee` e `VARCHAR(100)` (texto livre, sem FK para users no Sprint 1).
- **Supabase client.js**: usa `process.env.NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (expostos ao browser, protegidos por RLS).
- **Supabase server.js**: usa `SUPABASE_SERVICE_ROLE_KEY` com `{ auth: { persistSession: false } }`. NUNCA expor a service key ao client.
- **UUID padrao do board**: `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11` (definido em constants.js como `DEFAULT_BOARD_ID`).
- **Index critico**: `idx_tasks_column_position ON tasks(column_id, position)` para queries de tasks por coluna ordenadas por posicao.
- **Trigger updated_at**: automatiza atualizacao do campo `updated_at` em `boards` e `tasks` em qualquer UPDATE.

## Estimativa
G -- Envolve criacao de projeto Supabase, execucao de schema SQL, seed data, configuracao de environment variables, e criacao de 2 clients (browser + server). Risco de problemas com credenciais/conexao.

## Definition of Done
- [ ] Codigo implementado (clients Supabase + env vars + .gitignore)
- [ ] Sem erros de lint
- [ ] Build passando (`npm run build` sem erros)
- [ ] Criterios de aceite verificados manualmente
- [ ] Tabelas e seed data confirmados no Supabase Dashboard

---

# Story 0.2: Instalar dependencias e criar constantes/validators

## Status: Draft

## Descricao
Como **desenvolvedor**, eu quero ter as dependencias do Sprint 1 instaladas e os arquivos de constantes, validators e tipos criados para que todos os componentes e API routes tenham uma base compartilhada de configuracoes e validacoes.

## Contexto Tecnico
- Arquivos a criar:
  - `src/lib/constants.js` -- COLUMN_COLOR_MAP, TASK_TYPES, TASK_PRIORITIES, PRIORITY_TAG_CLASS, DEFAULT_BOARD_ID, POSITION_GAP, TEAM_MEMBERS (lista hardcoded)
  - `src/lib/validators.js` -- Schemas Zod: createTaskSchema, updateTaskSchema, moveTaskSchema
  - `src/types/index.js` -- JSDoc @typedef para Board, Column, Task
- Arquivos a modificar:
  - `package.json` -- adicionar @supabase/supabase-js, zustand, zod
- Dependencias: Story 0.1 (Supabase configurado)
- Stack: zustand, zod, @supabase/supabase-js

## Criterios de Aceite
- [ ] Given que as dependencias foram instaladas, when eu rodo `npm install`, then @supabase/supabase-js, zustand e zod estao no node_modules sem erros
- [ ] Given que `lib/constants.js` existe, when eu importo `TASK_TYPES`, then recebo o mapa completo com 5 tipos: `{ task: 'Tarefa', user_story: 'User Story', bug: 'Bug', epic: 'Epico', spike: 'Spike' }`
- [ ] Given que `lib/constants.js` existe, when eu importo `TASK_PRIORITIES`, then recebo `{ low: 'Baixa', medium: 'Media', high: 'Alta', urgent: 'Urgente' }`
- [ ] Given que `lib/constants.js` existe, when eu importo `TEAM_MEMBERS`, then recebo a lista hardcoded de membros do time (nome e avatar/iniciais) para popular o dropdown de responsavel
- [ ] Given que `lib/constants.js` existe, when eu importo `DEFAULT_BOARD_ID`, then recebo `'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'`
- [ ] Given que `lib/validators.js` existe, when eu valido `{ title: '', column_id: 'abc' }` com `createTaskSchema`, then recebo erro de validacao ("Titulo e obrigatorio" e "column_id deve ser UUID valido")
- [ ] Given que `lib/validators.js` existe, when eu valido `{ title: 'Tarefa valida', column_id: 'c0000001-0000-0000-0000-000000000001' }` com `createTaskSchema`, then a validacao passa e aplica defaults (type='task', priority='medium')
- [ ] Given que `types/index.js` existe, when eu inspeciono o arquivo, then os JSDoc @typedef para Board, Column e Task estao definidos com todos os campos do schema SQL

## Notas Tecnicas
- **TEAM_MEMBERS**: lista hardcoded conforme decisao do PO (Pax). Formato sugerido: `[{ id: 'andrey', name: 'Andrey', avatar: null }, { id: 'felipe', name: 'Felipe', avatar: null }, ...]`. Nomes retirados dos mock data existentes (Andrey, Felipe, Caio, Matheus). Esse array sera usado no Select dropdown de responsavel nas stories 1.1 e 1.3.
- **Validators Zod**: createTaskSchema valida `column_id` (UUID), `title` (min 1, max 500), `type` (enum 5 valores, default 'task'), `priority` (enum 4 valores, default 'medium'), `description` (max 5000, nullable), `assignee` (max 100, nullable), `due_date` (nullable). Ver architecture-sprint1.md, secao 5.4.
- **COLUMN_COLOR_MAP**: mapeia valor do DB (`info`, `danger`, etc.) para classe CSS (`status-todo`, `status-urgent`, etc.). Ver architecture-sprint1.md, secao 3.3.
- **POSITION_GAP**: `1000.0` -- gap entre posicoes para float positioning (ADR-004).

## Estimativa
P -- Instalacao de pacotes npm e criacao de 3 arquivos com conteudo bem definido no architecture-sprint1.md.

## Definition of Done
- [ ] Codigo implementado
- [ ] Sem erros de lint
- [ ] Build passando
- [ ] Criterios de aceite verificados manualmente

---

# Story 0.3: Criar Zustand stores (useBoardStore + useUIStore)

## Status: Draft

## Descricao
Como **desenvolvedor**, eu quero ter os Zustand stores criados para que o estado da aplicacao esteja centralizado fora do `page.js`, permitindo que qualquer componente acesse e modifique dados do board e da interface de forma organizada.

## Contexto Tecnico
- Arquivos a criar:
  - `src/stores/useBoardStore.js` -- board, columns, tasks, isLoading, error + actions: hydrate, addTask, updateTask, deleteTask, moveTask, reorderTask + getters: getTasksByColumn, getTaskById, getNextPosition
  - `src/stores/useUIStore.js` -- sidebarCollapsed, collapsedColumns, activeTaskId, isCreateModalOpen, createModalColumnId, confirmDialog, toasts + actions correspondentes
- Dependencias: Story 0.2 (zustand instalado, constants.js e validators.js criados)
- Stack: zustand ^5.x, Next.js 16 (App Router)

## Criterios de Aceite
- [ ] Given que `useBoardStore` existe, when eu chamo `hydrate(board, columns, tasks)`, then o state e atualizado com os dados recebidos e `isLoading` muda para `false`
- [ ] Given que `useBoardStore` esta hidratado com tasks, when eu chamo `getTasksByColumn(columnId)`, then recebo apenas as tasks dessa coluna ordenadas por position (ascendente)
- [ ] Given que `useBoardStore` esta hidratado, when eu chamo `addTask({ column_id, title })`, then uma task temporaria aparece no state imediatamente (optimistic update) e um POST e feito para `/api/tasks`
- [ ] Given que `addTask` fez POST e recebeu resposta com sucesso, when a resposta chega, then o ID temporario da task e substituido pelo ID real do Supabase
- [ ] Given que `addTask` fez POST e a requisicao falhou, when o erro e capturado, then a task temporaria e removida do state (rollback) e `error` e atualizado com a mensagem
- [ ] Given que `useBoardStore` tem uma task, when eu chamo `updateTask(taskId, { title: 'Novo titulo' })`, then o state atualiza imediatamente (optimistic) e um PATCH e feito para `/api/tasks/[taskId]`
- [ ] Given que `useBoardStore` tem uma task, when eu chamo `deleteTask(taskId)`, then a task e removida do state imediatamente (optimistic) e um DELETE e feito para `/api/tasks/[taskId]`
- [ ] Given que `deleteTask` falhou, when o erro e capturado, then a task retorna ao state (rollback)
- [ ] Given que `useBoardStore` tem uma task na coluna A, when eu chamo `moveTask(taskId, columnBId, newPosition)`, then a task muda de coluna e posicao no state imediatamente e um PATCH e feito para `/api/tasks/[taskId]/move`
- [ ] Given que `useUIStore` existe, when eu chamo `toggleSidebar()`, then `sidebarCollapsed` alterna entre `true` e `false`
- [ ] Given que `useUIStore` existe, when eu chamo `toggleColumn(columnId)`, then `collapsedColumns[columnId]` alterna entre `true` e `undefined/false`
- [ ] Given que `useUIStore` existe, when eu chamo `openTaskModal(taskId)`, then `activeTaskId` recebe o ID e `isCreateModalOpen` e `false`
- [ ] Given que `useUIStore` existe, when eu chamo `openCreateModal(columnId)`, then `isCreateModalOpen` e `true`, `createModalColumnId` recebe o ID e `activeTaskId` e `null`
- [ ] Given que `useUIStore` existe, when eu chamo `addToast('Mensagem', 'success')`, then um toast e adicionado ao array `toasts` e removido automaticamente apos 4 segundos
- [ ] Given que `useUIStore` existe, when eu chamo `addToast('Erro', 'error')`, then o toast e adicionado e removido automaticamente apos 6 segundos

## Notas Tecnicas
- **Estrutura do useBoardStore**: ver architecture-sprint1.md, secao 4.1 para implementacao completa. O store usa `create((set, get) => ({...}))` do zustand.
- **Optimistic updates**: toda action de escrita (add, update, delete, move) deve atualizar o state local ANTES da requisicao HTTP. Em caso de erro, fazer rollback restaurando o estado anterior.
- **Duracao de toasts**: 4000ms para success/info, 6000ms para error (decisao do PO alinhada com Frontend Spec).
- **2 stores, nao 3**: decisao do Arq Sprint 1 validada pelo PO. `useBoardStore` unifica board + tasks. Nao criar `useTaskStore` separado.
- **Float positioning**: `getNextPosition(columnId)` calcula `maxPosition + POSITION_GAP` (1000.0). Se a coluna estiver vazia, retorna `POSITION_GAP`.

## Estimativa
M -- Logica de state management com optimistic updates, rollback e integracao com API routes. Requer cuidado com edge cases (rollback, IDs temporarios).

## Definition of Done
- [ ] Codigo implementado
- [ ] Sem erros de lint
- [ ] Build passando
- [ ] Criterios de aceite verificados manualmente

---

# Story 0.4: Criar API routes (boards, tasks CRUD, move)

## Status: Draft

## Descricao
Como **desenvolvedor**, eu quero ter as API routes do Next.js criadas e funcionando para que o frontend possa realizar operacoes CRUD de tarefas e carregar dados do board via endpoints REST.

## Contexto Tecnico
- Arquivos a criar:
  - `src/app/api/boards/[boardId]/route.js` -- GET: board completo (board + columns + tasks)
  - `src/app/api/tasks/route.js` -- GET: listar tasks | POST: criar task
  - `src/app/api/tasks/[taskId]/route.js` -- GET: task por ID | PATCH: atualizar | DELETE: deletar
  - `src/app/api/tasks/[taskId]/move/route.js` -- PATCH: mover task (column_id + position)
- Dependencias: Story 0.1 (Supabase), Story 0.2 (validators.js, constants.js)
- Stack: Next.js 16 App Router (Route Handlers), Supabase server client, Zod

## Criterios de Aceite
- [ ] Given que o board "Oxy" existe no Supabase, when eu faco `GET /api/boards/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`, then recebo `{ board, columns, tasks }` com status 200, onde columns estao ordenadas por position e tasks ordenadas por position
- [ ] Given que o boardId nao existe, when eu faco `GET /api/boards/uuid-inexistente`, then recebo `{ error: 'Board nao encontrado' }` com status 404
- [ ] Given que existem tasks no board, when eu faco `GET /api/tasks?board_id=a0eebc99-...`, then recebo `{ tasks: [...] }` com status 200, tasks ordenadas por position
- [ ] Given que envio dados validos, when eu faco `POST /api/tasks` com `{ column_id, title: 'Nova tarefa', type: 'task', priority: 'medium' }`, then recebo `{ task: {...} }` com status 201, a task tem um UUID real, board_id preenchido e position calculada automaticamente
- [ ] Given que envio titulo vazio, when eu faco `POST /api/tasks` com `{ column_id, title: '' }`, then recebo `{ error: 'Titulo e obrigatorio' }` com status 400 (validacao Zod)
- [ ] Given que envio column_id invalido, when eu faco `POST /api/tasks` com `{ column_id: 'nao-uuid', title: 'Test' }`, then recebo erro 400 com mensagem do Zod
- [ ] Given que a task existe, when eu faco `GET /api/tasks/[taskId]`, then recebo `{ task: {...} }` com status 200
- [ ] Given que a task nao existe, when eu faco `GET /api/tasks/uuid-inexistente`, then recebo `{ error: 'Tarefa nao encontrada' }` com status 404
- [ ] Given que a task existe, when eu faco `PATCH /api/tasks/[taskId]` com `{ title: 'Titulo atualizado', priority: 'high' }`, then recebo `{ task: {...} }` com os campos atualizados e status 200
- [ ] Given que a task existe, when eu faco `DELETE /api/tasks/[taskId]`, then recebo `{ success: true }` com status 200 e a task nao existe mais no banco
- [ ] Given que a task existe, when eu faco `PATCH /api/tasks/[taskId]/move` com `{ column_id: 'outro-uuid', position: 1500.0 }`, then recebo `{ task: {...} }` com column_id e position atualizados, status 200
- [ ] Given que envio position negativa no move, when eu faco `PATCH /api/tasks/[taskId]/move` com `{ column_id: 'uuid', position: -10 }`, then recebo erro 400 (Zod valida position > 0)

## Notas Tecnicas
- **Implementacao completa**: ver architecture-sprint1.md, secoes 5.2 a 5.7 para codigo de cada route.
- **Calculo de position no POST**: buscar a ultima task da coluna (`ORDER BY position DESC LIMIT 1`) e somar `POSITION_GAP` (1000.0). Se a coluna estiver vazia, position = `POSITION_GAP`.
- **board_id denormalizado**: ao criar task, sempre inserir `board_id: DEFAULT_BOARD_ID` (ADR-008). O frontend nao envia board_id -- o server injeta.
- **Formato de resposta padrao**: sucesso = `{ [resource]: data }`, erro = `{ error: string }`.
- **Sem autenticacao**: todas as routes sao publicas no Sprint 1. Auth vem no Sprint 3.
- **Supabase server client**: usar `createServerClient()` de `lib/supabase/server.js` em todas as routes. Nunca usar o browser client nas API routes.
- **Params assincronos**: no Next.js 16 com App Router, `params` e uma Promise. Usar `const { boardId } = await params;`.

## Estimativa
M -- 4 arquivos de API route com logica CRUD padrao. Zod simplifica validacao. Risco baixo se o Supabase estiver configurado corretamente (Story 0.1).

## Definition of Done
- [ ] Codigo implementado
- [ ] Sem erros de lint
- [ ] Build passando
- [ ] Criterios de aceite verificados manualmente (via curl ou browser)
- [ ] Cada endpoint testado com dados validos e invalidos

---

## Epico 1: CRUD de Tarefas

---

# Story 1.1: Criar tarefa (CreateTaskButton + TaskForm + API POST)

## Status: Draft

## Descricao
Como **Estagiario Lucas**, eu quero clicar em um botao "+" em qualquer coluna para criar minhas proprias tarefas sem depender de outra pessoa, preenchendo titulo, tipo, prioridade e opcionalmente descricao e responsavel.

## Contexto Tecnico
- Arquivos a criar:
  - `src/components/Kanban/CreateTaskButton.js` + `CreateTaskButton.module.css`
  - `src/components/Kanban/TaskForm.js` + `TaskForm.module.css`
  - `src/components/ui/Input.js` + `Input.module.css`
  - `src/components/ui/Select.js` + `Select.module.css`
  - `src/components/ui/FormField.js` + `FormField.module.css`
  - `src/components/ui/TaskTypeSelector.js` + `TaskTypeSelector.module.css`
  - `src/components/ui/PrioritySelector.js` + `PrioritySelector.module.css`
- Arquivos a modificar:
  - `src/components/Kanban/Column.js` -- adicionar CreateTaskButton no rodape
  - `src/app/globals.css` -- adicionar design tokens de form inputs (secao 1.1 da frontend-spec.md)
- Dependencias: Story 0.3 (stores), Story 0.4 (API POST /api/tasks)
- Stack: React 19, zustand, zod (client-side validation), CSS Modules, lucide-react

## Criterios de Aceite
- [ ] Given que o usuario visualiza o board, when ele olha para qualquer coluna, then ve um botao "+ Adicionar tarefa" no rodape da coluna com borda tracejada (dashed)
- [ ] Given que o usuario passa o mouse sobre o botao "+", when ele faz hover, then a borda e o texto mudam para a cor accent (verde)
- [ ] Given que o usuario clica no botao "+" de uma coluna, when o click e processado, then um modal de criacao de tarefa abre com o TaskForm vazio e focus automatico no campo titulo
- [ ] Given que o modal de criacao esta aberto, when o usuario ve o formulario, then os campos disponiveis sao: Titulo (obrigatorio), Tipo (5 opcoes: Tarefa, User Story, Bug, Epico, Spike -- default Tarefa), Prioridade (4 opcoes: Baixa, Media, Alta, Urgente -- default Media), Descricao (textarea opcional), Responsavel (dropdown com membros hardcoded, opcional)
- [ ] Given que o usuario preencheu apenas o titulo, when ele clica "Criar tarefa", then a tarefa e criada na coluna onde o botao foi clicado, na ultima posicao
- [ ] Given que o usuario nao preencheu o titulo, when ele clica "Criar tarefa", then uma mensagem de erro "Titulo e obrigatorio" aparece abaixo do campo titulo e a tarefa NAO e criada
- [ ] Given que o usuario preencheu dados validos, when ele clica "Criar tarefa", then o card aparece instantaneamente na coluna (optimistic update) e o modal fecha
- [ ] Given que o POST para a API falhou, when o erro e capturado, then o card e removido da coluna (rollback), um toast de erro aparece ("Erro ao salvar. Tente novamente.") e o modal permanece aberto com os dados preenchidos
- [ ] Given que a tarefa foi criada com sucesso, when o modal fecha, then um toast de sucesso aparece ("Tarefa criada com sucesso")
- [ ] Given que o modal de criacao esta aberto, when o usuario clica fora do modal OU pressiona Escape OU clica no botao X, then o modal fecha sem criar tarefa
- [ ] Given que o TaskTypeSelector e renderizado, when o usuario ve as opcoes, then todas as 5 opcoes tem icone + label em PT-BR (Tarefa, User Story, Bug, Epico, Spike)
- [ ] Given que o dropdown de responsavel e renderizado, when o usuario abre o dropdown, then ve a lista de membros do time (da constante TEAM_MEMBERS) + opcao "Sem responsavel"

## Notas Tecnicas
- **CreateTaskButton**: componente simples com `onClick` que chama `useUIStore.openCreateModal(columnId)`. Icone `Plus` do lucide-react + texto "+ Adicionar tarefa". Estilos: borda dashed, hover verde accent. Ver frontend-spec.md, secao 2.3.3.
- **TaskForm**: renderizado dentro de um modal (reutilizando pattern de overlay). Props: `{ columnId, onSubmit, onCancel, members }`. Validacao client-side com Zod antes de chamar `useBoardStore.addTask()`. Ver frontend-spec.md, secao 2.3.2.
- **Componentes atomicos (Input, Select, FormField, TaskTypeSelector, PrioritySelector)**: criar conforme frontend-spec.md, secoes 2.1.1, 2.1.2, 2.2.1, 2.2.2, 2.2.3. Todos usam CSS Modules com os design tokens de globals.css.
- **TEAM_MEMBERS**: importar de `lib/constants.js`. Formato: `[{ id: 'andrey', name: 'Andrey' }, ...]`.
- **Tipos de tarefa**: valores internos em lowercase (`task`, `user_story`, etc.), labels de display via `TASK_TYPES` de constants.js.
- **Acessibilidade**: modal com `role="dialog"`, `aria-modal="true"`. Campos com `aria-label`. TaskTypeSelector com `role="radiogroup"`.

## Estimativa
G -- Envolve criacao de 7 componentes novos (5 atomicos + CreateTaskButton + TaskForm), integracao com store e API, e modificacao do Column.js existente. Maior story do sprint em volume de componentes.

## Definition of Done
- [ ] Codigo implementado
- [ ] Sem erros de lint
- [ ] Build passando
- [ ] Criterios de aceite verificados manualmente
- [ ] Todos os textos visiveis em PT-BR

---

# Story 1.2: Visualizar tarefa (TaskModal com detalhes ao clicar no card)

## Status: Draft

## Descricao
Como **PM Camila**, eu quero clicar em um card para ver todos os detalhes da tarefa (titulo, descricao, tipo, prioridade, responsavel, coluna, data de criacao) para que eu possa entender o contexto completo antes de priorizar.

## Contexto Tecnico
- Arquivos a criar:
  - `src/components/Kanban/TaskModal.js` + `TaskModal.module.css`
  - `src/components/ui/Badge.js` + `Badge.module.css`
  - `src/components/ui/IconButton.js` + `IconButton.module.css`
- Arquivos a modificar:
  - `src/components/Kanban/Card.js` -- adicionar onClick que abre modal + Badge de prioridade
  - `src/app/globals.css` -- adicionar design tokens de modal, priority badges e transitions (frontend-spec.md, secoes 1.2, 1.3, 1.4, 1.5)
- Dependencias: Story 0.3 (stores -- useUIStore.activeTaskId, useBoardStore.getTaskById)
- Stack: React 19, zustand, CSS Modules, lucide-react

## Criterios de Aceite
- [ ] Given que o usuario visualiza o board, when ele clica em um card, then um modal abre com todos os detalhes da tarefa (titulo, tipo, prioridade, descricao, responsavel, coluna atual, data de criacao formatada em dd/mm/aaaa HH:mm)
- [ ] Given que o usuario clica em um card, when o ponteiro se moveu menos de 5px antes de soltar, then e considerado um click e o modal abre (nao confundir com drag)
- [ ] Given que o usuario comeca a arrastar um card, when o ponteiro se moveu 5px ou mais, then e um drag normal e o modal NAO abre
- [ ] Given que o modal esta aberto, when o usuario clica no botao X, then o modal fecha
- [ ] Given que o modal esta aberto, when o usuario pressiona Escape, then o modal fecha
- [ ] Given que o modal esta aberto, when o usuario clica no overlay/backdrop escurecido fora do modal, then o modal fecha
- [ ] Given que o modal esta aberto, when o usuario pressiona Tab, then o foco navega apenas entre elementos dentro do modal (focus trap)
- [ ] Given que o modal abre, when a animacao e executada, then o backdrop faz fade-in e o modal faz scale-in (0.95 -> 1.0) com duracao ~300ms
- [ ] Given que um card e renderizado no board, when o usuario olha para o card, then ve o Badge de prioridade com a cor e label corretos (Baixa/cinza, Media/amarelo, Alta/laranja, Urgente/vermelho)
- [ ] Given que o modal esta aberto com dados da tarefa, when o modal e o unico componente acessivel, then a acessibilidade e correta: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` apontando para o titulo

## Notas Tecnicas
- **TaskModal**: le `useUIStore.activeTaskId` para decidir se renderiza. Busca task via `useBoardStore.getTaskById(activeTaskId)`. Renderiza dados em modo somente leitura inicialmente (edicao vem na Story 1.3). Ver frontend-spec.md, secao 2.3.1 e wireframes 6.1/6.2.
- **Click vs Drag**: o `@dnd-kit` com `PointerSensor({ activationConstraint: { distance: 5 } })` ja diferencia. O Card deve usar `onClick` no wrapper div que verifica se `isDragging` e false. Ver frontend-spec.md, secao 2.3.8.
- **Badge**: componente atomico que exibe prioridade com cor. Props: `{ priority, size }`. Ver frontend-spec.md, secao 2.1.4. Usar design tokens `--priority-*-bg`, `--priority-*-text`, `--priority-*-border`.
- **IconButton**: componente atomico para botoes de icone (X de fechar, Trash de deletar, etc.). Variantes: ghost, subtle, danger. Ver frontend-spec.md, secao 2.1.3.
- **Responsividade**: em mobile (<768px), o modal ocupa fullscreen com animacao slide-up. Ver frontend-spec.md, secao 5.2.
- **Data de criacao**: formatar `created_at` (ISO string) para formato brasileiro: `dd/mm/aaaa HH:mm`.

## Estimativa
G -- Envolve criacao do TaskModal (componente complexo com overlay, focus trap, animacoes), Badge, IconButton, e modificacao do Card.js com logica de click vs drag. Requer atencao a acessibilidade.

## Definition of Done
- [ ] Codigo implementado
- [ ] Sem erros de lint
- [ ] Build passando
- [ ] Criterios de aceite verificados manualmente
- [ ] Modal acessivel (role, aria-modal, focus trap, Escape fecha)
- [ ] Todos os textos visiveis em PT-BR

---

# Story 1.3: Editar tarefa (edicao inline no TaskModal)

## Status: Draft

## Descricao
Como **Dev Andrey**, eu quero editar o titulo, descricao, tipo, prioridade e responsavel de uma tarefa diretamente no modal de detalhes para que eu possa corrigir informacoes rapidamente sem precisar recriar a tarefa.

## Contexto Tecnico
- Arquivos a modificar:
  - `src/components/Kanban/TaskModal.js` -- transformar campos de read-only para editaveis, adicionar dirty state tracking, botoes Salvar/Cancelar
- Dependencias: Story 1.2 (TaskModal em modo leitura), Story 1.1 (componentes de form -- Input, Select, TaskTypeSelector, PrioritySelector ja criados)
- Stack: React 19, zustand, zod, CSS Modules

## Criterios de Aceite
- [ ] Given que o TaskModal esta aberto, when o usuario ve os campos, then todos os campos sao editaveis inline: titulo (input text), tipo (TaskTypeSelector), prioridade (PrioritySelector), descricao (textarea), responsavel (Select dropdown)
- [ ] Given que o usuario nao alterou nenhum campo, when ele ve o botao "Salvar alteracoes", then o botao esta desabilitado (opacity 0.5, nao clicavel)
- [ ] Given que o usuario alterou pelo menos um campo, when ele ve o botao "Salvar alteracoes", then o botao esta habilitado (cor accent verde)
- [ ] Given que o usuario alterou campos e clica "Salvar alteracoes", when a validacao Zod passa, then o card atualiza na UI imediatamente (optimistic update), o modal fecha e um toast de sucesso aparece ("Alteracoes salvas")
- [ ] Given que o usuario clicou "Salvar alteracoes" e a API retornou erro, when o erro e capturado, then as alteracoes sao revertidas no card (rollback), um toast de erro aparece ("Erro ao salvar. Tente novamente.") e o modal permanece aberto
- [ ] Given que o usuario alterou campos e clica "Cancelar", when o click e processado, then as alteracoes sao descartadas e o modal fecha mostrando os dados originais
- [ ] Given que o usuario alterou campos e tenta fechar (X, Escape, click fora), when ha alteracoes nao salvas (dirty state), then um ConfirmDialog aparece: "Descartar alteracoes?" com opcoes "Descartar" e "Continuar editando"
- [ ] Given que o usuario esta editando e clica "Salvar alteracoes", when a requisicao esta em andamento, then o botao mostra estado de loading (spinner + "Salvando...") e nao permite duplo clique
- [ ] Given que o usuario editou o titulo para vazio, when ele clica "Salvar alteracoes", then uma mensagem de erro "Titulo e obrigatorio" aparece no campo e a tarefa NAO e salva

## Notas Tecnicas
- **Dirty state**: comparar estado atual dos campos com os valores originais da task. Usar `useState` local no modal para rastrear alteracoes. O botao "Salvar" habilita apenas quando `JSON.stringify(currentValues) !== JSON.stringify(originalValues)`.
- **Fluxo de edicao**: ver architecture-sprint1.md, secao 6.4 (Fluxo: Editar Tarefa) e frontend-spec.md, secao 3.3.
- **Validacao client-side**: usar `updateTaskSchema` de `lib/validators.js` antes de chamar `useBoardStore.updateTask(taskId, updates)`.
- **Reutilizar componentes da Story 1.1**: Input, Select, TaskTypeSelector, PrioritySelector, FormField ja existem. O TaskForm da criacao pode ter partes reutilizadas, mas o modal de edicao tem logica adicional (dirty state, dados pre-preenchidos, botao deletar).
- **Botao "Salvar"**: estilo `.btnPrimary` conforme frontend-spec.md. Botao "Cancelar": estilo `.btnGhost`.

## Estimativa
M -- A maior parte dos componentes ja existe (Story 1.1 e 1.2). Adicionar dirty state tracking, loading state no botao e integracao com `updateTask` do store.

## Definition of Done
- [ ] Codigo implementado
- [ ] Sem erros de lint
- [ ] Build passando
- [ ] Criterios de aceite verificados manualmente
- [ ] Dirty state funciona corretamente (botao habilita/desabilita)

---

# Story 1.4: Deletar tarefa (ConfirmDialog + API DELETE)

## Status: Draft

## Descricao
Como **Lead Felipe**, eu quero deletar tarefas obsoletas com um dialogo de confirmacao para que o board nao fique poluido com cards irrelevantes e eu nao delete tarefas acidentalmente.

## Contexto Tecnico
- Arquivos a criar:
  - `src/components/ui/ConfirmDialog.js` + `ConfirmDialog.module.css`
- Arquivos a modificar:
  - `src/components/Kanban/TaskModal.js` -- adicionar botao "Excluir" (icone Trash2) no footer esquerdo que abre ConfirmDialog
- Dependencias: Story 1.2 (TaskModal), Story 0.3 (useUIStore.confirmDialog, useBoardStore.deleteTask), Story 0.4 (API DELETE)
- Stack: React 19, zustand, CSS Modules, lucide-react

## Criterios de Aceite
- [ ] Given que o TaskModal esta aberto, when o usuario ve o footer do modal, then ha um botao de lixeira (icone Trash2) no lado esquerdo com variante "danger" (vermelho no hover)
- [ ] Given que o usuario clica no botao de lixeira, when o click e processado, then um ConfirmDialog aparece com titulo "Excluir tarefa", mensagem "Tem certeza que deseja excluir esta tarefa? Esta acao nao pode ser desfeita." e botao "Excluir tarefa" em vermelho
- [ ] Given que o ConfirmDialog esta aberto, when o usuario clica "Excluir tarefa", then a tarefa e removida da UI imediatamente (optimistic), o modal e o dialog fecham, e um toast de sucesso aparece ("Tarefa excluida")
- [ ] Given que o delete falhou na API, when o erro e capturado, then a tarefa retorna ao board (rollback) e um toast de erro aparece ("Erro ao salvar. Tente novamente.")
- [ ] Given que o ConfirmDialog esta aberto, when o usuario clica "Cancelar", then o dialog fecha e o TaskModal permanece aberto
- [ ] Given que o ConfirmDialog esta aberto, when o usuario pressiona Escape, then o dialog fecha sem deletar (equivalente a Cancelar)
- [ ] Given que o ConfirmDialog e do tipo "danger", when o dialog abre, then o foco vai para o botao "Cancelar" (prevenir acao acidental de pressionar Enter)
- [ ] Given que a tarefa foi deletada com sucesso, when o usuario recarrega a pagina, then a tarefa nao aparece mais no board (confirmando persistencia)

## Notas Tecnicas
- **ConfirmDialog**: componente generico em `components/ui/`. Props: `{ isOpen, title, message, confirmLabel, cancelLabel, variant, onConfirm, onCancel }`. Renderiza como mini-modal (max-width: 400px) com backdrop. Ver frontend-spec.md, secao 2.3.7 e wireframe 6.6.
- **Integracao com useUIStore**: o TaskModal chama `useUIStore.showConfirmDialog(title, message, onConfirm)`. O ConfirmDialog le `useUIStore.confirmDialog` para decidir se renderiza. Ver architecture-sprint1.md, secao 6.5 (Fluxo: Deletar Tarefa).
- **Botao danger**: estilo `.btnDanger` com background `--color-danger` (#ef4444) e hover `#dc2626`. Ver frontend-spec.md, secao 2.3.7.
- **Focus no Cancelar**: quando `variant="danger"`, o focus automatico vai para o botao Cancelar em vez do Confirmar, evitando delecao acidental por Enter.

## Estimativa
P -- ConfirmDialog e um componente simples. A logica de delete ja existe no store (Story 0.3). Integracao direta com TaskModal.

## Definition of Done
- [ ] Codigo implementado
- [ ] Sem erros de lint
- [ ] Build passando
- [ ] Criterios de aceite verificados manualmente
- [ ] ConfirmDialog acessivel (Escape fecha, focus trap)

---

## Epico 2: Persistencia & Migracao

---

# Story 2.1: Migrar page.js de mock data para Supabase (hydrate do store)

## Status: Draft

## Descricao
Como **PM Camila**, eu quero que ao abrir o board as tarefas sejam carregadas do Supabase (nao mais de dados hardcoded) para que eu possa confiar no board como fonte de verdade do time, com dados que sobrevivem ao recarregamento da pagina.

## Contexto Tecnico
- Arquivos a modificar:
  - `src/app/page.js` -- refatorar completamente: remover colunas hardcoded, remover mock tasks, remover logica DnD inline, remover polling; adicionar fetch de `/api/boards/[boardId]`, hydrate do useBoardStore, renderizacao via store
  - `src/components/Kanban/Board.js` -- remover botoes sem funcionalidade (Bell, Filter, LayoutGrid, ArrowLeft); titulo dinamico do store
  - `src/components/Kanban/Column.js` -- ler tasks do store (via `useBoardStore.getTasksByColumn(columnId)`) em vez de receber por props
  - `src/components/Kanban/Card.js` -- adaptar campos para novo modelo de dados (type em lowercase, priority como campo separado)
  - `src/components/Kanban/Sidebar.js` -- preparar para receber dados dinamicos (sem alteracao funcional nesta story, apenas ajustar imports)
- Arquivos a criar:
  - `src/components/Kanban/DndProvider.js` -- wrapper DndContext + sensores + handlers de drag (extraido de page.js)
  - `src/hooks/useDragAndDrop.js` -- logica DnD extraida de page.js
- Dependencias: Story 0.3 (stores), Story 0.4 (API routes), Story 0.1 (Supabase com dados)
- Stack: React 19, Next.js 16, zustand, @dnd-kit

## Criterios de Aceite
- [ ] Given que o Supabase tem dados (seed), when o usuario abre o board, then as 6 colunas e as 4 tasks iniciais sao carregadas do Supabase e exibidas corretamente (nao mais hardcoded)
- [ ] Given que o board esta carregando, when o fetch ainda nao retornou, then uma mensagem "Carregando..." e exibida no lugar do board
- [ ] Given que o fetch falhou (Supabase offline), when o erro e capturado, then uma mensagem de erro e exibida com texto amigavel em PT-BR ("Erro ao carregar o board")
- [ ] Given que o usuario criou/editou/deletou tarefas, when ele recarrega a pagina (F5), then todas as alteracoes persistem e o board mostra o estado salvo no Supabase
- [ ] Given que o board carregou do Supabase, when o usuario tenta arrastar cards entre colunas, then o drag-and-drop continua funcionando normalmente (sem regressao)
- [ ] Given que o Board.js header e renderizado, when o usuario olha para os botoes, then NAO existem botoes de Bell, Filter, LayoutGrid ou ArrowLeft (zero botoes mortos)
- [ ] Given que o board carregou, when o usuario ve o titulo, then o titulo exibido e "Oxy" (vindo do Supabase, nao hardcoded)
- [ ] Given que `page.js` foi refatorado, when se analisa o arquivo, then ele contem menos de 80 linhas e funciona apenas como coordenador de componentes (fetch + hydrate + renderizacao de Sidebar, DndProvider, Board, TaskModal, ConfirmDialog, Toast)
- [ ] Given que o `DndProvider.js` foi criado, when um card e arrastado, then os handlers `onDragStart`, `onDragOver`, `onDragEnd` sao processados pelo hook `useDragAndDrop`

## Notas Tecnicas
- **Refatoracao de page.js**: ver architecture-sprint1.md, secao 7 (Plano de Migracao, Fase 4, Passo 4.1) para o esqueleto do page.js refatorado. O useEffect faz fetch de `/api/boards/${DEFAULT_BOARD_ID}` e chama `hydrate(board, columns, tasks)`.
- **DndProvider.js**: encapsula `DndContext`, sensores `PointerSensor` (com `activationConstraint: { distance: 5 }`) e `KeyboardSensor`, collision detection strategy, e os handlers. Ver architecture-sprint1.md, secao 6.3 (DndProvider spec) e hook useDragAndDrop.js (secao 7, Fase 3).
- **Remocao de botoes mortos**: Board.js header deve manter apenas titulo do board e avatar group dos membros. Botoes de filtro, notificacao e visualizacao sao Sprint 2+. Principio: "Zero botoes mortos". Ver frontend-spec.md, secao 2.4.
- **Column.js**: em vez de receber `tasks` como prop, chamar `useBoardStore.getTasksByColumn(column.id)` internamente.
- **Card.js**: adaptar para novo schema. O campo `type` agora e lowercase (`task`, `user_story`, `bug`, `epic`, `spike`). Prioridade e um campo separado (`priority`), nao mais uma tag.
- **IMPORTANTE**: manter `import './kanban.css'` no page.js. Os estilos globais existentes nao sao removidos no Sprint 1.
- **Limitacao conhecida**: sem Supabase Realtime no Sprint 1. Alteracoes feitas por outro usuario so aparecem apos recarregar a pagina.

## Estimativa
G -- Refatoracao significativa do page.js (233 linhas -> ~80), criacao do DndProvider, hook useDragAndDrop, e modificacao de 4 componentes existentes. Alto risco de regressao se nao testado cuidadosamente.

## Definition of Done
- [ ] Codigo implementado
- [ ] Sem erros de lint
- [ ] Build passando
- [ ] Criterios de aceite verificados manualmente
- [ ] DnD funciona sem regressao (mover cards entre colunas)
- [ ] Nenhum botao visivel sem funcionalidade
- [ ] Dados carregam do Supabase, nao de mock

---

# Story 2.2: Persistir drag-and-drop (salvar posicao no banco via API move)

## Status: Draft

## Descricao
Como **Dev Andrey**, eu quero que quando eu movo um card de "A Fazer" para "Em Progresso" essa mudanca seja permanente para que meu tech lead veja o status atualizado ao abrir o board.

## Contexto Tecnico
- Arquivos a modificar:
  - `src/hooks/useDragAndDrop.js` -- integrar com `useBoardStore.moveTask()` no `handleDragEnd` para persistir via API
  - `src/components/Kanban/DndProvider.js` -- garantir que DragOverlay funciona com dados do store
- Dependencias: Story 2.1 (page.js migrado, DndProvider criado), Story 0.3 (useBoardStore.moveTask), Story 0.4 (API PATCH /api/tasks/[taskId]/move)
- Stack: @dnd-kit, zustand

## Criterios de Aceite
- [ ] Given que o usuario arrasta um card da coluna "A Fazer" para "Em Progresso", when ele solta o card, then o card aparece na coluna "Em Progresso" imediatamente (optimistic update) e um PATCH e enviado para `/api/tasks/[taskId]/move`
- [ ] Given que o PATCH de move foi bem-sucedido, when o usuario recarrega a pagina, then o card esta na coluna "Em Progresso" (posicao persistida no Supabase)
- [ ] Given que o PATCH de move falhou (rede, Supabase offline), when o erro e capturado, then o card retorna a posicao original (rollback) e um toast de erro aparece ("Erro ao mover tarefa. Posicao restaurada.")
- [ ] Given que o usuario arrasta um card para o final de uma coluna, when a posicao e calculada, then a nova position e `ultimaTaskDaColuna.position + 1000.0`
- [ ] Given que o usuario arrasta um card entre dois cards existentes, when a posicao e calculada, then a nova position e a media das posicoes dos dois cards adjacentes (float positioning)
- [ ] Given que o usuario arrasta um card para o inicio de uma coluna, when a posicao e calculada, then a nova position e `primeiraTaskDaColuna.position / 2`
- [ ] Given que o usuario arrasta um card para uma coluna vazia, when a posicao e calculada, then a nova position e `1000.0` (POSITION_GAP)
- [ ] Given que o usuario reordena cards dentro da mesma coluna (mesmo column_id), when ele solta o card, then a nova posicao e calculada e persistida (mesma logica de float positioning)
- [ ] Given que um card esta sendo arrastado, when o DragOverlay e exibido, then um clone visual do card segue o ponteiro com shadow elevado e o card original fica com opacity 0.5

## Notas Tecnicas
- **Float positioning (ADR-004)**: posicoes sao `DOUBLE PRECISION` no Supabase. Ao inserir entre dois cards, calcular media: `newPosition = (positionBefore + positionAfter) / 2`. Isso evita reindexacao de todos os cards da coluna. Ver architecture-sprint1.md, secao 6.6 (Fluxo: DnD com Persistencia).
- **Hook useDragAndDrop.js**: ver architecture-sprint1.md, secao 7 (Fase 3, Passo 3.2) para implementacao completa do handleDragEnd com calculo de posicao.
- **moveTask no store**: ja implementa optimistic update + rollback (Story 0.3). O hook apenas chama `moveTask(taskId, targetColumnId, newPosition)`.
- **Collision detection**: usar `closestCorners` do @dnd-kit para detectar a coluna/card mais proximo durante o drag.
- **POSITION_GAP**: `1000.0` (de constants.js). Margem grande para permitir muitas insercoes intermediarias antes de precisar reindexar.

## Estimativa
M -- A maior parte da logica de DnD ja existe (extraida do page.js original na Story 2.1). O trabalho e integrar com o store (moveTask) e garantir calculo de posicao correto em todos os cenarios (inicio, meio, final, coluna vazia, mesma coluna).

## Definition of Done
- [ ] Codigo implementado
- [ ] Sem erros de lint
- [ ] Build passando
- [ ] Criterios de aceite verificados manualmente
- [ ] DnD entre colunas persiste no Supabase
- [ ] DnD dentro da mesma coluna persiste no Supabase
- [ ] Rollback funciona em caso de falha

---

## Epico 3: UI Interativa

---

# Story 3.1: Sidebar colapsavel (toggle 240px -> 60px)

## Status: Draft

## Descricao
Como **Dev Andrey**, eu quero colapsar a sidebar clicando no botao existente para que eu tenha mais espaco horizontal para visualizar as colunas do board, especialmente quando tenho muitas colunas abertas.

## Contexto Tecnico
- Arquivos a modificar:
  - `src/components/Kanban/Sidebar.js` -- adicionar logica de collapse usando `useUIStore.sidebarCollapsed` e `toggleSidebar()`; classe CSS condicional `sidebar-collapsed`
  - `src/app/kanban.css` -- adicionar estilos para `.sidebar.collapsed` (width: 60px, esconder textos, centralizar icones, rotacionar chevron)
- Dependencias: Story 0.3 (useUIStore com sidebarCollapsed e toggleSidebar)
- Stack: React 19, zustand, CSS (kanban.css existente)

## Criterios de Aceite
- [ ] Given que a sidebar esta expandida (240px), when o usuario clica no botao de collapse (ChevronLeft), then a sidebar anima suavemente para 60px de largura (~300ms ease)
- [ ] Given que a sidebar esta colapsada (60px), when o usuario olha para a sidebar, then ve apenas os icones de navegacao centralizados, sem textos de label
- [ ] Given que a sidebar esta colapsada, when o usuario clica no botao de collapse (agora ChevronRight), then a sidebar expande de volta para 240px com animacao suave
- [ ] Given que a sidebar colapsou, when o usuario olha para o board, then o board ocupa o espaco liberado (flex: 1 natural)
- [ ] Given que a sidebar esta colapsada, when o usuario passa o mouse sobre um icone de navegacao, then um tooltip (title nativo) exibe o nome do item (ex: "Meus Quadros")
- [ ] Given que o icone do botao de collapse e ChevronLeft quando expandida, when a sidebar colapsa, then o icone rotaciona 180 graus (vira ChevronRight visualmente) com transicao animada
- [ ] Given que o usuario colapsou a sidebar, when ele navega pelo board (sem recarregar), then o estado colapsado persiste durante a sessao (via useUIStore)
- [ ] Given que o usuario recarrega a pagina, when o board carrega, then a sidebar volta ao estado padrao (expandida) -- persistencia de sessao apenas, nao entre reloads no Sprint 1

## Notas Tecnicas
- **CSS para estado colapsado**: ver frontend-spec.md, secao 2.3.4. Principais mudancas: `width: var(--sidebar-width-collapsed)` (60px), `.logo-text` e `.nav-item span` ficam `display: none` ou `opacity: 0`, `.nav-item` centralizado com `justify-content: center`. Botao de collapse com `transform: rotate(180deg)` no icone SVG.
- **Transicao**: `transition: width var(--transition-slow)` (0.3s ease) na sidebar. Textos podem usar `opacity 0.2s` para fade antes da largura mudar.
- **Responsividade**: no tablet (<1024px), sidebar inicia colapsada por padrao. No mobile (<768px), sidebar vira barra horizontal (comportamento existente, nao alterar). Ver frontend-spec.md, secao 5.4.
- **useUIStore**: `sidebarCollapsed` (boolean) + `toggleSidebar()`. Ja definido na Story 0.3.

## Estimativa
P -- Modificacao de um componente existente (Sidebar.js) com CSS de transicao e toggle via store. Baixa complexidade.

## Definition of Done
- [ ] Codigo implementado
- [ ] Sem erros de lint
- [ ] Build passando
- [ ] Criterios de aceite verificados manualmente
- [ ] Animacao suave (sem jank visual)
- [ ] Board ocupa espaco liberado

---

# Story 3.2: Colunas colapsaveis (toggle 320px -> 48px com titulo vertical)

## Status: Draft

## Descricao
Como **Lead Felipe**, eu quero colapsar colunas que nao me interessam no momento para que eu possa focar nas colunas "Revisao" e "Em Progresso" sem o board ficar muito largo.

## Contexto Tecnico
- Arquivos a modificar:
  - `src/components/Kanban/Column.js` -- adicionar logica de collapse via `useUIStore.toggleColumn(columnId)` e `isColumnCollapsed(columnId)`; renderizar estado colapsado (barra vertical com titulo rotacionado + badge de contagem)
  - `src/app/kanban.css` -- adicionar estilos para coluna colapsada (`.column-collapsed`, titulo vertical com writing-mode, count badge, hover state, drop zone visual)
- Dependencias: Story 0.3 (useUIStore com collapsedColumns e toggleColumn), Story 2.1 (Column.js lendo do store)
- Stack: React 19, zustand, @dnd-kit, CSS

## Criterios de Aceite
- [ ] Given que uma coluna esta expandida, when o usuario clica no botao de collapse (ChevronsLeft) no header da coluna, then a coluna anima de 320px para 48px de largura (~300ms ease)
- [ ] Given que uma coluna esta colapsada (48px), when o usuario olha para a coluna, then ve: um status dot com a cor da coluna, um badge com a contagem de tarefas, e o titulo rotacionado 90 graus (vertical, leitura de baixo para cima)
- [ ] Given que uma coluna esta colapsada, when o usuario clica em qualquer area da coluna colapsada, then a coluna expande de volta para largura normal com animacao suave
- [ ] Given que uma coluna esta colapsada, when o usuario arrasta um card e solta sobre a coluna colapsada, then a tarefa e adicionada ao final da coluna e o badge de contagem atualiza
- [ ] Given que um card esta sendo arrastado sobre uma coluna colapsada, when o card esta sobre a coluna, then a coluna colapsada mostra visual feedback (borda com `--border-focus`, background `#1c142e`)
- [ ] Given que os cards de uma coluna estao visiveis, when a coluna colapsa, then os cards ficam ocultos (nao visualmente acessiveis) mas continuam existindo no store
- [ ] Given que o usuario colapsou multiplas colunas, when ele olha para o board, then as colunas expandidas ocupam mais espaco (flexbox natural distribui)
- [ ] Given que o usuario colapsou colunas, when ele recarrega a pagina, then as colunas voltam ao estado padrao (expandidas) -- persistencia de sessao apenas no Sprint 1

## Notas Tecnicas
- **CSS para coluna colapsada**: ver frontend-spec.md, secao 2.3.5. Principais classes: `.columnCollapsed` (width: 48px, cursor: pointer, flex-direction: column), `.columnCollapsedTitle` (writing-mode: vertical-lr, transform: rotate(180deg)), `.columnCollapsedCount` (badge com background #1f2937).
- **DnD em coluna colapsada**: a coluna colapsada deve manter seu `droppable` area ativa do @dnd-kit. Ao soltar um card, calcular posicao como "final da coluna" (ultima position + POSITION_GAP).
- **Transicao**: `transition: min-width var(--transition-slow), width var(--transition-slow)`.
- **Icone do botao**: `ChevronsLeft` quando expandida, `ChevronsRight` quando colapsada (lucide-react).
- **Responsividade**: no mobile (<768px), collapse desabilitado (colunas ficam em scroll horizontal). Ver frontend-spec.md, secao 5.5.
- **useUIStore**: `collapsedColumns` (objeto { [columnId]: boolean }) + `toggleColumn(columnId)`. Ja definido na Story 0.3.

## Estimativa
M -- Modificacao do Column.js com logica condicional de renderizacao (expandido vs colapsado), CSS de titulo vertical, e integracao com DnD para drop em coluna colapsada. Requer cuidado com a interacao DnD.

## Definition of Done
- [ ] Codigo implementado
- [ ] Sem erros de lint
- [ ] Build passando
- [ ] Criterios de aceite verificados manualmente
- [ ] DnD funciona com colunas colapsadas (drop aceito)
- [ ] Animacao suave
- [ ] Titulo vertical legivel

---

# Story 3.3: Toast notifications (feedback de CRUD)

## Status: Draft

## Descricao
Como **Estagiario Lucas**, eu quero receber feedback visual (notificacoes toast) quando crio, edito, deleto ou movo tarefas para que eu tenha certeza de que a acao foi executada com sucesso ou saiba quando algo deu errado.

## Contexto Tecnico
- Arquivos a criar:
  - `src/components/ui/Toast.js` + `Toast.module.css`
- Arquivos a modificar:
  - `src/app/globals.css` -- adicionar design tokens de toast (secao 1.2 da frontend-spec.md) se ainda nao adicionados
  - `src/app/page.js` -- garantir que o componente `<Toast />` esta renderizado (provavelmente ja incluido na Story 2.1)
- Dependencias: Story 0.3 (useUIStore com toasts, addToast, removeToast)
- Stack: React 19, zustand, CSS Modules, lucide-react

## Criterios de Aceite
- [ ] Given que o componente Toast esta renderizado no layout, when `useUIStore.addToast('Mensagem', 'success')` e chamado, then um toast verde aparece no canto inferior direito com icone CheckCircle e a mensagem
- [ ] Given que um toast de sucesso aparece, when 4 segundos passam, then o toast desaparece automaticamente
- [ ] Given que um toast de erro aparece, when 6 segundos passam, then o toast desaparece automaticamente (mais tempo para ler)
- [ ] Given que um toast e visivel, when o usuario clica no botao X do toast, then o toast desaparece imediatamente
- [ ] Given que um toast aparece, when a animacao e executada, then o toast desliza da direita (translateX 100% -> 0) com efeito bounce suave (~400ms)
- [ ] Given que multiplos toasts sao emitidos, when eles sao exibidos, then aparecem empilhados de baixo para cima (o mais recente embaixo)
- [ ] Given que uma tarefa e criada com sucesso, when o toast e emitido, then a mensagem e "Tarefa criada com sucesso" (type: success)
- [ ] Given que uma tarefa e atualizada com sucesso, when o toast e emitido, then a mensagem e "Alteracoes salvas" (type: success)
- [ ] Given que uma tarefa e excluida com sucesso, when o toast e emitido, then a mensagem e "Tarefa excluida" (type: success)
- [ ] Given que uma operacao falhou, when o toast e emitido, then a mensagem e "Erro ao salvar. Tente novamente." (type: error) com icone XCircle vermelho
- [ ] Given que um card e movido e a persistencia falhou, when o toast e emitido, then a mensagem e "Erro ao mover tarefa. Posicao restaurada." (type: error)
- [ ] Given que o board esta em mobile (<768px), when um toast aparece, then ele ocupa a largura total da tela com margens laterais de 16px (bottom-center)

## Notas Tecnicas
- **Toast component**: le `useUIStore.toasts` (array de `{ id, message, type }`). Renderiza lista de toasts no canto inferior direito com `position: fixed`. Botao X chama `useUIStore.removeToast(id)`. Ver frontend-spec.md, secao 2.3.6 e wireframe 6.7.
- **Icones por tipo**: success = `CheckCircle`, error = `XCircle`, info = `Info` (lucide-react).
- **Animacao**: `@keyframes slideInRight` com `--transition-spring` (0.4s cubic-bezier bounce). Ver frontend-spec.md, secao 2.3.6.
- **Design tokens de toast**: `--toast-bg-success`, `--toast-border-success`, `--toast-text-success` (idem para error e info). Ver frontend-spec.md, secao 1.2.
- **Duracao**: 4000ms para success/info, 6000ms para error. Configurado no `useUIStore.addToast()` (Story 0.3). Atualizar o timeout no store se estava com 3000ms.
- **Integracao com CRUD**: os componentes de TaskForm, TaskModal e DndProvider devem chamar `useUIStore.getState().addToast(message, type)` apos sucesso/erro das operacoes do store. Essa integracao pode ser feita nesta story ou ja estar parcialmente feita nas stories anteriores.
- **z-index**: `--z-toast: 1100` (acima do modal que e `--z-modal: 1000`).
- **role="alert"**: para acessibilidade, toasts devem ter `role="alert"` e `aria-live="polite"` para leitores de tela.

## Estimativa
P -- Componente de presentacao com animacao CSS. A logica de state ja esta no useUIStore (Story 0.3). Integracao com CRUD pode ja estar parcialmente feita.

## Definition of Done
- [ ] Codigo implementado
- [ ] Sem erros de lint
- [ ] Build passando
- [ ] Criterios de aceite verificados manualmente
- [ ] Toasts aparecem corretamente em todas as operacoes CRUD
- [ ] Animacao suave de entrada e saida
- [ ] Acessivel (role="alert")

---

## Resumo do Sprint 1

### Total de Stories: 13

### Distribuicao por Epico

| Epico | Stories | Descricao |
|-------|:-------:|-----------|
| 0 -- Setup de Infraestrutura | 4 | Supabase, dependencias, stores, API routes |
| 1 -- CRUD de Tarefas | 4 | Criar, visualizar, editar, deletar |
| 2 -- Persistencia & Migracao | 2 | Migrar page.js, persistir DnD |
| 3 -- UI Interativa | 3 | Sidebar, colunas, toasts |

### Estimativas

| Tamanho | Quantidade | Stories |
|---------|:----------:|---------|
| P (Pequena) | 4 | 0.2, 1.4, 3.1, 3.3 |
| M (Media) | 5 | 0.3, 0.4, 1.3, 2.2, 3.2 |
| G (Grande) | 4 | 0.1, 1.1, 1.2, 2.1 |

### Ordem de Implementacao (Respeita Dependencias)

```
Fase 1 - Infraestrutura:
  Story 0.1  Setup Supabase          [G]  (sem dependencias)
  Story 0.2  Dependencias/constants  [P]  (depende de 0.1)
  Story 0.3  Zustand stores          [M]  (depende de 0.2)
  Story 0.4  API routes              [M]  (depende de 0.1, 0.2)

Fase 2 - Migracao & Persistencia:
  Story 2.1  Migrar page.js          [G]  (depende de 0.3, 0.4)
  Story 2.2  Persistir DnD           [M]  (depende de 2.1)

Fase 3 - CRUD:
  Story 1.1  Criar tarefa            [G]  (depende de 0.3, 0.4)
  Story 1.2  Visualizar tarefa       [G]  (depende de 0.3)
  Story 1.3  Editar tarefa           [M]  (depende de 1.1, 1.2)
  Story 1.4  Deletar tarefa          [P]  (depende de 1.2, 0.3)

Fase 4 - UI Interativa:
  Story 3.1  Sidebar colapsavel      [P]  (depende de 0.3, 2.1)
  Story 3.2  Colunas colapsaveis     [M]  (depende de 0.3, 2.1)
  Story 3.3  Toast notifications     [P]  (depende de 0.3)
```

> **Nota:** Stories 1.1 e 2.1 podem ser desenvolvidas em paralelo apos a Fase 1. Stories 3.1, 3.2 e 3.3 podem ser desenvolvidas em paralelo apos a Fase 2.

### Grafo de Dependencias

```
0.1 ──> 0.2 ──> 0.3 ──> 2.1 ──> 2.2
  │       │       │       │
  │       │       │       ├──> 3.1
  │       │       │       └──> 3.2
  │       │       │
  │       │       ├──> 1.2 ──> 1.3
  │       │       │      └──> 1.4
  │       │       │
  │       │       └──> 3.3
  │       │
  └───────┴──> 0.4 ──> 1.1
```

### Limitacoes Conhecidas do Sprint 1

1. **Sem sincronizacao em tempo real**: dois usuarios abrindo o board simultaneamente nao verao alteracoes um do outro sem recarregar a pagina. Supabase Realtime sera implementado no Sprint 2.
2. **Lista de membros hardcoded**: o dropdown de responsavel usa uma lista fixa em `lib/constants.js`. Tabela de users vem no Sprint 3 com autenticacao.
3. **Labels/tags sem persistencia**: tabelas `labels` e `task_labels` nao existem no Sprint 1. Tags visuais nos cards sao apenas apresentacao.
4. **Sem filtros e busca**: funcionalidades de filtro por tipo/prioridade/responsavel e busca textual sao Sprint 2.
5. **Estado de UI nao persiste entre reloads**: sidebar colapsada e colunas colapsadas voltam ao padrao ao recarregar a pagina. Persistencia local (localStorage) pode ser adicionada como polish.

---

> **Documento preparado por River (Scrum Master Agent)**
> **Orquestrado por Orion (Master Orchestrator)**
> **Para uso do Dex (Dev Agent) -- Fevereiro 2026**
