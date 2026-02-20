# O2 Kanban -- Product Requirements Document (PRD)

> **Documento:** PRD -- Sprint de Enhancement
> **Projeto:** O2 Kanban -- Quadro Kanban integrado ao Slack para a O2 Inc
> **Fase:** Phase 1 -- Enhancement (Brownfield)
> **Data:** 20 de Fevereiro de 2026
> **Autor:** Morgan (Product Manager Agent)
> **Versao:** 1.0
> **Baseado em:** Project Brief (Atlas, v1.0) + Architecture Review (Aria, v1.0)

---

## Indice

1. [Problem Statement](#1-problem-statement)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [User Personas](#3-user-personas)
4. [Feature Requirements (Epicos)](#4-feature-requirements-epicos)
5. [Technical Constraints](#5-technical-constraints)
6. [Escopo do Sprint 1 (MVP)](#6-escopo-do-sprint-1-mvp)
7. [Timeline & Milestones](#7-timeline--milestones)
8. [Risks & Mitigations](#8-risks--mitigations)
9. [Criterios de Aceite Gerais](#9-criterios-de-aceite-gerais)
10. [Out of Scope](#10-out-of-scope)

---

## 1. Problem Statement

### O Problema

A O2 Inc possui um prototipo funcional de Kanban interno construido com Next.js 16 e React 19. O prototipo tem uma UI visualmente consistente, drag-and-drop funcional entre 6 colunas e design system com tokens bem definidos. Porem, **o produto e inutilizavel em producao** porque:

- **Nao e possivel criar tarefas pela interface** -- nao existe botao "Adicionar Tarefa"
- **Nao ha persistencia de dados** -- qualquer informacao e perdida ao recarregar a pagina
- **Nao existe modal de detalhes** -- impossivel editar, ver descricao ou atribuir responsaveis
- **Botoes decorativos sem funcionalidade** -- colapsar sidebar, colapsar colunas, filtros e notificacoes existem visualmente mas nao fazem nada, minando a confianca no produto
- **Integracao Slack e mock** -- webhook funciona apenas em memoria, sem conexao real
- **Sem autenticacao** -- qualquer pessoa com a URL acessa o board

### Para Quem

O time interno da O2 Inc, composto por aproximadamente 10 pessoas, sendo 90% brasileiros. O Slack e o principal canal de comunicacao da equipe, e a necessidade de uma ferramenta de gestao de tarefas que integre nativamente com o Slack e opere em PT-BR e o motivador central deste projeto.

### Impacto do Nao-Fazer

Sem este enhancement, o time continuara usando ferramentas genericas (Trello, Notion, Google Sheets) que nao integram nativamente com o workflow Slack da O2, resultando em:
- Tarefas perdidas entre canais de comunicacao
- Overhead de alternar entre ferramentas
- Custo recorrente de licencas (~USD 80-160/mes para ~10 usuarios)
- Perda de contexto entre discussao (Slack) e execucao (board)

---

## 2. Goals & Success Metrics

### Objetivo Estrategico

Transformar o O2 Kanban de um prototipo visual em uma **ferramenta de trabalho diaria funcional**, com persistencia de dados, CRUD completo de tarefas e interatividade real -- entregando o MVP no Sprint 1 e evoluindo ate integracao Slack bidirecional no Sprint 3.

### KPIs Mensuraveis

| Metrica | Baseline (Atual) | Meta Sprint 1 | Meta Sprint 2 | Meta Sprint 3 | Meta Sprint 4 |
|---------|:-----------------:|:-------------:|:-------------:|:-------------:|:-------------:|
| Tarefas criadas via UI / semana | 0 | >10 | >20 | >30 | >30 |
| Tarefas criadas via Slack / semana | 0 (mock) | 0 (mock) | 0 (mock) | >5 (real) | >10 |
| Taxa de retencao diaria (DAU / total) | N/A | >50% do time | >60% | >80% | >80% |
| Bugs criticos abertos | N/A | <3 | <2 | <1 | 0 |
| Tempo para criar uma tarefa | Impossivel | <30s | <20s | <15s | <15s |
| Elementos visuais sem funcionalidade | 5+ | 0 | 0 | 0 | 0 |
| Dados persistidos apos reload | 0% | 100% (Supabase) | 100% | 100% | 100% |
| Uptime do board | N/A | >95% | >98% | >99% | >99% |

### Criterio de Sucesso do Sprint 1 (Go/No-Go)

O Sprint 1 sera considerado **bem-sucedido** se:
1. Usuarios conseguem criar, editar e deletar tarefas pela interface
2. Dados persistem entre sessoes (Supabase PostgreSQL)
3. Todos os botoes visiveis na interface tem funcionalidade real
4. O drag-and-drop continua funcionando e o novo estado persiste

---

## 3. User Personas

Quatro personas foram identificadas pela analise de negocios (Atlas). Elas guiam todas as decisoes de feature e priorizacao deste PRD.

### Persona 1: "Dev Andrey" -- Desenvolvedor Full-Stack

| Atributo | Detalhe |
|----------|---------|
| **Perfil** | 25-35 anos, usa VS Code + GitHub + Slack + terminal |
| **Objetivo** | Visualizar rapidamente o que precisa fazer e atualizar status sem sair do fluxo de trabalho |
| **Dor Principal** | "Perco tempo alternando entre Slack e o board. Quero que tarefas do Slack aparecam automaticamente." |
| **Necessidades Criticas** | Drag-and-drop fluido, criacao rapida de tarefas, interface sem clutter |
| **Frustracao** | Ferramentas pesadas que exigem muitos cliques para acoes simples |

### Persona 2: "PM Camila" -- Product Manager / Scrum Master

| Atributo | Detalhe |
|----------|---------|
| **Perfil** | 28-40 anos, usa Slack + Google Sheets + Notion |
| **Objetivo** | Visibilidade do progresso do time, identificar gargalos e reportar status |
| **Dor Principal** | "Preciso ver metricas de velocidade e conseguir filtrar por responsavel ou prioridade." |
| **Necessidades Criticas** | Filtros por pessoa/prioridade/tipo, notificacoes, visao de metricas basicas |
| **Frustracao** | Dados perdidos quando a pagina recarrega (falta de persistencia) |

### Persona 3: "Lead Felipe" -- Tech Lead

| Atributo | Detalhe |
|----------|---------|
| **Perfil** | 30-45 anos, usa Slack + GitHub + CI/CD |
| **Objetivo** | Garantir que o time segue o processo, revisar tarefas em "Revisao", mover para "Concluido" |
| **Dor Principal** | "Quero ser notificado no Slack quando algo entra em Revisao e poder aprovar direto de la." |
| **Necessidades Criticas** | Integracoes Slack bidirecionais, notificacoes de status change |
| **Frustracao** | Botoes que nao funcionam minam a confianca no produto |

### Persona 4: "Estagiario Lucas" -- Estagiario / Junior

| Atributo | Detalhe |
|----------|---------|
| **Perfil** | 20-24 anos, usa Slack + VS Code + navegador |
| **Objetivo** | Saber exatamente o que fazer a seguir sem ter que perguntar |
| **Dor Principal** | "As ferramentas em ingles me confundem. Gosto que esse board esteja em portugues." |
| **Necessidades Criticas** | Interface intuitiva em PT-BR, instrucoes claras nos cards |
| **Frustracao** | Nao consegue criar tarefa via interface (precisa pedir para alguem) |

---

## 4. Feature Requirements (Epicos)

### Epico 1: CRUD de Tarefas

**Objetivo:** Permitir que qualquer usuario crie, visualize, edite e delete tarefas diretamente pela interface do board.

**Prioridade:** MUST HAVE (Sprint 1)

**Contexto:** Atualmente e impossivel criar tarefas pela UI. Os 4 cards existentes sao hardcoded no codigo-fonte. Este e o gap mais critico -- sem CRUD, o produto e apenas uma demonstracao visual.

#### User Stories

**US-1.1: Criar tarefa via botao na coluna**
> Como **Estagiario Lucas**, eu quero clicar em um botao "+" em qualquer coluna para que eu possa criar minhas proprias tarefas sem depender de outra pessoa.

Criterios de aceite:
- Cada coluna exibe um botao "Adicionar tarefa" (icone "+" ou texto)
- Ao clicar, abre um formulario inline ou modal com campos: titulo (obrigatorio), tipo (task/user_story/bug/epic), prioridade (low/medium/high/urgent)
- O card e criado na coluna onde o botao foi clicado
- O card aparece no final da coluna (ultima posicao)
- Labels permanecem em PT-BR (A Fazer, Bug, Historia de Usuario, etc.)

**US-1.2: Visualizar detalhes da tarefa**
> Como **PM Camila**, eu quero clicar em um card para ver todos os detalhes da tarefa para que eu possa entender o contexto completo antes de priorizar.

Criterios de aceite:
- Clicar no card abre um modal/dialog com todos os campos da tarefa
- O modal exibe: titulo, descricao, tipo, prioridade, responsavel, coluna atual, data de criacao
- O modal pode ser fechado via botao "X", tecla Escape, ou clique fora
- A abertura do modal nao interfere com o drag-and-drop (clicar != arrastar)

**US-1.3: Editar tarefa existente**
> Como **Dev Andrey**, eu quero editar o titulo, tipo e prioridade de uma tarefa diretamente no modal para que eu possa corrigir informacoes rapidamente sem recria-la.

Criterios de aceite:
- No modal de detalhes, todos os campos sao editaveis
- Campos editaveis: titulo, descricao, tipo, prioridade, responsavel
- Alteracoes sao salvas ao confirmar (botao "Salvar") ou descartadas ao cancelar
- Feedback visual de sucesso apos salvar (ex: toast notification ou mudanca visual)

**US-1.4: Deletar tarefa**
> Como **Lead Felipe**, eu quero deletar tarefas obsoletas para que o board nao fique poluido com cards que nao sao mais relevantes.

Criterios de aceite:
- Botao de delete acessivel no modal de detalhes da tarefa
- Confirmacao obrigatoria antes de deletar ("Tem certeza? Esta acao nao pode ser desfeita.")
- Card e removido do board imediatamente apos confirmacao
- Operacao e persistida (nao reaparece ao recarregar)

**US-1.5: Atribuir responsavel a tarefa**
> Como **PM Camila**, eu quero selecionar um membro do time como responsavel da tarefa para que fique claro quem deve executa-la.

Criterios de aceite:
- Dropdown de selecao de responsavel no formulario de criacao e no modal de edicao
- Lista de membros exibida com nome e avatar
- O avatar do responsavel aparece no card no board
- E possivel deixar o campo vazio (tarefa sem responsavel)

---

### Epico 2: Persistencia de Dados

**Objetivo:** Garantir que todos os dados do board (tarefas, posicoes, colunas) sobrevivam ao recarregamento da pagina e sejam acessiveis por multiplos usuarios.

**Prioridade:** MUST HAVE (Sprint 1)

**Contexto:** Conforme revisao arquitetural da Aria, Supabase (PostgreSQL + Auth + Realtime) foi escolhido como backend (ADR-001). O estado atual usa apenas `useState` em memoria -- zero persistencia.

#### User Stories

**US-2.1: Dados persistem entre sessoes**
> Como **PM Camila**, eu quero que ao recarregar a pagina todas as tarefas e suas posicoes estejam exatamente como eu deixei para que eu possa confiar no board como fonte de verdade do time.

Criterios de aceite:
- Tarefas criadas, editadas ou movidas sao salvas no Supabase (PostgreSQL)
- Ao recarregar a pagina, o board reflete o ultimo estado salvo
- Posicoes das tarefas nas colunas sao preservadas (float positioning conforme ADR-004)
- Colunas mantem sua configuracao (titulo, cor, ordem)

**US-2.2: Drag-and-drop persiste posicao**
> Como **Dev Andrey**, eu quero que quando eu movo um card de "A Fazer" para "Em Progresso" essa mudanca seja permanente para que meu tech lead veja o status atualizado.

Criterios de aceite:
- Ao soltar um card em nova coluna, a mudanca e enviada ao Supabase
- Optimistic update: o card move imediatamente na UI (sem esperar resposta do server)
- Se a persistencia falhar, o card retorna a posicao original com mensagem de erro
- A posicao dentro da coluna (ordem vertical) tambem e persistida

**US-2.3: Setup do banco de dados**
> Como **desenvolvedor**, eu quero que o schema do banco de dados esteja configurado no Supabase para que todas as operacoes CRUD tenham onde persistir.

Criterios de aceite:
- Tabelas criadas conforme modelo de dados da Aria: boards, columns, tasks, users (profile), labels, task_labels
- Migrations versionadas e aplicaveis via Supabase CLI
- Seed data com as 6 colunas padrao do board O2 (A Fazer, Priorizado, Em Progresso, Revisao, Concluido, Backlog)
- Indexes criados para queries frequentes (tasks por column, tasks por board, tasks por assignee)

**US-2.4: State management com Zustand**
> Como **desenvolvedor**, eu quero que o estado do board seja gerenciado por Zustand stores para que a logica esteja separada dos componentes e o "god component" (page.js) seja descomposto.

Criterios de aceite:
- `useTaskStore` gerencia tarefas (CRUD, filtros, drag state)
- `useBoardStore` gerencia board ativo (colunas, metadata)
- `useUIStore` gerencia estado da interface (sidebar collapsed, modal ativo, theme)
- Stores comunicam com Supabase para leitura e escrita
- `page.js` reduzido de 233 linhas para coordenacao de componentes apenas

---

### Epico 3: UI Interativa

**Objetivo:** Tornar todos os elementos visuais existentes funcionais e adicionar interacoes essenciais para usabilidade (filtros, busca, colapsar elementos).

**Prioridade:** MUST HAVE (Sprint 1 para botoes quebrados) / SHOULD HAVE (Sprint 2 para filtros e busca)

**Contexto:** A auditoria do Atlas identificou 5+ elementos visuais sem funcionalidade. Botoes que existem mas nao fazem nada minam a confianca do usuario (especialmente Lead Felipe). Filtros e busca sao necessidades criticas da PM Camila.

#### User Stories

**US-3.1: Colapsar sidebar**
> Como **Dev Andrey**, eu quero colapsar a sidebar clicando no botao existente para que eu tenha mais espaco horizontal para visualizar o board.

Criterios de aceite:
- Clicar no botao de collapse da sidebar reduz a sidebar a um estado minimo (apenas icones)
- Clicar novamente restaura a sidebar completa
- Estado de collapsed persiste durante a sessao (via `useUIStore`)
- Transicao animada (suave, ~200ms)
- Board ocupa o espaco liberado

**US-3.2: Colapsar colunas**
> Como **Lead Felipe**, eu quero colapsar colunas que nao me interessam no momento para que eu possa focar nas colunas "Revisao" e "Em Progresso".

Criterios de aceite:
- Cada coluna tem um botao de collapse no header
- Coluna colapsada mostra apenas o titulo vertical (ou titulo + contagem) com largura minima
- Clicar na coluna colapsada expande novamente
- Cards dentro da coluna colapsada ficam ocultos mas continuam existindo
- Drag-and-drop continua funcionando com colunas colapsadas (pode soltar card em coluna colapsada)

**US-3.3: Filtrar tarefas por tipo e prioridade**
> Como **PM Camila**, eu quero filtrar tarefas por tipo (Bug, Task, User Story) e prioridade (Urgente, Alta) para que eu possa focar nos itens mais criticos durante a daily.

Criterios de aceite:
- Barra de filtro acessivel no header do board (onde o icone de filtro ja existe)
- Filtros disponiveis: por tipo (task, user_story, bug, epic), por prioridade (low, medium, high, urgent)
- Filtros sao combinaveis (ex: "todos os bugs urgentes")
- Cards que nao correspondem ao filtro sao ocultados (ou opacidade reduzida)
- Indicador visual de que filtros estao ativos
- Botao "Limpar filtros" para restaurar visao completa

**US-3.4: Busca textual de tarefas**
> Como **Estagiario Lucas**, eu quero buscar tarefas pelo titulo para que eu encontre rapidamente a tarefa que me foi atribuida sem navegar por todas as colunas.

Criterios de aceite:
- Campo de busca no header do board
- Busca por texto no titulo da tarefa (case-insensitive)
- Resultados em tempo real conforme o usuario digita (debounce de ~300ms)
- Cards que nao correspondem sao ocultados
- Busca combinavel com filtros

**US-3.5: Filtrar por responsavel**
> Como **Lead Felipe**, eu quero filtrar tarefas por responsavel para que eu veja rapidamente a carga de trabalho de cada membro do time.

Criterios de aceite:
- Filtro por responsavel disponivel na barra de filtros
- Dropdown com lista de membros do time
- Opcao "Sem responsavel" para ver tarefas nao atribuidas
- Combinavel com outros filtros

---

### Epico 4: Integracao Slack

**Objetivo:** Implementar integracao bidirecional real entre o O2 Kanban e o Slack workspace da O2 Inc, substituindo o webhook mock atual.

**Prioridade:** SHOULD HAVE (Sprint 3)

**Contexto:** A integracao Slack e o **diferencial competitivo principal** do O2 Kanban (conforme analise do Atlas). Atualmente existe apenas um mock in-memory. A Aria definiu verificacao de assinatura Slack (ADR-006) e substituicao de polling por Supabase Realtime (ADR-005).

#### User Stories

**US-4.1: Criar tarefa via slash command no Slack**
> Como **Dev Andrey**, eu quero digitar `/o2kanban Bug: Corrigir login` no Slack para que a tarefa seja criada automaticamente no Backlog do board sem eu precisar abrir o navegador.

Criterios de aceite:
- Slash command `/o2kanban` registrado no Slack workspace
- Formato aceito: `/o2kanban [tipo:] titulo` (tipo e opcional, default = task)
- Tarefa criada na coluna "Backlog" do board configurado
- Bot responde no Slack com confirmacao e link para o card
- Webhook validado via X-Slack-Signature (ADR-006)

**US-4.2: Notificacao Slack quando tarefa muda de coluna**
> Como **Lead Felipe**, eu quero receber uma notificacao no canal #dev do Slack quando uma tarefa entra na coluna "Revisao" para que eu saiba que ha algo para revisar sem ficar verificando o board.

Criterios de aceite:
- Quando uma tarefa muda de coluna, uma mensagem e enviada ao canal Slack configurado
- Mensagem inclui: titulo da tarefa, coluna anterior, coluna nova, quem moveu
- Canal de notificacao configuravel por board
- Colunas que disparam notificacao sao configuraveis (default: Revisao, Concluido)

**US-4.3: Mover tarefa via reacao no Slack**
> Como **Lead Felipe**, eu quero reagir com um emoji de check na notificacao de "Revisao" no Slack para que a tarefa seja movida automaticamente para "Concluido".

Criterios de aceite:
- Bot monitora reacoes em mensagens de notificacao de status
- Reacao configuravel (default: checkmark = mover para proxima coluna)
- Feedback no Slack: "Tarefa 'X' movida para Concluido por @felipe"
- Apenas membros do board podem mover tarefas via Slack

**US-4.4: Substituir polling por Supabase Realtime**
> Como **Dev Andrey**, eu quero que mudancas feitas por outros membros do time aparecam instantaneamente no meu board para que eu nao precise ficar recarregando a pagina.

Criterios de aceite:
- Supabase Realtime subscription ativa para a tabela `tasks` filtrada por `board_id`
- Eventos INSERT, UPDATE e DELETE refletidos na UI em tempo real (~50ms)
- Reconexao automatica em caso de perda de conexao
- Indicador visual de status da conexao (conectado/reconectando)
- Polling de 5s removido completamente

---

### Epico 5: Autenticacao

**Objetivo:** Implementar sistema de login/signup para controlar acesso ao board e identificar usuarios.

**Prioridade:** COULD HAVE (Sprint 3)

**Contexto:** Atualmente qualquer pessoa com a URL acessa o board. Para integracao Slack funcional e atribuicao de tarefas real, e necessario saber quem e o usuario. Supabase Auth foi escolhido (ADR-001) com possibilidade de Slack OAuth.

#### User Stories

**US-5.1: Login com email e senha**
> Como **Estagiario Lucas**, eu quero fazer login com meu email corporativo para que o board saiba quem eu sou e me mostre minhas tarefas.

Criterios de aceite:
- Pagina de login com campos email + senha
- Autenticacao via Supabase Auth
- Apos login, redirect para o board principal
- Session persistida via cookie (nao precisa logar novamente ao recarregar)
- Mensagens de erro em PT-BR

**US-5.2: Signup para novos membros**
> Como **PM Camila**, eu quero convidar novos membros do time para que eles possam acessar o board com suas proprias contas.

Criterios de aceite:
- Pagina de signup com nome, email e senha
- Email de confirmacao enviado (Supabase Auth default)
- Novo usuario adicionado como membro do workspace
- Convite por link ou por email

**US-5.3: Protecao de rotas**
> Como **Lead Felipe**, eu quero que apenas membros autenticados acessem o board para que pessoas externas nao vejam nossas tarefas.

Criterios de aceite:
- Middleware Next.js verifica autenticacao em todas as rotas do dashboard
- Usuarios nao autenticados sao redirecionados para /login
- API routes protegidas com JWT do Supabase
- Session expira apos periodo configuravel (default: 7 dias)

**US-5.4: Perfil do usuario**
> Como **Dev Andrey**, eu quero ter um perfil com meu nome e avatar para que os outros membros me identifiquem nos cards.

Criterios de aceite:
- Tabela `profiles` no Supabase vinculada ao auth.users
- Campos: display_name, avatar_url, slack_user_id
- Avatar exibido nos cards atribuidos ao usuario
- Nome exibido no header do board (membros do time)

---

## 5. Technical Constraints

Baseado nas decisoes arquiteturais da Aria (Architecture Review, v1.0), as seguintes constraints tecnicas devem ser respeitadas em toda a implementacao:

### Stack Obrigatoria

| Camada | Tecnologia | Referencia |
|--------|-----------|------------|
| **Framework** | Next.js 16 (App Router) | Mantido (ja existe) |
| **UI** | React 19 com React Compiler | Mantido (ja habilitado) |
| **Drag-and-Drop** | @dnd-kit | Mantido (ja funcional) |
| **Backend/DB** | Supabase (PostgreSQL + Auth + Realtime) | ADR-001 |
| **State Management** | Zustand (stores separados por dominio) | ADR-002 |
| **Estilizacao** | CSS Modules + design tokens em globals.css | ADR-003 |
| **Validacao** | Zod (runtime validation) | Architecture Review, 2.2.4 |
| **Testes** | Vitest + Testing Library + Playwright | Architecture Review, 2.2.5 |
| **Icones** | lucide-react | Mantido (ja existe) |

### Decisoes Arquiteturais (ADRs)

| ADR | Decisao | Implicacao para Features |
|-----|---------|--------------------------|
| ADR-001 | Supabase como BaaS | Todas as operacoes CRUD via Supabase client SDK |
| ADR-002 | Zustand para state management | Estado extraido de page.js para stores dedicados |
| ADR-003 | CSS Modules | Migracao progressiva do kanban.css monolitico |
| ADR-004 | Float position para cards | Posicao de tasks usa FLOAT, nao INTEGER sequencial |
| ADR-005 | Supabase Realtime substitui polling | setInterval de 5s removido; WebSocket via Supabase |
| ADR-006 | Verificacao de assinatura Slack | Webhook valida X-Slack-Signature via HMAC-SHA256 |
| ADR-007 | Estrutura feature-based | Componentes em ui/ e kanban/, logica em hooks/ e stores/ |
| ADR-008 | board_id denormalizado em tasks | Campo board_id presente tanto em columns quanto em tasks |
| ADR-009 | Manter JavaScript (sem TS) | JSDoc para tipos; Zod para validacao runtime; TS planejado para Phase 2 |

### Modelo de Dados (Resumo)

Entidades principais para o MVP (Sprint 1):

- **boards** -- id, title, description, created_at
- **columns** -- id, board_id, title, position, color, wip_limit, is_done_column
- **tasks** -- id, column_id, board_id, title, description, type, priority, position (FLOAT), assignee_id, created_by, due_date, created_at, updated_at
- **labels** -- id, board_id, name, color
- **task_labels** -- task_id, label_id

Entidades para sprints posteriores (Auth / Multi-user):
- **users** (profiles) -- id, email, display_name, avatar_url, slack_user_id
- **workspace_members**, **board_members**, **task_comments**

### Restricoes Nao-Funcionais

| Requisito | Especificacao |
|-----------|--------------|
| **Idioma da UI** | Portugues Brasileiro (PT-BR) -- labels, mensagens, placeholders |
| **Performance** | Board carrega em <2s (LCP); interacoes DnD em <100ms |
| **Responsividade** | Desktop (>1024px) como prioridade; tablet e mobile funcional |
| **Acessibilidade** | ARIA labels em todos os elementos interativos; navegacao por teclado |
| **Browser Support** | Chrome, Firefox, Safari, Edge (ultimas 2 versoes) |
| **Data Integrity** | Optimistic updates com rollback em caso de falha de persistencia |

---

## 6. Escopo do Sprint 1 (MVP)

### Principio: O Minimo Viavel para Uso Real

O Sprint 1 entrega **exatamente** o necessario para que o time da O2 Inc comece a usar o board como ferramenta de trabalho diaria. Nada mais, nada menos.

### O Que Entra no Sprint 1

| # | Feature | Epico | Prioridade | Esforco Estimado |
|---|---------|-------|-----------|-----------------|
| 1 | **Setup Supabase + Schema + Migrations** | Epico 2 | MUST | 4-6h |
| 2 | **Zustand stores (task, board, ui)** | Epico 2 | MUST | 6-8h |
| 3 | **Botao "Adicionar Tarefa" em cada coluna** | Epico 1 | MUST | 3-4h |
| 4 | **Modal de criacao de tarefa** | Epico 1 | MUST | 6-8h |
| 5 | **Modal de detalhes/edicao de tarefa** | Epico 1 | MUST | 8-10h |
| 6 | **Delete de tarefa com confirmacao** | Epico 1 | MUST | 2-3h |
| 7 | **Atribuir responsavel (dropdown)** | Epico 1 | MUST | 4-5h |
| 8 | **Persistencia de CRUD no Supabase** | Epico 2 | MUST | 6-8h |
| 9 | **Drag-and-drop persiste posicao** | Epico 2 | MUST | 4-6h |
| 10 | **Colapsar sidebar funcional** | Epico 3 | MUST | 2-3h |
| 11 | **Colapsar colunas funcional** | Epico 3 | MUST | 3-4h |
| 12 | **Remover/corrigir botoes sem funcionalidade** | Epico 3 | MUST | 2-3h |
| 13 | **Migracao CSS Modules (componentes principais)** | Tecnico | SHOULD | 4-6h |
| 14 | **Seed data com colunas padrao** | Epico 2 | MUST | 1-2h |
| | **TOTAL ESTIMADO** | | | **50-72h** |

### Criterio de Saida do Sprint 1

O Sprint 1 esta **completo** quando:

1. Um usuario pode abrir o board e ver tarefas carregadas do Supabase
2. Um usuario pode criar uma nova tarefa via botao "+" na coluna
3. Um usuario pode clicar em um card, ver detalhes e editar campos
4. Um usuario pode deletar uma tarefa com confirmacao
5. Um usuario pode arrastar um card entre colunas e a posicao persiste no banco
6. O botao de colapsar sidebar funciona
7. O botao de colapsar coluna funciona
8. Nenhum botao visivel na interface e "morto" (sem funcionalidade)
9. Ao recarregar a pagina, todos os dados estao intactos

### O Que NAO Entra no Sprint 1

- Filtros e busca (Sprint 2)
- Integracao Slack real (Sprint 3)
- Autenticacao (Sprint 3)
- Supabase Realtime / WebSocket (Sprint 2)
- Comentarios em tarefas (Sprint 2+)
- Metricas / dashboard (Sprint 3+)
- Testes E2E (Sprint 2, mas smoke tests manuais no Sprint 1)

---

## 7. Timeline & Milestones

### Visao Geral (4 Sprints)

```
Sprint 1: "Foundation"          Sprint 2: "Usability"
[CRUD + Persistencia + UI Fix]  [Filtros + Busca + Realtime + Polish]
          |                                |
          v                                v
Sprint 3: "Integration"         Sprint 4: "Polish"
[Slack Real + Auth + Metricas]  [Atalhos + Theme + Subtarefas + Perf]
```

### Sprint 1 -- "Foundation" (Atual)

**Objetivo:** Tornar o produto minimamente viavel para uso interno.

| Semana | Entrega | Dependencias |
|--------|---------|-------------|
| Semana 1 | Setup Supabase (projeto, schema, migrations, seed) + Zustand stores + reestruturacao de pastas | Nenhuma |
| Semana 1 | Migracao CSS Modules dos componentes principais | Nenhuma |
| Semana 2 | CRUD completo: criar, visualizar (modal), editar, deletar tarefas | Supabase + Zustand prontos |
| Semana 2 | Persistencia de DnD no Supabase | Supabase pronto |
| Semana 3 | Botoes funcionais (colapsar sidebar, colapsar colunas, remover botoes mortos) | Zustand (useUIStore) |
| Semana 3 | Atribuicao de responsavel (dropdown de membros) | Supabase users |
| Semana 3 | QA, bug fixes, smoke tests manuais | Tudo acima |

**Milestone:** Board funcional com CRUD e persistencia -- time comeca a usar para tarefas reais.

### Sprint 2 -- "Usability"

**Objetivo:** Tornar o produto produtivo para o dia-a-dia com filtros, busca e realtime.

| Entrega | Prioridade |
|---------|-----------|
| Filtro por tipo, prioridade e responsavel | SHOULD HAVE |
| Busca textual de tarefas | SHOULD HAVE |
| Supabase Realtime (substituir polling) | SHOULD HAVE |
| Due date funcional | SHOULD HAVE |
| Toast notifications (feedback de acoes) | SHOULD HAVE |
| Comentarios em tarefas (basico) | COULD HAVE |
| Smoke tests automatizados (Vitest) | SHOULD HAVE |

**Milestone:** Board produtivo com filtros, busca e atualizacao em tempo real.

### Sprint 3 -- "Integration"

**Objetivo:** Diferencial competitivo -- integracao Slack real e autenticacao.

| Entrega | Prioridade |
|---------|-----------|
| Autenticacao Supabase Auth (email/senha) | COULD HAVE |
| Protecao de rotas (middleware Next.js) | COULD HAVE |
| Slash command Slack `/o2kanban` | SHOULD HAVE |
| Notificacao Slack em mudanca de coluna | SHOULD HAVE |
| Verificacao X-Slack-Signature | SHOULD HAVE |
| Metricas basicas (WIP count, throughput) | COULD HAVE |

**Milestone:** Integracao Slack bidirecional funcional + acesso protegido.

### Sprint 4 -- "Polish"

**Objetivo:** Refinamento, performance e qualidade.

| Entrega | Prioridade |
|---------|-----------|
| Atalhos de teclado (keyboard shortcuts) | COULD HAVE |
| Dark/Light mode toggle | COULD HAVE |
| Subtarefas / checklist | COULD HAVE |
| Performance optimization (bundle, lazy loading) | COULD HAVE |
| Mobile UX enhancement | COULD HAVE |
| Testes E2E com Playwright | SHOULD HAVE |
| Documentacao tecnica | COULD HAVE |

**Milestone:** Produto polido, testado e otimizado para uso diario.

---

## 8. Risks & Mitigations

| # | Risco | Probabilidade | Impacto | Mitigacao |
|---|-------|:------------:|:-------:|-----------|
| R1 | **Scope creep durante implementacao** -- features adicionais surgem durante o desenvolvimento | Alta | Medio | MoSCoW rigoroso neste PRD. Qualquer feature nova vai para backlog e e avaliada no proximo sprint. Timeboxing estrito. |
| R2 | **Supabase free tier atinge limites** -- 500MB de DB ou 50K MAUs | Baixa | Medio | Time de ~10 pessoas esta muito longe dos limites. Monitorar uso mensal. Plano Pro ($25/mes) como fallback. |
| R3 | **Migracao de CSS quebra a UI existente** -- CSS Modules podem introduzir regressoes visuais | Media | Medio | Migrar 1 componente por vez. Comparacao visual antes/depois. Manter kanban.css como referencia ate migracao completa. |
| R4 | **Complexidade do DnD com persistencia** -- optimistic updates podem dessincronizar com o banco | Media | Alto | Implementar rollback robusto em caso de falha. Debounce em saves de posicao. Testes manuais intensivos de drag-and-drop. |
| R5 | **Slack App requer aprovacao do workspace admin** -- processo burocratico pode atrasar Sprint 3 | Media | Alto | Iniciar processo de aprovacao da Slack App no Sprint 1, em paralelo com desenvolvimento. Nao bloquear Sprint 1-2. |
| R6 | **Falta de testes automatizados** -- regressoes silenciosas em refatoracoes | Alta | Alto | Smoke tests manuais no Sprint 1. Vitest + Testing Library no Sprint 2. Playwright E2E no Sprint 4. |
| R7 | **Dependencia de desenvolvedor unico** -- bus factor = 1 | Media | Alto | Documentar decisoes em ADRs (ja iniciado). Code review em todas as PRs. PRD e Architecture Review como fonte de verdade. |
| R8 | **Polling agressivo de 5s impacta performance** -- ate ser substituido no Sprint 2 | Media | Baixo | Aumentar intervalo para 15-30s no Sprint 1. Substituir completamente por Supabase Realtime no Sprint 2. |
| R9 | **Modelo de dados precisa de ajustes apos uso real** -- schema inicial pode nao cobrir todos os casos | Media | Medio | Supabase migrations versionadas permitem evolucao incremental do schema. Nao over-engineer o modelo inicial -- comecar simples. |
| R10 | **Realtime connections limit (200 no free tier)** -- pode atingir em escala | Baixa | Alto | Time atual e ~10 pessoas. Limite e por conexao simultanea, nao por usuario. Fallback para polling se necessario. |

---

## 9. Criterios de Aceite Gerais

Estes criterios aplicam-se a **todas** as features de **todos** os sprints. Uma feature so e considerada "Pronta" (Definition of Done) quando atende a todos os criterios abaixo.

### Funcionalidade
- [ ] A feature funciona conforme descrito nos criterios de aceite da user story
- [ ] A feature funciona em Chrome, Firefox e Safari (ultimas 2 versoes)
- [ ] Dados sao persistidos corretamente no Supabase (quando aplicavel)
- [ ] Nenhum erro no console do navegador (warnings aceitaveis temporariamente)

### Interface
- [ ] Todos os textos da UI estao em Portugues Brasileiro (PT-BR)
- [ ] A feature e responsiva em desktop (>1024px) e nao quebra em tablet (768-1024px)
- [ ] Design segue os tokens existentes (cores, espacamentos, tipografia de globals.css)
- [ ] Feedback visual para acoes do usuario (loading states, success/error feedback)
- [ ] Nenhum botao ou elemento visual e "morto" (sem funcionalidade)

### Acessibilidade
- [ ] Elementos interativos tem `aria-label` ou `aria-labelledby` descritivo
- [ ] Navegacao por teclado funcional (Tab, Enter, Escape)
- [ ] Focus visible em todos os elementos focaveis
- [ ] Contraste de cores adequado (WCAG AA no minimo)

### Codigo
- [ ] Componentes seguem a estrutura de pastas definida pela Aria (components/ui/, components/kanban/)
- [ ] Estado gerenciado via Zustand stores (nao useState solto em page.js)
- [ ] CSS em CSS Modules (novos componentes) ou globals.css (tokens)
- [ ] Sem dados hardcoded -- tudo vem do Supabase ou de constantes em lib/constants.js
- [ ] Validacao de inputs com Zod onde aplicavel

### Performance
- [ ] Nenhuma operacao bloqueia a UI por mais de 200ms
- [ ] Optimistic updates para operacoes de escrita (o usuario nao espera o server)
- [ ] Nenhum memory leak (cleanup de subscriptions, intervals, event listeners)

---

## 10. Out of Scope

As seguintes features e capacidades **NAO** serao implementadas neste ciclo de 4 sprints. Elas estao documentadas para referencia futura.

### Funcionalidades Excluidas

| Feature | Motivo da Exclusao | Quando Reconsiderar |
|---------|-------------------|---------------------|
| **App mobile nativo (iOS/Android)** | Web responsivo e suficiente para ~10 usuarios | Se adocao ultrapassar 50 usuarios ou se uso mobile >30% |
| **Integracao GitHub / CI-CD** | Complexidade alta, valor marginal para fluxo atual | Quando o time tiver pipeline de CI/CD maduro |
| **IA para sugestao de prioridades** | Inovador mas prematuro; base de dados ainda nao existe | Apos 3+ meses de dados historicos no board |
| **Multi-board / multi-workspace** | Escopo de Sprint 1 e um unico board; expandir gradualmente | Sprint 4+ se houver demanda |
| **Exportacao de relatorios (PDF/CSV)** | Nice-to-have; PM pode usar screenshots ou queries Supabase | Quando metricas estiverem implementadas |
| **API publica** | Ferramenta interna; API e para consumo proprio | Se surgir necessidade de integracao externa |
| **Migracao para TypeScript** | Adicionaria escopo significativo; JSDoc + Zod cobrem necessidades imediatas | Phase 2 (pos-Sprint 4) |
| **Multi-idioma (i18n)** | 90% dos usuarios sao brasileiros; PT-BR e suficiente | Se O2 Inc expandir internacionalmente |
| **Offline mode / PWA** | Time trabalha online; Supabase requer conexao | Se houver demanda para uso em ambientes sem internet |
| **Automacoes / regras de negocio** | Complexidade alta; foco em funcionalidades basicas primeiro | Sprint 5+ com base em padroes de uso |
| **Kanban analytics avancados** | CFD, lead time, cycle time requerem historico de dados | Apos Sprint 3 (metricas basicas primeiro) |
| **Permissoes granulares (RBAC)** | Time pequeno (~10 pessoas); admin/member e suficiente | Se time crescer >25 pessoas |

### Decisoes Tecnicas Fora do Escopo

- **Migracao para monorepo** -- desnecessario para projeto single-app
- **Docker/containerizacao** -- Vercel + Supabase cloud e suficiente
- **Feature flags** -- escala nao justifica complexidade
- **Logging/APM avancado** -- console.log + Supabase dashboard e suficiente inicialmente
- **CDN custom** -- Vercel CDN integrado e suficiente

---

## Apendice A: Glossario

| Termo | Definicao |
|-------|-----------|
| **Board** | Quadro Kanban com colunas e tarefas |
| **Coluna** | Estagio do workflow (ex: A Fazer, Em Progresso, Concluido) |
| **Card / Task** | Unidade de trabalho representada visualmente no board |
| **DnD** | Drag-and-drop -- arrastar e soltar cards entre colunas |
| **Optimistic Update** | Atualizar a UI imediatamente antes da confirmacao do servidor |
| **WIP** | Work In Progress -- tarefas em andamento simultaneamente |
| **RLS** | Row Level Security -- seguranca a nivel de linha no PostgreSQL |
| **BaaS** | Backend-as-a-Service (ex: Supabase, Firebase) |
| **ADR** | Architecture Decision Record -- registro de decisao arquitetural |
| **MoSCoW** | Must/Should/Could/Won't -- framework de priorizacao |

## Apendice B: Rastreabilidade Atlas -> PRD

Mapeamento entre as acoes prioritarias do Atlas e os epicos/stories deste PRD:

| Acao Atlas | Epico PRD | User Stories |
|-----------|-----------|-------------|
| Acao 1: CRUD Completo de Tarefas | Epico 1 | US-1.1 a US-1.5 |
| Acao 2: Persistencia de Dados | Epico 2 | US-2.1 a US-2.4 |
| Acao 3: Corrigir Elementos Visuais Quebrados | Epico 3 | US-3.1, US-3.2 |
| Acao 4: Busca e Filtros Basicos | Epico 3 | US-3.3 a US-3.5 |
| Acao 5: Integracao Slack Bidirecional | Epico 4 | US-4.1 a US-4.4 |

## Apendice C: Rastreabilidade Aria -> PRD

Mapeamento entre as ADRs da Aria e as constraints tecnicas deste PRD:

| ADR Aria | Impacto no PRD |
|----------|---------------|
| ADR-001: Supabase | Epico 2 inteiro; constraint de stack; modelo de dados |
| ADR-002: Zustand | US-2.4; decomposicao do god component |
| ADR-003: CSS Modules | Item 13 do Sprint 1; migracao progressiva |
| ADR-004: Float Position | US-2.2; posicionamento de cards |
| ADR-005: Realtime | US-4.4; substituicao de polling no Sprint 2 |
| ADR-006: Slack Signature | US-4.1; seguranca do webhook |
| ADR-007: Feature-based | Criterios de aceite gerais (codigo) |
| ADR-008: board_id denormalized | Schema da tabela tasks |
| ADR-009: Manter JavaScript | Out of scope (TS para Phase 2) |

---

> **Documento preparado por Morgan (Product Manager Agent)**
> **Baseado nos assessments de Atlas (Business Analyst) e Aria (System Architect)**
> **Para uso interno da O2 Inc -- Fevereiro 2026**
