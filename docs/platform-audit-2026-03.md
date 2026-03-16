# O2 Kanban — Auditoria Completa da Plataforma

> **Data:** 06 de Marco de 2026
> **Orquestrador:** Orion (Master Orchestrator)
> **Agentes:** Atlas (Analyst), Aria (Architect), Uma (UX/UI)
> **Modo:** Autonomo — 3 agentes em paralelo

---

## Sumario Executivo

A plataforma O2 Kanban evoluiu significativamente desde o prototipo inicial. Possui **86 componentes**, **41 API routes**, **16 tabelas SQL**, **5 Zustand stores** e funcionalidades avancadas como AI chat, timer/pomodoro, sprints, automacoes, labels, subtasks e dependencias.

Porem, a analise cruzada dos 3 agentes revelou **12 problemas criticos/altos** que comprometem a usabilidade real da plataforma, **3 features completamente mortas** (implementadas mas nunca conectadas), e **problemas de seguranca** nas RLS policies que expoe dados entre usuarios.

**Veredicto:** A plataforma tem muita feature, mas pouca coesao. O foco deve ser em **fazer o que existe funcionar corretamente** antes de adicionar qualquer coisa nova.

---

## Panorama: O Que Existe Hoje

### Funcionalidades Operacionais (26)
- Auth Google OAuth + middleware de protecao de rotas
- CRUD completo de boards, colunas, tasks
- Drag-and-drop com persistencia (dnd-kit + Supabase)
- Filtros client-side (tipo, prioridade, responsavel, busca)
- Comentarios em tasks com rich text (tiptap)
- Sistema de membros com join requests
- Labels/tags coloridas por board
- Subtasks e dependencias entre tasks
- Timer por task + Pomodoro widget
- Analytics por board (metricas, distribuicao, alertas)
- Dashboard global com metricas
- Central de tarefas (todos pessoais + minhas tasks cross-board)
- Board tasks (tarefas pessoais por board)
- Views alternativas (List, Table, Gantt, Calendar)
- Saved views por board
- Bulk actions (mover/deletar multiplas tasks)
- AI Chat integrado (Gemini)
- Sprints/ciclos por board
- Command palette (Ctrl+K)
- Atalhos de teclado extensivos
- Tema dark/light com toggle
- Rich text editor (tiptap)
- Toast notifications + confirm dialogs
- Skeleton loading states
- Avatars com foto do Google OAuth
- Settings de perfil do usuario

### Features Mortas (3) — Implementadas mas nunca conectadas
1. **Motor de Automacoes** — engine.js existe, UI de CRUD existe, mas `runAutomations` nunca e chamada
2. **Activity Log** — tabela, API e componente existem, mas nenhuma acao popula o log
3. **Notificacoes** — tabela e componente existem, mas nenhuma acao gera notificacoes + API quebrada

### Features Mock (1)
- **Slack Webhook** — array in-memory, formato incompativel com schema real

---

## Problemas Consolidados por Prioridade

### P0 — CRITICOS (Bloqueadores de uso real)

| # | Problema | Agente | Impacto |
|---|---------|--------|---------|
| **C1** | **RLS permissivo nas tabelas core** — `boards`, `columns`, `tasks` tem `USING (true)`. Qualquer usuario autenticado le/escreve qualquer board via Supabase client direto. | Aria | Seguranca — dados expostos entre usuarios |
| **C2** | **API de Notificacoes 100% quebrada** — usa `.eq('auth_id', ...)` mas a coluna nao existe. Endpoint retorna vazio sempre. | Atlas + Aria | Feature visivel na UI que nunca funciona |
| **C3** | **`is_done_column` nunca configurado** — nenhuma coluna e marcada como "done". Analytics de velocity, lead time, completion rate = 0 sempre. Dashboard mostra `total_completed: 0`. | Atlas | Analytics e dashboard inuteis |
| **C4** | **Light theme quebrado** — 21+ cores hardcoded (`#fff`, `#ef4444`, etc.) em 15 arquivos CSS Module. Texto branco fica invisivel sobre fundo branco. | Uma | Tema claro inutilizavel |
| **C5** | **Tokens CSS indefinidos** — `--bg-hover`, `--bg-input`, `--shadow-lg`, `--color-high`, `--sidebar-text` usados em kanban.css mas nunca definidos em globals.css. Estilos falham silenciosamente. | Uma | Elementos visuais quebrados |

### P1 — ALTOS (Degradam experiencia significativamente)

| # | Problema | Agente | Impacto |
|---|---------|--------|---------|
| **A1** | **3 conceitos redundantes de "tarefas pessoais"** — `tasks` (assignee=eu), `board_tasks` (painel lateral), `personal_todos` (Central de Tarefas). Confunde onde criar tarefa pessoal. | Atlas | UX confusa — usuario nao sabe onde agir |
| **A2** | **Activity Log nunca populado** — feed de atividade sempre vazio. | Atlas | Feature visivel que nunca mostra dados |
| **A3** | **Motor de Automacoes nunca invocado** — `runAutomations` definido mas nunca chamado em nenhum fluxo. | Atlas | Feature complexa completamente inutil |
| **A4** | **Dashboard so mostra dados para `owner`** — membros normais veem "Nenhum board encontrado". | Atlas | Maioria do time sem acesso a metricas |
| **A5** | **N+1 queries na listagem de boards** — 2 queries extras por board. 10 boards = 20 queries. | Aria | Performance degradada |
| **A6** | **`SELECT * FROM users` em 3+ endpoints** — carrega todos usuarios para filtrar poucos. | Aria | Performance + exposicao de dados |
| **A7** | **Board header congestionado** — 10+ elementos em barra de 60px. Sem tratamento responsivo. | Uma | UI transborda em telas < 1440px |
| **A8** | **Bulk Actions faz `window.location.reload()`** — perde filtros, scroll, estados colapsados. | Atlas | UX destrutiva apos acao em massa |
| **A9** | **Zero suporte a `prefers-reduced-motion`** — animacoes framer-motion extensivas sem opt-out. | Uma | Acessibilidade — usuarios sensiveis a movimento |
| **A10** | **Sem focus trap em modais** — Tab escapa do modal para elementos atras. | Uma | Acessibilidade |

### P2 — MEDIOS (Melhorias importantes)

| # | Problema | Agente |
|---|---------|--------|
| **M1** | `board_members` RLS permite INSERT irrestrito — qualquer usuario pode se adicionar a qualquer board | Aria |
| **M2** | Divergencia `personal_todos` RLS (slug) vs API (UUID) — bomba-relogio | Atlas + Aria |
| **M3** | Dashboard query faz select de colunas inexistentes em `board_members` | Atlas |
| **M4** | Sem paginacao em nenhum endpoint de listagem | Aria |
| **M5** | framer-motion (~35KB) importado em 23 componentes, maioria substituivel por CSS transitions | Aria |
| **M6** | TaskModal god component (541 linhas, 10+ useState, 5 useEffect) | Aria |
| **M7** | `checkMembership` reimplementado em 7+ API routes sem utilitario compartilhado | Aria |
| **M8** | 118 inline styles em 41 componentes (dashboard/page.js com 16 sozinho) | Uma |
| **M9** | 16 tamanhos de font-size ad-hoc sem tokenizacao | Uma |
| **M10** | Command Palette em ingles ("Go to Boards") enquanto UI e PT-BR | Uma |
| **M11** | Contraste insuficiente no text-muted (#5a6270 = ~3.5:1, abaixo do WCAG AA 4.5:1) | Uma |
| **M12** | Dois sistemas de estilizacao em conflito (CSS Modules + kanban.css global 1710 linhas) | Uma |
| **M13** | Timer persistence fire-and-forget com `.catch(() => {})` — tempo perdido silenciosamente | Aria |
| **M14** | `tasks.assignee` usa VARCHAR(slug) sem FK — sem integridade referencial | Atlas |
| **M15** | Duplicacao de estilos de botao em TaskModal, TaskForm e inline — sem componente Button | Uma |

### P3 — BAIXOS (Polish e cleanup)

| # | Problema | Agente |
|---|---------|--------|
| **B1** | Mock mode (mockStore.js 528 linhas + isMock checks) ainda no codigo de producao | Aria |
| **B2** | `DEFAULT_BOARD_ID` hardcoded como fallback em GET /api/tasks | Atlas + Aria |
| **B3** | `getFilteredTasksByColumn` no store e codigo morto — Column reimplementa a logica | Aria |
| **B4** | `loadCurrentUser` no useUserStore e wrapper redundante de `initialize` | Aria |
| **B5** | `task.tags` renderizado no Card mas campo nao existe no schema | Aria |
| **B6** | Sem onboarding para novos usuarios — tela vazia sem guia | Uma |
| **B7** | Sem `Cmd+Enter` para submeter modais | Uma |
| **B8** | Atalho "c" (criar tarefa) nao pre-seleciona coluna | Uma |

---

## Plano de Acao Recomendado

### Sprint 3A: "Solidificacao" — Fazer o que existe funcionar

**Objetivo:** Corrigir tudo que esta quebrado antes de adicionar qualquer feature nova.

#### Fase 1: Seguranca (P0)
1. Atualizar RLS de `boards`, `columns`, `tasks` — restringir via board_members
2. Restringir RLS de `board_members` INSERT — apenas owners podem adicionar
3. Adicionar verificacao de permissao em `/api/tasks/bulk`

#### Fase 2: Correcoes Criticas (P0)
4. Fix API notificacoes: `.eq('auth_id', ...)` -> `.eq('id', ...)`
5. Marcar coluna "Concluido" como `is_done_column: true` no seed e criar migration
6. Adicionar UI para configurar `is_done_column` (toggle no header da coluna)
7. Substituir TODAS as cores hardcoded (#fff, #ef4444, etc.) por tokens CSS
8. Definir tokens faltantes (--bg-hover, --bg-input, --shadow-lg, --color-high, --sidebar-text)

#### Fase 3: Ativar Features Mortas (P1)
9. Integrar `runAutomations` no useBoardStore.moveTask e addTask
10. Adicionar chamadas POST ao activity log nas API routes de CRUD
11. Gerar notificacoes ao: atribuir task, receber comentario, task overdue

#### Fase 4: Correcoes de UX (P1)
12. Dashboard: mostrar boards de qualquer role (nao apenas owner)
13. BulkActions: substituir `window.location.reload()` por update otimistico do Zustand
14. Board header: agrupar acoes secundarias em menu "..." para reduzir congestionamento
15. Adicionar `prefers-reduced-motion` global
16. Adicionar focus trap nos modais

### Sprint 3B: "Performance & Coesao"

#### Performance
17. Eliminar N+1 em GET /api/boards — usar count aggregation
18. Substituir `SELECT * FROM users` por JOINs filtrados
19. Adicionar paginacao nos endpoints de listagem
20. Extrair `checkMembership` para `src/lib/auth.js` reutilizavel

#### Coesao
21. **Simplificar conceitos de tarefas pessoais** — unificar ou diferenciar claramente board_tasks vs personal_todos
22. Refatorar TaskModal (541 linhas) — extrair hooks e sub-componentes
23. Criar componente Button reutilizavel e eliminar duplicacao
24. Traduzir Command Palette para PT-BR
25. Melhorar contraste do text-muted para WCAG AA

### Sprint 3C: "Polish"
26. Tokenizar font-sizes (criar escala --text-xs a --text-2xl)
27. Migrar inline styles do Dashboard para CSS Modules
28. Remover mock mode (mockStore.js + isMock checks)
29. Remover codigo morto (getFilteredTasksByColumn, loadCurrentUser, slack-webhook, task.tags)
30. Adicionar Cmd+Enter para submeter modais
31. Pre-selecionar primeira coluna no atalho "c"
32. Adicionar onboarding basico para novos usuarios

---

## Metricas de Sucesso

| Metrica | Atual | Meta |
|---------|-------|------|
| Features visiveis quebradas | 3 (notificacoes, activity, analytics) | 0 |
| Features mortas (nao conectadas) | 3 (automacoes, activity log, notificacoes) | 0 |
| Cores hardcoded em CSS Modules | 21+ | 0 |
| Tokens CSS indefinidos | 5+ | 0 |
| N+1 queries | 3 endpoints | 0 |
| Endpoints sem verificacao de permissao | 5+ | 0 |
| RLS policies permissivas (USING true) | 3 tabelas core | 0 |
| Conceitos redundantes de tarefas pessoais | 3 | 1-2 (claros) |
| Inline styles em componentes | 118 | < 20 |
| WCAG AA compliance | Parcial | Completo |

---

## Conclusao

A plataforma O2 Kanban tem uma **excelente base tecnica** (Next.js 16, React 19, Supabase, Zustand) e um **design system coerente** com a identidade visual "Mission Control". O drag-and-drop e fluido, os atalhos de teclado sao extensivos, e a variedade de views (kanban, list, table, gantt, calendar) e impressionante.

O problema central e: **muitas features foram construidas mas nao conectadas entre si**. Automacoes existem mas nunca disparam. Activity log existe mas nunca e populado. Notificacoes existem mas a API esta quebrada. Analytics existem mas `is_done_column` nunca e configurado, entao tudo mostra zero.

A recomendacao principal e: **parar de adicionar features e focar em fazer as existentes funcionarem corretamente.** O Sprint 3A proposto acima resolve os 5 problemas criticos e ativa as 3 features mortas — transformando a plataforma de "muita feature que nao funciona" para "features que funcionam de verdade".

---

> **Relatorio consolidado por Orion (Master Orchestrator)**
> **Baseado nas analises de Atlas (Analyst), Aria (Architect) e Uma (UX/UI)**
> **Marco 2026**
