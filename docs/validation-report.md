# O2 Kanban -- Relatorio de Validacao Cruzada

> **Documento:** Validacao de Consistencia entre Artefatos do Sprint 1
> **Projeto:** O2 Kanban -- Sprint 1 Enhancement
> **Fase:** Phase 3 -- Validation & Sharding
> **Data:** 20 de Fevereiro de 2026
> **Autor:** Pax (Product Owner Agent)
> **Versao:** 1.0

---

## Resumo Executivo

Este relatorio valida a consistencia entre os 5 documentos produzidos para o Sprint 1 do O2 Kanban:

1. **Project Brief** (Atlas) -- Analise de negocios
2. **Architecture Review** (Aria) -- Revisao arquitetural inicial
3. **PRD** (Morgan) -- Requisitos de produto com epicos e stories
4. **Architecture Sprint 1** (Aria) -- Blueprint de implementacao
5. **Frontend Spec** (Uma) -- Especificacao frontend

### Resultado Geral

| Categoria | Alinhados | Divergencias | Gaps |
|-----------|:---------:|:------------:|:----:|
| PRD <-> Arquitetura | 12 | 3 | 1 |
| PRD <-> Frontend Spec | 9 | 2 | 2 |
| Arquitetura <-> Frontend Spec | 8 | 3 | 2 |
| Escopo Sprint 1 (3 docs) | 7 | 2 | 1 |
| Gaps e Conflitos Gerais | -- | 3 | 2 |
| **TOTAL** | **36** | **13** | **8** |

**Veredito:** Os documentos estao **majoritariamente alinhados** nas decisoes estrategicas (stack, escopo MVP, prioridades). As divergencias encontradas sao de **media severidade** -- tratam-se de inconsistencias de nomenclatura, granularidade de componentes e pequenas discrepancias de escopo que devem ser resolvidas antes da implementacao.

---

## 1. PRD <-> Arquitetura

### 1.1 Epico 1: CRUD de Tarefas

| Item | Status | Detalhes |
|------|--------|---------|
| US-1.1: Criar tarefa via botao na coluna | ALINHADO | PRD define botao "+" em cada coluna. Arq Sprint 1 cria `CreateTaskButton.js` e `POST /api/tasks`. Schema SQL suporta todos os campos. |
| US-1.2: Visualizar detalhes da tarefa | ALINHADO | PRD exige modal de detalhes. Arq Sprint 1 define `TaskModal.js` com specs de props e comportamento. `GET /api/tasks/[taskId]` cobre. |
| US-1.3: Editar tarefa existente | ALINHADO | PRD lista campos editaveis (titulo, descricao, tipo, prioridade, responsavel). Arq Sprint 1 define `PATCH /api/tasks/[taskId]` com `updateTaskSchema` Zod cobrindo todos esses campos. |
| US-1.4: Deletar tarefa | ALINHADO | PRD exige confirmacao antes de deletar. Arq Sprint 1 define `ConfirmDialog.js` e `DELETE /api/tasks/[taskId]`. |
| US-1.5: Atribuir responsavel | DIVERGENCIA | **PRD** define "dropdown de selecao de responsavel" com "lista de membros com nome e avatar". **Arq Sprint 1** simplifica para `assignee: VARCHAR(100)` (texto livre) no schema SQL, sem tabela de users, e no TaskForm define `assignee` como "input text". A justificativa esta na Arq Sprint 1: "Sem tabela de users/auth por enquanto -- assignee e created_by serao TEXT com o nome/inicial do usuario". **Impacto:** A experiencia de dropdown com membros descrita no PRD nao sera possivel no Sprint 1. O usuario digitara o nome manualmente. |

**Subtotal:** 4 alinhados, 1 divergencia

### 1.2 Epico 2: Persistencia de Dados

| Item | Status | Detalhes |
|------|--------|---------|
| US-2.1: Dados persistem entre sessoes | ALINHADO | PRD exige Supabase PostgreSQL. Arq Sprint 1 define schema SQL completo com 3 tabelas (boards, columns, tasks), seed data, e todas as API routes. |
| US-2.2: DnD persiste posicao | ALINHADO | PRD exige optimistic update + rollback. Arq Sprint 1 implementa isso no `useBoardStore.moveTask()` com try/catch e `PATCH /api/tasks/[taskId]/move`. Float positioning (ADR-004) respeitado. |
| US-2.3: Setup banco de dados | ALINHADO | PRD lista tabelas necessarias. Arq Sprint 1 fornece SQL completo. Porem ver nota abaixo sobre tabelas simplificadas. |
| US-2.4: State management com Zustand | DIVERGENCIA | **PRD** define 3 stores: `useTaskStore`, `useBoardStore`, `useUIStore`. **Arq Sprint 1** unifica task+board em `useBoardStore` ("Para Sprint 1 com um unico board, um store unificado com columns + tasks e mais simples"). **Impacto:** Baixo. A decisao da Arq Sprint 1 e pragmatica e justificada. Porem, a nomenclatura diverge -- o PRD referencia `useTaskStore` em multiplos locais enquanto o Arq Sprint 1 nao o cria. Recomendacao: alinhar nomenclatura, mantendo a decisao de unificacao. |

| Item | Status | Detalhes |
|------|--------|---------|
| Schema simplificado vs modelo completo | DIVERGENCIA | **Arq Review** (doc 2) define 10 tabelas: users, workspaces, workspace_members, boards, board_members, columns, tasks, labels, task_labels, task_comments. **Arq Sprint 1** (doc 4) cria apenas 3: boards, columns, tasks. **PRD** (doc 3) menciona labels e task_labels como entidades do MVP. **Impacto:** Labels nao terao persistencia no Sprint 1. A tabela `labels` e `task_labels` mencionadas no PRD (secao 5 "Modelo de Dados - Resumo") nao existem no schema SQL do Sprint 1. O PRD lista "labels" como entidade principal do MVP, mas o Arq Sprint 1 as ignora. |

**Subtotal:** 3 alinhados, 2 divergencias

### 1.3 Epico 3: UI Interativa

| Item | Status | Detalhes |
|------|--------|---------|
| US-3.1: Colapsar sidebar | ALINHADO | PRD e Arq Sprint 1 concordam. `useUIStore.sidebarCollapsed` + refatoracao do `Sidebar.js`. |
| US-3.2: Colapsar colunas | ALINHADO | PRD e Arq Sprint 1 concordam. `useUIStore.collapsedColumns` + refatoracao do `Column.js`. |
| US-3.3: Filtrar por tipo e prioridade | ALINHADO | Ambos concordam que NAO entra no Sprint 1 (Sprint 2). |
| US-3.4: Busca textual | ALINHADO | Ambos concordam que NAO entra no Sprint 1 (Sprint 2). |
| US-3.5: Filtrar por responsavel | ALINHADO | Ambos concordam que NAO entra no Sprint 1 (Sprint 2). |

**Subtotal:** 5 alinhados

### 1.4 Epicos 4 e 5 (Slack + Auth)

| Item | Status | Detalhes |
|------|--------|---------|
| Epico 4: Integracao Slack | ALINHADO | PRD coloca no Sprint 3 (SHOULD HAVE). Arq Sprint 1 mantem o mock existente sem alterar. |
| Epico 5: Autenticacao | ALINHADO | PRD coloca no Sprint 3 (COULD HAVE). Arq Sprint 1 usa RLS com acesso publico temporario. |

**Subtotal:** 2 alinhados

### 1.5 Aspectos Tecnicos

| Item | Status | Detalhes |
|------|--------|---------|
| Supabase Realtime (ADR-005) | GAP | **PRD** (secao 6 "O Que NAO Entra") diz "Supabase Realtime / WebSocket (Sprint 2)". **Arq Review** (doc 2) define ADR-005 como substituicao do polling. **Arq Sprint 1** (doc 4) nao implementa Realtime, mas tambem **nao menciona o que acontece com o polling atual de 5s**. O `page.js` refatorado no Arq Sprint 1 remove o polling mas nao adiciona Realtime. **Impacto:** No Sprint 1, nao havera mecanismo de atualizacao em tempo real. Se dois usuarios abrirem o board simultaneamente, alteracoes de um nao aparecerao para o outro ate recarregar a pagina. Isso deve ser documentado como limitacao conhecida do Sprint 1. |

**Subtotal:** 0 alinhados, 0 divergencias, 1 gap

---

## 2. PRD <-> Frontend Spec

### 2.1 Componentes Novos

| Item | Status | Detalhes |
|------|--------|---------|
| Botao "+" criar tarefa | ALINHADO | PRD (US-1.1) e Frontend Spec (CreateTaskButton, secao 2.3.3) concordam. Icone "+" com texto "Adicionar tarefa" no rodape de cada coluna. |
| Modal de detalhes/edicao | ALINHADO | PRD (US-1.2, US-1.3) e Frontend Spec (TaskModal, secao 2.3.1) concordam nos campos, comportamento de fechar (X, Escape, click fora), e diferenciacao click vs drag. |
| Formulario de criacao | ALINHADO | PRD (US-1.1) e Frontend Spec (TaskForm, secao 2.3.2) concordam nos campos obrigatorios (titulo) e opcionais. |
| Dialog de confirmacao (delete) | ALINHADO | PRD (US-1.4) e Frontend Spec (ConfirmDialog, secao 2.3.7) concordam: confirmacao obrigatoria com mensagem "Esta acao nao pode ser desfeita". |
| Toast notifications | ALINHADO | PRD (criterios de aceite gerais: "Feedback visual para acoes do usuario") e Frontend Spec (Toast, secao 2.3.6) concordam. |
| Colapsar sidebar | ALINHADO | PRD (US-3.1) e Frontend Spec (secao 2.3.4) concordam nos comportamentos: toggle, transicao animada, apenas icones quando colapsada. |
| Colapsar colunas | ALINHADO | PRD (US-3.2) e Frontend Spec (secao 2.3.5) concordam: titulo vertical, contagem de tarefas, DnD em coluna colapsada. |

**Subtotal:** 7 alinhados

### 2.2 Componentes Atomicos

| Item | Status | Detalhes |
|------|--------|---------|
| Componentes UI (Input, Select, IconButton, Badge, FormField, TaskTypeSelector, PrioritySelector) | DIVERGENCIA | **Frontend Spec** define 7 componentes atomicos/moleculares em `components/ui/` com CSS Modules proprios. **Arq Sprint 1** nao menciona esses componentes atomicos -- define apenas `TaskModal.js`, `TaskForm.js`, `CreateTaskButton.js`, `ConfirmDialog.js` e `Toast.js`. **Impacto:** A Frontend Spec e mais granular e segue Atomic Design. A Arq Sprint 1 e mais pragmatica. O Dex precisara decidir se cria os atomos separados ou implementa inline nos organismos. **Recomendacao:** Seguir a Frontend Spec para consistencia de design system, mas nao bloquear entrega se o Dex preferir abordagem mais simples inicialmente. |
| Estrutura de pastas para UI | DIVERGENCIA | **Frontend Spec** coloca ConfirmDialog e Toast em `components/ui/`. **Arq Sprint 1** coloca ConfirmDialog em `components/Kanban/` e Toast em `components/ui/`. **Impacto:** Baixo, porem importante alinhar para evitar confusao. ConfirmDialog e generico (nao especifico do Kanban), portanto `components/ui/` faz mais sentido. |

**Subtotal:** 0 alinhados, 2 divergencias

### 2.3 Gaps Identificados

| Item | Status | Detalhes |
|------|--------|---------|
| Campo "Coluna" no TaskModal | GAP | **Frontend Spec** (wireframe 6.1 e secao 2.3.1 campo 6) inclui um dropdown "Coluna" no modal de detalhes para mover tarefa de coluna dentro do modal. **PRD** nao menciona explicitamente a possibilidade de mover tarefa via modal (apenas via DnD). **Arq Sprint 1** nao inclui essa funcionalidade no TaskModal. **Impacto:** Feature adicional nao prevista no PRD/Arq. Util mas nao essencial. Recomendacao: incluir, pois a Frontend Spec ja o especificou e melhora a UX (alternativa ao DnD para mover tarefas). |
| Botao "Voltar" no header | GAP | **PRD** nao menciona o botao. **Frontend Spec** (secao 2.4) diz "Remover ou tornar noop visualmente oculto". **Arq Sprint 1** nao aborda diretamente. **Project Brief** lista como gap de baixa prioridade. **Impacto:** Precisa de decisao explicita: remover ou manter oculto. Recomendacao: remover no Sprint 1 conforme principio "zero botoes mortos". |

**Subtotal:** 0 alinhados, 0 divergencias, 2 gaps

---

## 3. Arquitetura <-> Frontend Spec

### 3.1 Stores Zustand

| Item | Status | Detalhes |
|------|--------|---------|
| useUIStore -- sidebar | ALINHADO | Arq Sprint 1 define `sidebarCollapsed` + `toggleSidebar()`. Frontend Spec usa `isCollapsed` + `onToggle` como props do Sidebar (vindos do store). Compativel. |
| useUIStore -- colunas colapsadas | ALINHADO | Arq Sprint 1 define `collapsedColumns` (mapa) + `toggleColumn()`. Frontend Spec referencia `useUIStore.toggleColumnCollapse(columnId)`. Mesmo conceito, nomes ligeiramente diferentes mas compativel. |
| useUIStore -- modal | DIVERGENCIA | **Arq Sprint 1** usa `activeTaskId` (string UUID ou null) + `isCreateModalOpen` (boolean) + `createModalColumnId`. **Frontend Spec** referencia `useUIStore.setActiveModal({ type: 'task-detail', taskId })` e `useUIStore.setActiveModal({ type: 'task-create', columnId })` -- um pattern unico com objeto tipado. **Impacto:** Implementacoes diferentes para a mesma funcionalidade. A abordagem da Arq Sprint 1 e mais simples (flags booleanas). A da Frontend Spec e mais extensivel (um unico `activeModal` object). Recomendacao: adotar a abordagem do Arq Sprint 1 por simplicidade no Sprint 1, com path claro para refatorar se necessario. |
| useUIStore -- toasts | ALINHADO | Ambos definem array de toasts com type (success/error/info) e auto-remove. Arq Sprint 1 usa 3000ms, Frontend Spec usa 4000ms (ver divergencia abaixo). |
| useUIStore -- confirmDialog | ALINHADO | Ambos definem pattern similar para dialogo de confirmacao. |
| useBoardStore -- tasks CRUD | ALINHADO | Arq Sprint 1 define `addTask`, `updateTask`, `deleteTask`, `moveTask` com optimistic updates. Frontend Spec referencia essas operacoes nos fluxos de interacao (secao 3). |

**Subtotal:** 5 alinhados, 1 divergencia

### 3.2 Endpoints / Operacoes

| Item | Status | Detalhes |
|------|--------|---------|
| CRUD tasks | ALINHADO | Arq Sprint 1 define 7 API routes. Frontend Spec referencia create, update, delete e move nos fluxos. Compativel. |
| GET board completo | ALINHADO | Arq Sprint 1 define `GET /api/boards/[boardId]` retornando board + columns + tasks. Frontend Spec usa esses dados para hidratar stores. |

**Subtotal:** 2 alinhados

### 3.3 Divergencias Especificas

| Item | Status | Detalhes |
|------|--------|---------|
| Duracao do toast | DIVERGENCIA | **Arq Sprint 1** define auto-remove em 3000ms (3s). **Frontend Spec** define duracao padrao de 4000ms (4s) e 6000ms para erros. **Impacto:** Baixo, porem deve ser padronizado. Recomendacao: adotar os valores da Frontend Spec (4s/6s) pois ela e a autoridade em UX. |
| Tipos de tarefa | DIVERGENCIA | **Arq Sprint 1** (schema SQL e validators) define: `task`, `user_story`, `bug`, `epic`, `spike`. **Frontend Spec** (TaskTypeSelector, secao 2.2.2) lista apenas 4: `Task`, `User Story`, `Bug`, `Epic` -- sem `Spike`. Alem disso, usa nomes capitalizados (`Task` vs `task`). **Impacto:** Medio. O `spike` existe no banco mas nao sera selecionavel na UI. A capitalizacao diverge (DB usa lowercase, Frontend usa PascalCase). Recomendacao: a Frontend Spec deve incluir `Spike` como opcao, e usar os mesmos valores do banco (lowercase) internamente, com labels PT-BR para display. |

### 3.4 Gaps

| Item | Status | Detalhes |
|------|--------|---------|
| DndProvider como componente | GAP | **Arq Sprint 1** define `DndProvider.js` em `components/Kanban/` como wrapper do DndContext. **Frontend Spec** nao menciona o DndProvider como componente. **Impacto:** Baixo. A Frontend Spec foca em UI/UX, nao em wrappers tecnico-estruturais. O DndProvider e necessario conforme Arq Sprint 1. |
| Componentes ui/ adicionais | GAP | **Frontend Spec** define 7 componentes atomicos em `components/ui/` (Input, Select, IconButton, Badge, FormField, TaskTypeSelector, PrioritySelector). **Arq Sprint 1** nao os lista na estrutura de pastas -- coloca tudo diretamente nos organismos. **Impacto:** Medio. Esses atomos melhoram reusabilidade e consistencia do design system. Recomendacao: o Dex deve criar pelo menos Input, Select e Badge como componentes reutilizaveis, conforme Frontend Spec. |

**Subtotal:** 1 alinhado, 2 divergencias, 2 gaps

---

## 4. Escopo Sprint 1 -- Consenso entre os 3 Docs

### 4.1 O que ENTRA no Sprint 1

| Feature | PRD | Arq Sprint 1 | Frontend Spec | Status |
|---------|:---:|:------------:|:-------------:|--------|
| Setup Supabase + schema + seed | SIM | SIM | N/A | ALINHADO |
| Zustand stores (board, ui) | SIM | SIM | SIM (referencia) | ALINHADO |
| Botao "+" criar tarefa | SIM | SIM | SIM | ALINHADO |
| Modal de criacao de tarefa | SIM | SIM | SIM | ALINHADO |
| Modal de detalhes/edicao | SIM | SIM | SIM | ALINHADO |
| Delete com confirmacao | SIM | SIM | SIM | ALINHADO |
| Persistencia CRUD no Supabase | SIM | SIM | N/A | ALINHADO |
| DnD persiste posicao | SIM | SIM | SIM (secao 3.7) | ALINHADO |
| Colapsar sidebar | SIM | SIM | SIM | ALINHADO |
| Colapsar colunas | SIM | SIM | SIM | ALINHADO |
| Remover botoes sem funcionalidade | SIM | SIM | SIM | ALINHADO |
| Toast notifications | SIM (implicito, criterios gerais) | SIM (Toast.js) | SIM (secao 2.3.6) | ALINHADO |

**Subtotal:** 12 alinhados

### 4.2 O que NAO entra no Sprint 1

| Feature | PRD | Arq Sprint 1 | Frontend Spec | Status |
|---------|:---:|:------------:|:-------------:|--------|
| Filtros e busca | Sprint 2 | Nao | Nao | ALINHADO |
| Integracao Slack real | Sprint 3 | Nao (manter mock) | N/A | ALINHADO |
| Autenticacao | Sprint 3 | Nao (RLS publico) | N/A | ALINHADO |
| Supabase Realtime | Sprint 2 | Nao | N/A | ALINHADO |
| Comentarios | Sprint 2+ | Nao | N/A | ALINHADO |
| Testes automatizados | Sprint 2 | Nao | N/A | ALINHADO |
| Metricas | Sprint 3+ | Nao | N/A | ALINHADO |

**Subtotal:** 7 alinhados

### 4.3 Divergencias de Escopo

| Item | Status | Detalhes |
|------|--------|---------|
| Migracao CSS Modules | DIVERGENCIA | **PRD** lista como item 13 do Sprint 1: "Migracao CSS Modules (componentes principais)" com prioridade SHOULD. **Arq Sprint 1** diz "Manter kanban.css global -- novos componentes usam CSS Modules, existentes mantem classes globais por enquanto". **Frontend Spec** cria CSS Modules para todos os novos componentes. **Impacto:** Ambiguidade sobre quanto migrar. Recomendacao: novos componentes usam CSS Modules (consenso), componentes existentes NAO migram no Sprint 1 (economia de tempo). |
| Atribuir responsavel (dropdown vs texto livre) | DIVERGENCIA | **PRD** (item 7 do Sprint 1, 4-5h) define "Atribuir responsavel (dropdown)". **Arq Sprint 1** simplifica para input text (sem tabela de users). **Frontend Spec** (TaskForm, secao 2.3.2) define "Select, opcional, placeholder 'Sem responsavel'" e o TaskModal tem "Select dropdown com lista de membros". **Impacto:** Discordancia fundamental. O PRD e Frontend Spec esperam um dropdown com lista de membros. A Arq Sprint 1 nao tem dados para popular esse dropdown (sem tabela users). Recomendacao: usar uma lista hardcoded de membros em `lib/constants.js` (como ja existe no Board.js atual: Matheus, Andrey, Felipe, Caio) como solucao intermediaria. Isso atende o UX do dropdown sem exigir tabela de users. |

**Subtotal:** 0 divergencias criticas que bloqueiam o Sprint 1

### 4.4 Gap de Escopo

| Item | Status | Detalhes |
|------|--------|---------|
| Persistencia sem atualizacao em tempo real | GAP | Entre Sprint 1 (sem Realtime) e Sprint 2 (com Realtime), nao ha mecanismo para dois usuarios verem alteracoes um do outro sem recarregar. Nenhum dos 3 docs explicita esta limitacao como "known limitation" do Sprint 1. Recomendacao: documentar como limitacao conhecida e considerar manter o polling com intervalo maior (30s) como fallback temporario no Sprint 1. |

---

## 5. Gaps e Conflitos Gerais

### 5.1 Conflitos entre Documentos

| # | Conflito | Docs Envolvidos | Severidade | Recomendacao |
|---|---------|----------------|:----------:|--------------|
| C1 | **Nomenclatura de stores**: PRD usa `useTaskStore` + `useBoardStore` + `useUIStore` (3 stores). Arq Sprint 1 unifica em `useBoardStore` + `useUIStore` (2 stores). Frontend Spec referencia `useTaskStore` em fluxos de interacao. | PRD, Arq Sprint 1, Frontend Spec | Media | Adotar a decisao do Arq Sprint 1 (2 stores), pois e justificada e pragmatica. Atualizar referencias no PRD e Frontend Spec. |
| C2 | **Tipos de tarefa**: Schema SQL define 5 tipos (task, user_story, bug, epic, spike). Frontend Spec TaskTypeSelector lista 4 (sem spike). PRD nao especifica a lista exata. | Arq Sprint 1, Frontend Spec | Baixa | Incluir `spike` no TaskTypeSelector da Frontend Spec. Label PT-BR: "Spike" (termo tecnico mantido). |
| C3 | **Valores de tipo no frontend**: Frontend Spec usa PascalCase (`Task`, `User Story`, `Bug`, `Epic`). Schema SQL e Zod validators usam lowercase (`task`, `user_story`, `bug`, `epic`). | Arq Sprint 1, Frontend Spec | Media | Padronizar: valores internos (DB, API, store) em lowercase. Labels de display em PT-BR conforme `lib/constants.js` (ja definido no Arq Sprint 1). Frontend Spec deve ser atualizada para usar valores lowercase internamente. |

### 5.2 Gaps Nao Cobertos

| # | Gap | Docs que Deveriam Cobrir | Severidade | Recomendacao |
|---|-----|-------------------------|:----------:|--------------|
| G1 | **Tratamento de erro no carregamento inicial**: O que mostrar se o fetch inicial do board falhar (Supabase down, rede offline)? O Arq Sprint 1 mostra `if (error) return <div>Erro: {error}</div>` -- muito basico. A Frontend Spec nao define um estado de erro para a pagina inteira. | Arq Sprint 1, Frontend Spec | Media | Criar um componente de erro simples com botao "Tentar novamente" e mensagem amigavel em PT-BR. |
| G2 | **Loading state da pagina**: O Arq Sprint 1 mostra `if (isLoading) return <div>Carregando...</div>` -- sem design. A Frontend Spec nao define skeleton/loading state para o board. | Arq Sprint 1, Frontend Spec | Baixa | Manter loading simples no Sprint 1. Implementar skeleton screens no Sprint 2 como polish. |

### 5.3 Notas de Rastreabilidade

| Acao Atlas (Brief) | Epico PRD | Arq Sprint 1 | Frontend Spec | Coberto? |
|--------------------|-----------|--------------|---------------|----------|
| Acao 1: CRUD completo | Epico 1 (US-1.1 a 1.5) | API routes + store + componentes | TaskModal, TaskForm, CreateTaskButton | SIM |
| Acao 2: Persistencia | Epico 2 (US-2.1 a 2.4) | Supabase schema + API + stores | N/A (backend) | SIM |
| Acao 3: Corrigir elementos quebrados | Epico 3 (US-3.1, 3.2) | Sidebar + Column refactor | CollapsibleSidebar, CollapsibleColumn, Board header cleanup | SIM |
| Acao 4: Busca e filtros | Epico 3 (US-3.3 a 3.5) | Fora do Sprint 1 | Fora do Sprint 1 | SIM (alinhado como Sprint 2) |
| Acao 5: Integracao Slack | Epico 4 (US-4.1 a 4.4) | Fora do Sprint 1 | Fora do Sprint 1 | SIM (alinhado como Sprint 3) |

---

## 6. Recomendacoes do PO

Com base na analise acima, recomendo as seguintes acoes antes de iniciar a implementacao:

### Prioridade ALTA (resolver antes de codar)

1. **Alinhar nomenclatura de stores**: Confirmar que serao 2 stores (`useBoardStore` + `useUIStore`) conforme Arq Sprint 1. Comunicar ao Dex que referencias a `useTaskStore` no PRD e Frontend Spec devem ser interpretadas como `useBoardStore`.

2. **Decidir sobre dropdown de responsavel**: Adotar solucao intermediaria -- lista hardcoded de membros em `lib/constants.js` para popular um Select dropdown. Isso atende UX sem exigir tabela de users.

3. **Padronizar tipos de tarefa**: Usar lowercase em todo o pipeline (`task`, `user_story`, `bug`, `epic`, `spike`). Labels PT-BR apenas no display. Incluir `spike` no seletor de tipo.

### Prioridade MEDIA (resolver durante implementacao)

4. **Documentar limitacao de tempo real**: No Sprint 1, dois usuarios nao verao alteracoes um do outro sem recarregar. Avaliar se manter polling com intervalo de 30s como solucao temporaria.

5. **Alinhar duracao de toasts**: Adotar 4s (sucesso) e 6s (erro) conforme Frontend Spec.

6. **ConfirmDialog em `components/ui/`**: Seguir Frontend Spec (generico), nao Arq Sprint 1 (Kanban-especifico).

7. **Criar componentes atomicos minimos**: Pelo menos `Input`, `Select` e `Badge` como componentes reutilizaveis em `components/ui/`, conforme Frontend Spec. Nao e necessario criar todos os 7 atomos antes de comecar os organismos.

### Prioridade BAIXA (pode ficar para ajuste pos-Sprint 1)

8. **Labels/tags sem persistencia**: A tabela `labels` nao existe no Sprint 1. Tags nos cards serao mantidas como parte do design visual sem CRUD no banco.

9. **Mover tarefa via modal**: A Frontend Spec inclui dropdown "Coluna" no modal. Implementar se houver tempo, pois melhora UX para usuarios que nao querem usar DnD.

---

## 7. Checklist de Validacao Final

### Alinhamento Estrategico

- [x] Os 3 docs concordam sobre o objetivo do Sprint 1: CRUD + persistencia + botoes funcionais
- [x] Os 3 docs concordam sobre o que NAO entra: filtros, Slack real, auth, Realtime
- [x] O Project Brief e o PRD concordam sobre personas e prioridades MoSCoW
- [x] A Arq Review e a Arq Sprint 1 sao consistentes nas ADRs
- [x] A Frontend Spec respeita o design system existente (tokens CSS)

### Rastreabilidade

- [x] Todo epico do PRD tem suporte na arquitetura
- [x] Todos os endpoints necessarios estao definidos na Arq Sprint 1
- [x] Todos os componentes novos da Frontend Spec mapeiam para features do PRD
- [x] Todos os fluxos de interacao da Frontend Spec tem endpoints correspondentes

### Pontos de Atencao

- [ ] Resolver divergencia de stores (2 vs 3) antes da implementacao
- [ ] Resolver dropdown de responsavel (lista hardcoded vs input text)
- [ ] Incluir `spike` no seletor de tipo da Frontend Spec
- [ ] Documentar limitacao de ausencia de tempo real no Sprint 1
- [ ] Padronizar duracao de toasts entre Arq Sprint 1 e Frontend Spec

---

> **Documento preparado por Pax (Product Owner Agent)**
> **Orquestrado por Orion (Master Orchestrator)**
> **Para uso interno da O2 Inc -- Fevereiro 2026**
