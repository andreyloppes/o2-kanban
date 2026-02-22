# O2 Kanban -- User Stories do Sprint 2

> **Documento:** Stories Sprint 2 -- Detalhamento para Implementacao
> **Projeto:** O2 Kanban -- Sprint 2 "Usability"
> **Fase:** Phase 3b -- Story Creation
> **Data:** 20 de Fevereiro de 2026
> **Autor:** River (Scrum Master Agent)
> **Versao:** 1.0
> **Baseado em:** PRD (Morgan, v1.0) + Architecture Sprint 2 (Aria, v1.0) + Frontend Spec Sprint 2 (Uma, v1.0) + Stories Sprint 1 (River, v1.0)

---

## Decisoes Incorporadas

Antes de iniciar as stories, estas decisoes foram incorporadas:

1. **Supabase Realtime DIFERIDO**: nao entra no Sprint 2 por decisao do usuario. Sem conexoes de API externas por enquanto.
2. **Filtragem client-side**: dataset pequeno (~50-100 tasks ja em memoria via `hydrate()`). Sem round-trips ao servidor para filtrar.
3. **Busca textual client-side**: `String.toLowerCase().includes()` em titulo e descricao. Full-text search no Postgres reservado para >500 tasks.
4. **Comentarios sem threading**: MVP de comentarios planos (flat). Threading adicionaria complexidade sem beneficio para ~10 usuarios.
5. **Lazy-loading de comentarios**: comentarios so sao carregados quando o TaskModal abre. Nao inflam o payload do `hydrate()`.
6. **Autor de comentario via dropdown**: sem auth no Sprint 2, o `author` e selecionado via dropdown dos `TEAM_MEMBERS` existentes em `lib/constants.js`.
7. **Vitest (nao Jest)**: mais rapido, ESM nativo, configuracao minima. Alinhado com ecossistema moderno.
8. **Filtros aditivos (AND)**: tipo + prioridade + responsavel + busca combinam entre si. So aparecem tasks que satisfazem TODOS os filtros ativos.
9. **Numeracao de epicos**: continua a partir do Sprint 1 (que terminou no Epico 3). Sprint 2 comeca no Epico 4.

---

## Indice de Stories

| Epico | Story | Titulo | Estimativa |
|-------|-------|--------|:----------:|
| 4 | 4.1 | Filter state management (useUIStore + useBoardStore) | M |
| 4 | 4.2 | SearchBar component (input com debounce e Ctrl+K) | P |
| 4 | 4.3 | FilterDropdown components (tipo, prioridade, responsavel) | M |
| 4 | 4.4 | FilterBar organism (container no Board header) | M |
| 4 | 4.5 | Column integration (contagem filtrada, visibilidade de cards) | P |
| 5 | 5.1 | DateInput component + date utility functions | M |
| 5 | 5.2 | DueDateBadge component (indicadores visuais de vencimento) | P |
| 5 | 5.3 | Card + TaskModal + TaskForm integration (exibir/editar due_date) | M |
| 6 | 6.1 | Schema + API routes para comentarios | M |
| 6 | 6.2 | CommentItem + CommentInput components | M |
| 6 | 6.3 | CommentSection no TaskModal (lazy load, optimistic add, scroll) | M |
| 7 | 7.1 | Vitest setup (config, scripts, primeiro teste) | P |
| 7 | 7.2 | Unit tests para validators e date utilities | P |
| 7 | 7.3 | Store tests (useBoardStore, useUIStore) | M |
| 7 | 7.4 | Component tests (Card, FilterBar, Badge) | M |

**Total: 15 stories | Estimativa: 4P + 11M**

---

## Epico 4: Filtros e Busca

---

# Story 4.1: Filter state management (useUIStore + useBoardStore)

## Status: Draft

## Descricao
Como **PM Camila**, eu quero que o sistema de filtros tenha um estado gerenciado para que, ao selecionar filtros de tipo, prioridade ou responsavel, as colunas exibam apenas as tasks correspondentes sem necessidade de recarregar a pagina.

## Contexto Tecnico
- Arquivos a modificar:
  - `src/stores/useUIStore.js` -- adicionar state `filters` (type, priority, assignee, search), actions `setFilter`, `clearFilters`, getter `hasActiveFilters`
  - `src/stores/useBoardStore.js` -- adicionar getter `getFilteredTasksByColumn(columnId)` que le filtros do `useUIStore` e aplica filtragem AND
- Dependencias: nenhuma (primeira story do Sprint 2, stores ja existem do Sprint 1)
- Stack: zustand ^5.x

## Criterios de Aceite
- [ ] Given que `useUIStore` foi atualizado, when eu acesso `useUIStore.getState().filters`, then recebo o objeto `{ type: null, priority: null, assignee: null, search: '' }` como estado inicial
- [ ] Given que eu chamo `setFilter('type', 'bug')`, when eu acesso `filters.type`, then o valor e `'bug'` e os demais filtros (priority, assignee, search) permanecem inalterados
- [ ] Given que eu chamo `setFilter('priority', 'urgent')` apos `setFilter('type', 'bug')`, when eu acesso `filters`, then tanto `type` quanto `priority` estao setados (filtros sao independentes)
- [ ] Given que filtros estao ativos, when eu chamo `clearFilters()`, then todos os filtros voltam ao estado inicial (`{ type: null, priority: null, assignee: null, search: '' }`)
- [ ] Given que nenhum filtro esta ativo, when eu chamo `hasActiveFilters()`, then retorna `false`
- [ ] Given que pelo menos um filtro esta ativo (ex: `type: 'bug'`), when eu chamo `hasActiveFilters()`, then retorna `true`
- [ ] Given que `useBoardStore` tem 5 tasks na coluna "A Fazer" (2 bugs, 3 tasks), when eu chamo `getFilteredTasksByColumn(columnId)` com `filters.type = 'bug'`, then retorna apenas as 2 tasks do tipo bug, ordenadas por position
- [ ] Given que filtros de tipo e prioridade estao ativos simultaneamente, when eu chamo `getFilteredTasksByColumn(columnId)`, then retorna apenas tasks que satisfazem AMBOS os filtros (AND)
- [ ] Given que `filters.search = 'login'`, when eu chamo `getFilteredTasksByColumn(columnId)`, then retorna tasks cujo titulo OU descricao contem "login" (case-insensitive)
- [ ] Given que `filters.assignee = 'andrey'`, when eu chamo `getFilteredTasksByColumn(columnId)`, then retorna apenas tasks com `assignee === 'andrey'`
- [ ] Given que nenhum filtro esta ativo, when eu chamo `getFilteredTasksByColumn(columnId)`, then o comportamento e identico ao `getTasksByColumn(columnId)` existente (retorna todas as tasks da coluna)

## Notas Tecnicas
- **State de filtros no useUIStore**: filtros sao estado de UI (nao persistem no servidor). O filtro determina o que o usuario ve, nao o que existe. Ver architecture-sprint2.md, secao 4.1.
- **`getFilteredTasksByColumn`**: e uma funcao de projecao sobre dados existentes. Le `useUIStore.getState().filters` diretamente. Isso cria um acoplamento pontual entre stores, mas e aceitavel porque e somente leitura. Ver architecture-sprint2.md, secao 4.2.
- **Composicao de filtros**: filtros sao aditivos (AND). Cada filtro nao-nulo reduz o conjunto de tasks. A busca textual tambem compoe com os demais. Ver architecture-sprint2.md, secao 5.3.
- **Manter `getTasksByColumn` existente**: nao remover o getter original. Ele sera usado internamente e o `getFilteredTasksByColumn` sera usado pelo Column no render.

## Estimativa
M -- Modificacao de 2 stores existentes com logica de filtragem. Requer cuidado com acoplamento entre stores e com a composicao AND dos filtros.

## Definition of Done
- [ ] Codigo implementado
- [ ] Sem erros de lint
- [ ] Build passando
- [ ] Criterios de aceite verificados manualmente (via console ou testes)
- [ ] `getTasksByColumn` original continua funcionando (sem regressao)

---

# Story 4.2: SearchBar component (input com debounce e Ctrl+K)

## Status: Draft

## Descricao
Como **Estagiario Lucas**, eu quero um campo de busca no header do board com feedback em tempo real para que eu encontre rapidamente a tarefa que me foi atribuida sem navegar por todas as colunas.

## Contexto Tecnico
- Arquivos a criar:
  - `src/components/ui/SearchBar.js` + `SearchBar.module.css`
  - `src/hooks/useDebounce.js` -- hook generico de debounce para reuso
- Arquivos a modificar:
  - `src/app/globals.css` -- adicionar design tokens de search (secao 1.4 da frontend-spec-sprint2.md)
- Dependencias: Story 4.1 (useUIStore com `setFilter('search', ...)`)
- Stack: React 19, CSS Modules, lucide-react (Search, X)

## Criterios de Aceite
- [ ] Given que o SearchBar e renderizado, when o usuario ve o campo, then exibe um icone de lupa (Search) a esquerda, placeholder "Buscar tarefas..." e uma hint de atalho "Ctrl+K" a direita
- [ ] Given que o usuario esta em um Mac, when o SearchBar renderiza, then a hint exibe "Cmd+K" em vez de "Ctrl+K"
- [ ] Given que o usuario digita "login" no campo, when 300ms passam sem nova digitacao (debounce), then `useUIStore.setFilter('search', 'login')` e chamado
- [ ] Given que o usuario esta digitando rapido, when cada letra e pressionada em menos de 300ms, then o `setFilter` NAO e chamado a cada keystroke (debounce funciona)
- [ ] Given que o campo tem texto digitado, when o usuario olha para o campo, then a hint "Ctrl+K" desaparece e um botao X (clear) aparece a direita
- [ ] Given que o usuario clica no botao X, when o click e processado, then o campo de busca e limpo e `setFilter('search', '')` e chamado
- [ ] Given que o usuario esta em qualquer lugar da pagina, when ele pressiona Ctrl+K (ou Cmd+K no Mac), then o campo de busca recebe foco automaticamente
- [ ] Given que o campo de busca recebe foco, when a animacao e executada, then a largura do campo expande suavemente de 280px para 360px
- [ ] Given que o campo perde foco e esta vazio, when a animacao e executada, then a largura volta para 280px
- [ ] Given que o hook `useDebounce` e criado, when importado de `@/hooks/useDebounce`, then funciona como hook generico `useDebounce(value, delay)` retornando o valor debounced

## Notas Tecnicas
- **useDebounce hook**: extrair como hook generico em `src/hooks/useDebounce.js`. Recebe `(value, delay)` e retorna o valor debounced. Ver architecture-sprint2.md, secao 5.4.
- **Deteccao de plataforma**: usar `navigator.platform` ou `navigator.userAgentData` para detectar Mac e exibir "Cmd" em vez de "Ctrl".
- **Design tokens**: `--search-bg`, `--search-bg-focus`, `--search-icon`, `--search-icon-focus`, `--search-shortcut-bg`, `--search-shortcut-text`, `--search-shortcut-border`, `--search-width` (280px), `--search-width-focus` (360px). Ver frontend-spec-sprint2.md, secao 1.4.
- **Estilos**: ver frontend-spec-sprint2.md, secao 2.2.1 para CSS completo do SearchBar.
- **Acessibilidade**: `role="search"`, `aria-label="Buscar tarefas"` no container. Input com `aria-label="Campo de busca"`.

## Estimativa
P -- Componente de UI com logica simples (debounce + atalho teclado). Hook useDebounce e reutilizavel.

## Definition of Done
- [ ] Codigo implementado
- [ ] Sem erros de lint
- [ ] Build passando
- [ ] Criterios de aceite verificados manualmente
- [ ] Debounce de 300ms funciona corretamente
- [ ] Atalho Ctrl+K / Cmd+K funciona
- [ ] Todos os textos em PT-BR

---

# Story 4.3: FilterDropdown components (tipo, prioridade, responsavel)

## Status: Draft

## Descricao
Como **PM Camila**, eu quero dropdowns de filtro para tipo, prioridade e responsavel para que eu possa selecionar rapidamente quais categorias de tarefas visualizar durante a daily.

## Contexto Tecnico
- Arquivos a criar:
  - `src/components/ui/FilterDropdown.js` + `FilterDropdown.module.css`
  - `src/components/ui/FilterChip.js` + `FilterChip.module.css`
- Arquivos a modificar:
  - `src/app/globals.css` -- adicionar design tokens de filter (secao 1.1 da frontend-spec-sprint2.md)
- Dependencias: Story 4.1 (useUIStore com setFilter, filters)
- Stack: React 19, CSS Modules, lucide-react (ChevronDown, Check, X)

## Criterios de Aceite
- [ ] Given que o FilterDropdown e renderizado com label "Tipo", when o usuario ve o componente, then exibe um botao trigger com o texto "Tipo" e um chevron para baixo
- [ ] Given que o usuario clica no trigger "Tipo", when o dropdown abre, then exibe a lista de opcoes: Tarefa, User Story, Bug, Epico, Spike (labels PT-BR de `TASK_TYPES`)
- [ ] Given que o dropdown esta aberto, when o usuario clica em "Bug", then a opcao e selecionada (checkbox marcado), `setFilter('type', 'bug')` e chamado e um badge numerico "1" aparece no trigger
- [ ] Given que "Bug" esta selecionado, when o usuario clica em "Bug" novamente, then a opcao e desmarcada e `setFilter('type', null)` e chamado (toggle)
- [ ] Given que o dropdown de prioridade e renderizado, when o usuario abre e ve as opcoes, then exibe: Baixa, Media, Alta, Urgente (labels PT-BR de `TASK_PRIORITIES`)
- [ ] Given que o dropdown de responsavel e renderizado, when o usuario abre e ve as opcoes, then exibe a lista de `TEAM_MEMBERS` (Andrey, Felipe, Caio, Matheus) + opcao "Sem responsavel"
- [ ] Given que o usuario selecionou "Sem responsavel", when o filtro e aplicado, then apenas tasks com `assignee === null` sao exibidas
- [ ] Given que opcoes estao selecionadas, when o usuario ve o rodape do dropdown, then um botao "Limpar selecao" esta visivel
- [ ] Given que o usuario clica em "Limpar selecao", when o click e processado, then todas as opcoes sao desmarcadas e o filtro correspondente volta a `null`
- [ ] Given que o dropdown esta aberto, when o usuario clica fora do dropdown, then o dropdown fecha
- [ ] Given que o dropdown esta aberto, when o usuario pressiona Escape, then o dropdown fecha
- [ ] Given que um FilterChip e renderizado com label "Bug" e category "Tipo", when o usuario ve o chip, then exibe "Tipo: Bug" com um botao X para remover
- [ ] Given que o usuario clica no X do FilterChip, when o click e processado, then `onRemove` e chamado para remover o filtro

## Notas Tecnicas
- **FilterDropdown**: componente generico com props `label`, `icon`, `options`, `selected`, `onChange`, `multiple`. Ver frontend-spec-sprint2.md, secao 2.2.2 para design completo.
- **Single select para Sprint 2**: embora o componente suporte `multiple`, no Sprint 2 cada filtro (tipo, prioridade, responsavel) aceita apenas UM valor. Isso simplifica a logica de `setFilter` no store.
- **FilterChip**: pill visual para mostrar filtros ativos. Props: `label`, `category`, `onRemove`, `icon`. Ver frontend-spec-sprint2.md, secao 2.1.2.
- **Opcao "Sem responsavel"**: adicionar como opcao especial no dropdown de responsavel com `value: '__unassigned__'`. No filtro, tratar `'__unassigned__'` como filtro por `assignee === null`.
- **z-index**: dropdown usa `--z-filter-dropdown: 950` (abaixo de modal 1000, acima de dropdowns comuns 900).
- **Acessibilidade**: trigger com `aria-expanded`, `aria-haspopup="listbox"`. Opcoes com `role="option"`, `aria-selected`.

## Estimativa
M -- Dois componentes novos (FilterDropdown e FilterChip) com logica de dropdown (abrir/fechar, selecao, click outside) e integracao com store.

## Definition of Done
- [ ] Codigo implementado
- [ ] Sem erros de lint
- [ ] Build passando
- [ ] Criterios de aceite verificados manualmente
- [ ] Dropdown fecha ao clicar fora ou pressionar Escape
- [ ] Todos os textos e labels em PT-BR

---

# Story 4.4: FilterBar organism (container no Board header)

## Status: Draft

## Descricao
Como **PM Camila**, eu quero uma barra de filtros integrada ao header do board contendo busca, dropdowns de filtro e chips de filtros ativos para que eu tenha uma interface unificada para controlar a visualizacao do board.

## Contexto Tecnico
- Arquivos a criar:
  - `src/components/Kanban/FilterBar.js` + `FilterBar.module.css`
- Arquivos a modificar:
  - `src/components/Kanban/Board.js` -- adicionar `<FilterBar />` entre o titulo e o avatar group no header
  - `src/app/globals.css` -- adicionar tokens de layout da FilterBar se necessario (secao 1.5 da frontend-spec-sprint2.md)
- Dependencias: Story 4.1 (state de filtros), Story 4.2 (SearchBar), Story 4.3 (FilterDropdown, FilterChip)
- Stack: React 19, CSS Modules, zustand

## Criterios de Aceite
- [ ] Given que o Board renderiza, when o usuario ve o header, then a FilterBar aparece entre o titulo do board e o avatar group dos membros
- [ ] Given que a FilterBar e renderizada, when o usuario ve os componentes, then contem: SearchBar, FilterDropdown de Tipo, FilterDropdown de Prioridade, FilterDropdown de Responsavel (nessa ordem, da esquerda para direita)
- [ ] Given que o usuario selecionou filtro de tipo "Bug", when a FilterBar atualiza, then um FilterChip "Tipo: Bug" aparece abaixo dos dropdowns
- [ ] Given que o usuario selecionou filtro de tipo "Bug" E prioridade "Urgente", when a FilterBar atualiza, then dois FilterChips aparecem: "Tipo: Bug" e "Prioridade: Urgente"
- [ ] Given que filtros estao ativos, when o usuario ve a FilterBar, then um botao "Limpar filtros" esta visivel ao lado dos FilterChips
- [ ] Given que o usuario clica em "Limpar filtros", when o click e processado, then `clearFilters()` e chamado, todos os FilterChips desaparecem e o botao "Limpar filtros" some
- [ ] Given que nenhum filtro esta ativo, when o usuario ve a FilterBar, then o botao "Limpar filtros" NAO e visivel e nenhum FilterChip aparece
- [ ] Given que o usuario clica no X de um FilterChip especifico, when o click e processado, then apenas aquele filtro e removido (os demais permanecem)
- [ ] Given que a FilterBar esta em uma tela estreita (<1200px), when o layout se adapta, then os elementos quebram para a linha de baixo (flex-wrap) em vez de ficarem comprimidos

## Notas Tecnicas
- **FilterBar como organismo**: compoe SearchBar + FilterDropdowns + FilterChips. Le estado de `useUIStore.filters` para decidir quais chips exibir. Ver architecture-sprint2.md, secao 9.4 para hierarquia.
- **Posicionamento no Board**: a FilterBar vai entre o titulo e o avatar group no header do Board.js. Modificar o Board para aceitar e renderizar o FilterBar. Ver architecture-sprint2.md, secao 9.2.
- **Mapeamento de filtros para chips**: `filters.type` -> chip com label de `TASK_TYPES[filters.type]` e category "Tipo". `filters.priority` -> label de `TASK_PRIORITIES[filters.priority]` e category "Prioridade". `filters.assignee` -> nome do membro de `TEAM_MEMBERS` e category "Responsavel".
- **Botao "Limpar filtros"**: visivel apenas quando `hasActiveFilters()` retorna `true`. Usa estilo ghost/link sutil.
- **Tokens de layout**: `--filter-bar-height: auto`, `--filter-bar-padding: var(--space-3) var(--space-6)`. Ver frontend-spec-sprint2.md, secao 1.5.

## Estimativa
M -- Componente organismo que compoe 3 sub-componentes ja criados. Logica de mapeamento filtros->chips e integracao com Board.js.

## Definition of Done
- [ ] Codigo implementado
- [ ] Sem erros de lint
- [ ] Build passando
- [ ] Criterios de aceite verificados manualmente
- [ ] FilterBar visivel no header do board
- [ ] Chips refletem filtros ativos corretamente
- [ ] Todos os textos em PT-BR

---

# Story 4.5: Column integration (contagem filtrada, visibilidade de cards)

## Status: Draft

## Descricao
Como **PM Camila**, eu quero que as colunas do board exibam apenas as tasks que correspondem aos filtros ativos e mostrem a contagem filtrada vs total para que eu tenha visibilidade clara de quantas tasks estao filtradas em cada estagio.

## Contexto Tecnico
- Arquivos a modificar:
  - `src/components/Kanban/Column.js` -- trocar `getTasksByColumn` por `getFilteredTasksByColumn`; exibir contagem como "N de M" quando filtros ativos
- Dependencias: Story 4.1 (getFilteredTasksByColumn no useBoardStore), Story 4.4 (FilterBar integrada ao Board para usuario poder ativar filtros)
- Stack: React 19, zustand

## Criterios de Aceite
- [ ] Given que o Column.js usa `getFilteredTasksByColumn`, when nenhum filtro esta ativo, then o comportamento e identico ao Sprint 1 (todas as tasks visiveis, contagem normal)
- [ ] Given que o filtro de tipo "Bug" esta ativo, when uma coluna tem 5 tasks (2 bugs, 3 tasks), then a coluna exibe apenas os 2 cards de bug
- [ ] Given que filtros estao ativos, when o usuario ve o header da coluna, then a contagem exibe "2 de 5" (filtrados de total)
- [ ] Given que nenhum filtro esta ativo, when o usuario ve o header da coluna, then a contagem exibe apenas o numero total (ex: "5") sem o "de N"
- [ ] Given que filtros estao ativos e nenhuma task da coluna corresponde, when o usuario ve a coluna, then a coluna mostra "Nenhuma tarefa" (mensagem de coluna vazia)
- [ ] Given que a coluna esta colapsada e filtros estao ativos, when o usuario ve o badge de contagem, then exibe a contagem filtrada (nao o total)
- [ ] Given que o SortableContext da coluna recebe tasks filtradas, when o usuario tenta arrastar cards, then o drag-and-drop funciona normalmente com os cards visiveis (sem regressao)
- [ ] Given que o usuario limpa todos os filtros, when a coluna atualiza, then todas as tasks voltam a ser visiveis e a contagem volta ao formato normal

## Notas Tecnicas
- **Mudanca no Column.js**: a linha `const tasks = useBoardStore((state) => state.getTasksByColumn(column.id))` deve ser trocada por `const tasks = useBoardStore((state) => state.getFilteredTasksByColumn(column.id))`. Ver architecture-sprint2.md, secao 5.6.
- **Contagem total**: para exibir "N de M", o Column precisa tambem do total nao-filtrado. Usar `useBoardStore((state) => state.getTasksByColumn(column.id).length)` para obter o total e comparar com `tasks.length`.
- **Contagem condicional**: exibir "N de M" somente quando `useUIStore.getState().hasActiveFilters()` retorna `true`. Caso contrario, exibir apenas "N".
- **DnD com filtros**: o SortableContext recebe apenas os IDs das tasks filtradas. Cards nao-filtrados nao participam do sorting visual, mas as tasks continuam existindo no store. O drop em coluna continua funcionando normalmente.

## Estimativa
P -- Modificacao pontual do Column.js existente. Trocar getter e ajustar contagem. Baixo risco.

## Definition of Done
- [ ] Codigo implementado
- [ ] Sem erros de lint
- [ ] Build passando
- [ ] Criterios de aceite verificados manualmente
- [ ] DnD funciona sem regressao com filtros ativos
- [ ] Contagem "N de M" aparece corretamente

---

## Epico 5: Due Date Funcional

---

# Story 5.1: DateInput component + date utility functions

## Status: Draft

## Descricao
Como **desenvolvedor**, eu quero ter um componente de input de data estilizado e funcoes utilitarias de classificacao de datas para que os demais componentes do sistema de due date tenham uma base reutilizavel.

## Contexto Tecnico
- Arquivos a criar:
  - `src/components/ui/DateInput.js` + `DateInput.module.css`
  - `src/lib/dateUtils.js` -- funcoes `getDueDateStatus`, `getDueDateLabel`, `formatDueDateShort`
- Arquivos a modificar:
  - `src/app/globals.css` -- adicionar design tokens de due date (secao 1.2 da frontend-spec-sprint2.md)
- Dependencias: nenhuma (infraestrutura, pode rodar em paralelo com Story 4.1)
- Stack: React 19, CSS Modules, lucide-react (Calendar, X)

## Criterios de Aceite
- [ ] Given que o DateInput e renderizado sem valor, when o usuario ve o campo, then exibe um icone de calendario a esquerda e o placeholder "Selecionar data"
- [ ] Given que o usuario clica no DateInput, when o picker nativo do navegador abre, then o usuario pode selecionar uma data usando o date picker do sistema operacional
- [ ] Given que o usuario selecionou uma data (ex: 2026-03-15), when o campo atualiza, then exibe a data formatada "15/03/2026" e o botao X (clear) aparece
- [ ] Given que o campo tem uma data, when o usuario clica no botao X, then a data e limpa e `onChange` e chamado com valor vazio
- [ ] Given que o DateInput recebe `disabled=true`, when o usuario tenta interagir, then o campo esta desabilitado (opacity 0.5, nao clicavel)
- [ ] Given que o DateInput recebe `error=true`, when o campo renderiza, then a borda fica vermelha (`--input-border-error`)
- [ ] Given que `getDueDateStatus` recebe `null`, when a funcao executa, then retorna `null`
- [ ] Given que `getDueDateStatus` recebe uma data no passado (ex: ontem), when a funcao executa, then retorna `'overdue'`
- [ ] Given que `getDueDateStatus` recebe a data de hoje, when a funcao executa, then retorna `'today'`
- [ ] Given que `getDueDateStatus` recebe uma data de 1 a 7 dias no futuro, when a funcao executa, then retorna `'this-week'`
- [ ] Given que `getDueDateStatus` recebe uma data de mais de 7 dias no futuro, when a funcao executa, then retorna `'future'`
- [ ] Given que `getDueDateLabel` recebe `'overdue'`, when a funcao executa, then retorna `'Atrasado'`
- [ ] Given que `getDueDateLabel` recebe `'today'`, when a funcao executa, then retorna `'Vence hoje'`
- [ ] Given que `getDueDateLabel` recebe `'this-week'`, when a funcao executa, then retorna `'Vence esta semana'`
- [ ] Given que `formatDueDateShort` recebe `'2026-02-20'`, when a funcao executa, then retorna `'20 fev'`
- [ ] Given que `formatDueDateShort` recebe `null`, when a funcao executa, then retorna `''` (string vazia)

## Notas Tecnicas
- **DateInput**: usa input nativo `type="date"` com overlay customizado (opacity 0 no input nativo, label visual formatada por cima). Ver frontend-spec-sprint2.md, secao 2.1.1 para implementacao detalhada.
- **dateUtils.js**: funcoes puras sem side effects. Usam `new Date()` para comparacao com hoje. Para testes, usar `vi.useFakeTimers()` / `vi.setSystemTime()`. Ver architecture-sprint2.md, secao 7.2 para implementacao.
- **Formato de data interna**: sempre `YYYY-MM-DD` (formato do input HTML5 e do Supabase DATE). Formatacao para PT-BR e apenas no display.
- **Design tokens de due date**: `--due-overdue-bg`, `--due-overdue-text`, `--due-overdue-border`, `--due-today-*`, `--due-soon-*`, `--due-future-*`. Ver frontend-spec-sprint2.md, secao 1.2.
- **Meses em PT-BR**: array `['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']` usado em `formatDueDateShort`.

## Estimativa
M -- Dois entregaveis (componente + utilitarios) com logica de formatacao e classificacao de datas. Componente de date input com overlay customizado requer cuidado com cross-browser.

## Definition of Done
- [ ] Codigo implementado
- [ ] Sem erros de lint
- [ ] Build passando
- [ ] Criterios de aceite verificados manualmente
- [ ] DateInput funciona em Chrome, Firefox e Safari
- [ ] Funcoes de dateUtils sao puras e testaveis

---

# Story 5.2: DueDateBadge component (indicadores visuais de vencimento)

## Status: Draft

## Descricao
Como **PM Camila**, eu quero ver indicadores visuais coloridos de vencimento nos cards para que eu identifique rapidamente quais tarefas estao atrasadas, vencem hoje ou estao proximas do prazo durante a revisao do board.

## Contexto Tecnico
- Arquivos a criar:
  - `src/components/ui/DueDateBadge.js` + `DueDateBadge.module.css`
- Dependencias: Story 5.1 (dateUtils.js com getDueDateStatus, formatDueDateShort; design tokens de due date em globals.css)
- Stack: React 19, CSS Modules, lucide-react (AlertCircle, Clock, Calendar)

## Criterios de Aceite
- [ ] Given que o DueDateBadge recebe `dueDate=null`, when o componente renderiza, then nao renderiza nada (retorna null)
- [ ] Given que o DueDateBadge recebe uma data no passado, when o componente renderiza, then exibe um badge vermelho com icone `AlertCircle` e texto "Vencido"
- [ ] Given que o DueDateBadge recebe a data de hoje, when o componente renderiza, then exibe um badge laranja com icone `Clock` e texto "Hoje"
- [ ] Given que o DueDateBadge recebe uma data de 1 a 7 dias no futuro, when o componente renderiza, then exibe um badge em cor `--due-soon-text` com icone `Calendar` e a data formatada (ex: "25 fev")
- [ ] Given que o DueDateBadge recebe uma data de mais de 7 dias no futuro, when o componente renderiza, then exibe um badge cinza com icone `Calendar` e a data formatada (ex: "15 mar")
- [ ] Given que o DueDateBadge recebe `size="sm"`, when o componente renderiza, then usa font-size menor (0.6rem) e padding compacto (para uso dentro do Card)
- [ ] Given que o DueDateBadge recebe `size="md"`, when o componente renderiza, then usa font-size padrao (0.65rem) com icone de 14px (para uso no TaskModal)
- [ ] Given que o badge e do tipo "overdue", when o usuario inspeciona o DOM, then o badge tem `aria-label` descritivo (ex: "Vencido ha 3 dias")

## Notas Tecnicas
- **Logica de classificacao**: usar `getDueDateStatus` e `getDueDateLabel` de `dateUtils.js`. Ver architecture-sprint2.md, secao 7.3.
- **Mapeamento visual**: overdue -> vermelho (`--due-overdue-*`), today -> laranja (`--due-today-*`), soon/this-week -> roxo/indigo (`--due-soon-*`), future -> cinza (`--due-future-*`). Ver frontend-spec-sprint2.md, secao 2.1.3.
- **Icones por status**: overdue = `AlertCircle`, today = `Clock`, soon/future = `Calendar` (todos de lucide-react).
- **CSS**: usar classes condicionais por status (`styles.overdue`, `styles.today`, `styles.soon`, `styles.future`). Ver frontend-spec-sprint2.md, secao 2.1.3 para CSS completo.

## Estimativa
P -- Componente visual simples que usa funcoes utilitarias ja criadas na Story 5.1. CSS com variantes por status.

## Definition of Done
- [ ] Codigo implementado
- [ ] Sem erros de lint
- [ ] Build passando
- [ ] Criterios de aceite verificados manualmente
- [ ] Cores corretas para cada status
- [ ] Acessivel (aria-label descritivo)

---

# Story 5.3: Card + TaskModal + TaskForm integration (exibir/editar due_date)

## Status: Draft

## Descricao
Como **Dev Andrey**, eu quero ver a data de vencimento nos cards do board e poder definir/editar essa data ao criar ou editar tarefas para que eu saiba os prazos das minhas tarefas sem precisar abrir cada card.

## Contexto Tecnico
- Arquivos a modificar:
  - `src/components/Kanban/Card.js` -- adicionar `<DueDateBadge dueDate={task.due_date} size="sm" />` no corpo do card, entre tags e footer
  - `src/components/Kanban/TaskModal.js` -- adicionar `<DateInput>` para editar due_date; incluir due_date no dirty check e no handleSave
  - `src/components/Kanban/TaskForm.js` -- adicionar `<DateInput>` para definir due_date na criacao
- Dependencias: Story 5.1 (DateInput, dateUtils), Story 5.2 (DueDateBadge)
- Stack: React 19, zustand, CSS Modules

## Criterios de Aceite
- [ ] Given que um card tem `due_date = '2026-02-19'` (passado), when o card renderiza no board, then exibe um DueDateBadge vermelho "Vencido" abaixo das tags de prioridade
- [ ] Given que um card tem `due_date = '2026-02-20'` (hoje), when o card renderiza, then exibe um DueDateBadge laranja "Hoje"
- [ ] Given que um card tem `due_date = '2026-02-25'`, when o card renderiza, then exibe um DueDateBadge com a data "25 fev"
- [ ] Given que um card NAO tem due_date (null), when o card renderiza, then nenhum badge de data e exibido (sem espaco extra ocupado)
- [ ] Given que o TaskModal esta aberto, when o usuario ve os campos, then existe um campo "Data de vencimento" com o DateInput preenchido com o due_date da task (ou vazio se null)
- [ ] Given que o usuario altera o due_date no TaskModal, when o dirty check e avaliado, then o botao "Salvar alteracoes" fica habilitado
- [ ] Given que o usuario clica "Salvar alteracoes" com due_date alterado, when o save e executado, then o due_date e enviado no PATCH e o card atualiza com o novo badge
- [ ] Given que o usuario limpa o due_date (clica X no DateInput), when salva, then `due_date: null` e enviado e o badge desaparece do card
- [ ] Given que o TaskForm (criacao) e aberto, when o usuario ve os campos, then existe um campo "Data de vencimento" com DateInput vazio (opcional)
- [ ] Given que o usuario cria uma task com due_date preenchido, when a task aparece no board, then o card ja exibe o DueDateBadge correspondente
- [ ] Given que o campo due_date ja e aceito pelo `createTaskSchema` e `updateTaskSchema` existentes, when o formulario envia os dados, then a validacao Zod passa sem alteracoes nos schemas

## Notas Tecnicas
- **Card.js**: adicionar o DueDateBadge apos o `tags-container` e antes do `card-footer`. Importar `DueDateBadge` de `@/components/ui/DueDateBadge`. Renderizar condicionalmente: `{task.due_date && <DueDateBadge dueDate={task.due_date} size="sm" />}`.
- **TaskModal.js**: adicionar state `editDueDate` (inicializado com `task.due_date || ''`). Adicionar no dirty check: `editDueDate !== (task.due_date || '')`. No `handleSave`, incluir `due_date` nos updates se mudou. Usar `due_date: editDueDate || null` para enviar null quando vazio.
- **TaskForm.js**: adicionar state `dueDate` (default `''`). Incluir no `formData`: `due_date: dueDate || null`. Campo aparece apos o dropdown de responsavel.
- **Schemas Zod**: `due_date` ja e `z.string().nullable().optional()` em ambos os schemas. Nenhuma alteracao necessaria.
- **Cards com due_date sobrecarregado**: atualmente o campo `due_date` existe no Supabase mas nenhuma task existente tem valor. Apos esta story, usuarios poderao definir due_date pela primeira vez.

## Estimativa
M -- Modificacao de 3 componentes existentes (Card, TaskModal, TaskForm) com integracao de componentes novos. Requer cuidado com dirty check no TaskModal.

## Definition of Done
- [ ] Codigo implementado
- [ ] Sem erros de lint
- [ ] Build passando
- [ ] Criterios de aceite verificados manualmente
- [ ] DueDateBadge visivel nos cards com due_date
- [ ] Criar e editar due_date funciona end-to-end
- [ ] Todos os textos em PT-BR

---

## Epico 6: Comentarios

---

# Story 6.1: Schema + API routes para comentarios

## Status: Draft

## Descricao
Como **desenvolvedor**, eu quero ter a tabela `task_comments` criada no Supabase e as API routes de comentarios funcionando para que o frontend tenha endpoints para listar, criar e deletar comentarios em tarefas.

## Contexto Tecnico
- Arquivos a criar:
  - `supabase/migration-sprint2.sql` -- tabela `task_comments` + indices para tasks (type, priority, assignee, due_date)
  - `src/app/api/tasks/[taskId]/comments/route.js` -- GET (listar) + POST (criar)
  - `src/app/api/tasks/[taskId]/comments/[commentId]/route.js` -- DELETE
- Arquivos a modificar:
  - `src/lib/validators.js` -- adicionar `createCommentSchema` (author + content)
- Dependencias: nenhuma (infraestrutura, pode rodar em paralelo com Story 4.1 e 5.1)
- Stack: Next.js 16 App Router, Supabase server client, Zod

## Criterios de Aceite
- [ ] Given que o SQL de migracao foi executado, when eu consulto `SELECT * FROM task_comments`, then a tabela existe com colunas: id (UUID), task_id (UUID FK), board_id (UUID FK), author (VARCHAR 100), content (TEXT), created_at (TIMESTAMPTZ), updated_at (TIMESTAMPTZ)
- [ ] Given que a tabela `task_comments` existe, when eu insiro um comentario e deleto a task referenciada, then o comentario e deletado automaticamente (ON DELETE CASCADE)
- [ ] Given que os novos indices foram criados, when eu consulto `\d tasks`, then existem indices `idx_tasks_type`, `idx_tasks_priority`, `idx_tasks_assignee`, `idx_tasks_due_date`
- [ ] Given que `createCommentSchema` foi adicionado ao validators.js, when eu valido `{ author: 'andrey', content: 'Comentario valido' }`, then a validacao passa
- [ ] Given que `createCommentSchema` existe, when eu valido `{ author: '', content: '' }`, then recebo erros de validacao ("Autor e obrigatorio", "Conteudo e obrigatorio")
- [ ] Given que `createCommentSchema` existe, when eu valido um content com mais de 5000 caracteres, then recebo erro de validacao
- [ ] Given que uma task existe, when eu faco `GET /api/tasks/{taskId}/comments`, then recebo `{ comments: [] }` com status 200 (lista vazia inicialmente)
- [ ] Given que uma task NAO existe, when eu faco `GET /api/tasks/{uuid-inexistente}/comments`, then recebo `{ error: 'Tarefa nao encontrada' }` com status 404
- [ ] Given que uma task existe, when eu faco `POST /api/tasks/{taskId}/comments` com `{ author: 'andrey', content: 'Meu comentario' }`, then recebo `{ comment: {...} }` com status 201, o comentario tem UUID real e board_id preenchido automaticamente
- [ ] Given que envio author vazio no POST, when a API processa, then recebo `{ error: 'Autor e obrigatorio' }` com status 400
- [ ] Given que um comentario existe, when eu faco `DELETE /api/tasks/{taskId}/comments/{commentId}`, then recebo `{ success: true }` com status 200
- [ ] Given que um comentario NAO existe, when eu faco `DELETE /api/tasks/{taskId}/comments/{uuid-inexistente}`, then recebo `{ error: 'Comentario nao encontrado' }` com status 404
- [ ] Given que existem 3 comentarios em uma task, when eu faco `GET /api/tasks/{taskId}/comments`, then os comentarios vem ordenados por `created_at ASC` (mais antigo primeiro)

## Notas Tecnicas
- **Schema SQL**: ver architecture-sprint2.md, secao 2.1 para tabela `task_comments` completa e secao 2.2 para indices adicionais. Incluir trigger `trg_comments_updated_at` e RLS publica temporaria.
- **API de comentarios**: ver architecture-sprint2.md, secoes 3.2 e 3.3 para implementacao completa das routes com codigo de referencia.
- **board_id no comentario**: ao criar comentario, buscar o `board_id` da task referenciada e inserir no comentario (denormalizacao, mesmo padrao do Sprint 1 com tasks).
- **Validacao Zod**: `createCommentSchema` com `author` (min 1, max 100) e `content` (min 1, max 5000). Ver architecture-sprint2.md, secao 3.4.
- **Arquivo de migracao**: criar `supabase/migration-sprint2.sql` com todo o SQL necessario (tabela, indices, trigger, RLS).

## Estimativa
M -- Criacao de tabela, 3 rotas de API e schema Zod. Padrao ja estabelecido no Sprint 1 facilita, mas envolve multiplos arquivos.

## Definition of Done
- [ ] Codigo implementado
- [ ] Sem erros de lint
- [ ] Build passando
- [ ] Criterios de aceite verificados manualmente (via curl ou browser)
- [ ] Migration SQL pronto para execucao
- [ ] Cada endpoint testado com dados validos e invalidos

---

# Story 6.2: CommentItem + CommentInput components

## Status: Draft

## Descricao
Como **Dev Andrey**, eu quero ver comentarios formatados com avatar, nome do autor, data e conteudo, e ter um campo para adicionar novos comentarios com submit via Ctrl+Enter, para que eu possa colaborar em tarefas diretamente no board.

## Contexto Tecnico
- Arquivos a criar:
  - `src/components/ui/CommentItem.js` + `CommentItem.module.css`
  - `src/components/ui/CommentInput.js` + `CommentInput.module.css`
- Arquivos a modificar:
  - `src/app/globals.css` -- adicionar design tokens de comment (secao 1.3 da frontend-spec-sprint2.md)
- Dependencias: nenhuma para os componentes visuais (sao presentationais), mas a integracao completa depende da Story 6.1 (API) e Story 6.3 (CommentSection)
- Stack: React 19, CSS Modules, lucide-react (Send)

## Criterios de Aceite
- [ ] Given que o CommentItem recebe `author="Andrey"`, `content="Preciso de mais contexto"` e `timestamp="2026-02-20T14:30:00Z"`, when o componente renderiza, then exibe: avatar circular com "A", nome "Andrey" em negrito, timestamp "20/02/2026 14:30" e conteudo do comentario
- [ ] Given que o CommentItem recebe `isOptimistic=true`, when o componente renderiza, then exibe com opacity reduzida (0.6) indicando que esta sendo salvo
- [ ] Given que o conteudo do comentario tem quebras de linha, when o componente renderiza, then as quebras sao preservadas (white-space: pre-wrap)
- [ ] Given que multiplos CommentItems sao renderizados em sequencia, when o usuario ve a lista, then existe uma borda separadora entre cada comentario
- [ ] Given que o CommentInput e renderizado, when o usuario ve o campo, then exibe um textarea com placeholder "Adicionar comentario..."
- [ ] Given que o usuario digita texto no CommentInput, when o textarea tem conteudo, then um footer aparece com a hint "Ctrl+Enter para enviar" e um botao "Enviar"
- [ ] Given que o usuario esta em um Mac, when o footer aparece, then a hint exibe "Cmd+Enter para enviar"
- [ ] Given que o textarea esta vazio, when o usuario olha para o botao "Enviar", then o botao esta desabilitado
- [ ] Given que o textarea tem texto, when o usuario pressiona Ctrl+Enter (ou Cmd+Enter), then `onSubmit` e chamado com o texto trimado e o campo e limpo
- [ ] Given que o usuario clica no botao "Enviar", when `onSubmit` e chamado, then o campo e limpo
- [ ] Given que o CommentInput recebe `isSubmitting=true`, when o componente renderiza, then o botao "Enviar" esta desabilitado e o textarea esta readonly
- [ ] Given que o textarea recebe foco, when o campo fica ativo, then a borda muda para `--input-border-focus` com glow sutil

## Notas Tecnicas
- **CommentItem**: componente puramente visual (presentational). Avatar usa a primeira letra do nome (mesmo padrao do Card). Timestamp formatado com a funcao `formatDate` existente no TaskModal (pode ser extraida para utils). Ver frontend-spec-sprint2.md, secao 2.2.3.
- **CommentInput**: textarea com auto-resize (max 120px). Footer com hint de atalho e botao "Enviar". Ver frontend-spec-sprint2.md, secao 2.2.4.
- **Design tokens de comment**: `--comment-bg`, `--comment-border`, `--comment-input-bg`, `--comment-avatar-size` (32px), `--comment-timestamp`, `--comment-author`, `--comment-content`, `--comment-section-max-height` (320px). Ver frontend-spec-sprint2.md, secao 1.3.
- **Auto-resize do textarea**: usar `scrollHeight` no `onInput` para ajustar a altura automaticamente ate o max-height.

## Estimativa
M -- Dois componentes visuais com logica de interacao (auto-resize, Ctrl+Enter, platform detection). Design tokens novos.

## Definition of Done
- [ ] Codigo implementado
- [ ] Sem erros de lint
- [ ] Build passando
- [ ] Criterios de aceite verificados manualmente
- [ ] Ctrl+Enter / Cmd+Enter funciona
- [ ] Auto-resize do textarea funciona
- [ ] Todos os textos em PT-BR

---

# Story 6.3: CommentSection no TaskModal (lazy load, optimistic add, scroll)

## Status: Draft

## Descricao
Como **Dev Andrey**, eu quero ver e adicionar comentarios diretamente no modal de detalhes da tarefa para que eu possa colaborar e registrar contexto sem sair do fluxo de trabalho.

## Contexto Tecnico
- Arquivos a criar:
  - `src/components/Kanban/CommentSection.js` + `CommentSection.module.css`
- Arquivos a modificar:
  - `src/stores/useBoardStore.js` -- adicionar state `commentsCache`, `commentsLoading` e actions `fetchComments`, `addComment`, `deleteComment`; atualizar `deleteTask` para limpar commentsCache
  - `src/components/Kanban/TaskModal.js` -- adicionar `<CommentSection taskId={activeTaskId} />` no corpo, apos os meta-dados
  - `src/lib/constants.js` -- adicionar constante `COMMENT_AUTHOR_KEY` para localStorage (persistir ultimo autor selecionado)
- Dependencias: Story 6.1 (API routes de comentarios), Story 6.2 (CommentItem, CommentInput)
- Stack: React 19, zustand, CSS Modules

## Criterios de Aceite
- [ ] Given que o TaskModal abre, when o componente monta, then `fetchComments(taskId)` e chamado automaticamente (lazy loading)
- [ ] Given que `fetchComments` esta carregando, when o usuario ve a CommentSection, then uma mensagem "Carregando comentarios..." e exibida
- [ ] Given que os comentarios carregaram, when o usuario ve a CommentSection, then a lista de comentarios e exibida com CommentItems ordenados por data (mais antigo primeiro)
- [ ] Given que a task nao tem comentarios, when o usuario ve a CommentSection, then exibe a mensagem "Nenhum comentario" e o campo de input para adicionar
- [ ] Given que o usuario fecha e reabre o TaskModal da mesma task, when `fetchComments` e chamado, then os comentarios vem do cache (sem nova requisicao ao servidor)
- [ ] Given que o CommentSection renderiza o CommentInput, when o usuario ve o campo de autor, then ha um dropdown/select com os membros de `TEAM_MEMBERS` para selecionar quem esta comentando
- [ ] Given que o usuario selecionou um autor e escreveu um comentario, when ele envia (Enviar ou Ctrl+Enter), then o comentario aparece instantaneamente na lista (optimistic update com opacity reduzida)
- [ ] Given que o POST do comentario foi bem-sucedido, when a resposta retorna, then o comentario temporario e substituido pelo real (opacity volta a 1.0)
- [ ] Given que o POST do comentario falhou, when o erro e capturado, then o comentario temporario e removido da lista e um toast de erro aparece ("Erro ao adicionar comentario")
- [ ] Given que o usuario clica no icone de lixeira de um comentario, when um ConfirmDialog e exibido e ele confirma, then o comentario e removido instantaneamente (optimistic) e um DELETE e enviado a API
- [ ] Given que o DELETE do comentario falhou, when o erro e capturado, then o comentario reaparece na lista (rollback) e um toast de erro aparece
- [ ] Given que existem muitos comentarios, when a lista excede 320px de altura, then a secao tem scroll interno (overflow-y: auto) com o campo de input fixo no final
- [ ] Given que o usuario selecionou um autor no dropdown, when ele abre outro TaskModal, then o mesmo autor esta pre-selecionado (persistido em localStorage via `COMMENT_AUTHOR_KEY`)
- [ ] Given que uma task e deletada, when o delete e bem-sucedido, then o cache de comentarios dessa task e limpo do `commentsCache`
- [ ] Given que a CommentSection exibe o titulo "Comentarios", when o usuario ve a secao, then ha um separador visual entre os meta-dados da task e a secao de comentarios

## Notas Tecnicas
- **Store changes (useBoardStore)**: adicionar `commentsCache: {}`, `commentsLoading: {}`, `fetchComments(taskId, force)`, `addComment(taskId, author, content)`, `deleteComment(taskId, commentId)`. Ver architecture-sprint2.md, secao 4.2 para implementacao completa.
- **Cache de comentarios**: `commentsCache[taskId]` armazena array de comentarios. `fetchComments` verifica cache antes de fazer request. Parametro `force=true` ignora cache.
- **Optimistic update em addComment**: criar comentario temporario com `id: 'temp-comment-{timestamp}'`. Apos sucesso, substituir temp pelo real. Apos falha, remover temp (rollback).
- **Autor persistido**: usar `localStorage.getItem(COMMENT_AUTHOR_KEY)` para pre-selecionar o ultimo autor usado. Atualizar no localStorage a cada submit.
- **Limpeza de cache no deleteTask**: ao final do `deleteTask` existente, apos sucesso, remover `commentsCache[taskId]`.
- **CommentSection no TaskModal**: renderizar apos `metaSection` e antes do `footer`. Titulo "Comentarios" com icone `MessageSquare` (lucide).

## Estimativa
M -- Componente organismo + mudancas significativas no useBoardStore (3 novas actions com optimistic updates). Integracao com TaskModal e persistencia de autor em localStorage.

## Definition of Done
- [ ] Codigo implementado
- [ ] Sem erros de lint
- [ ] Build passando
- [ ] Criterios de aceite verificados manualmente
- [ ] Lazy loading de comentarios funciona
- [ ] Optimistic add e delete funcionam com rollback
- [ ] Cache de comentarios funciona (sem re-fetch desnecessario)
- [ ] Todos os textos em PT-BR

---

## Epico 7: Testes Automatizados

---

# Story 7.1: Vitest setup (config, scripts, primeiro teste)

## Status: Draft

## Descricao
Como **desenvolvedor**, eu quero ter o Vitest configurado e rodando com um primeiro teste passando para que a infraestrutura de testes automatizados esteja pronta para o time escrever testes dos demais componentes.

## Contexto Tecnico
- Arquivos a criar:
  - `vitest.config.js` -- configuracao do Vitest (environment jsdom, globals, setup file, aliases)
  - `src/test/setup.js` -- setup com `@testing-library/jest-dom`
  - `src/lib/__tests__/validators.test.js` -- primeiro teste (smoke test do setup)
- Arquivos a modificar:
  - `package.json` -- adicionar scripts `test`, `test:watch`, `test:coverage`, `test:ui`
- Dependencias: nenhuma (infraestrutura, pode rodar em paralelo com demais stories)
- Stack: vitest ^3.x, @testing-library/react ^16.x, @testing-library/jest-dom ^6.x, @testing-library/user-event ^14.x, jsdom ^26.x

## Criterios de Aceite
- [ ] Given que as dependencias de teste foram instaladas, when eu rodo `npm install`, then vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event e jsdom estao no node_modules sem erros
- [ ] Given que `vitest.config.js` existe na raiz, when eu inspeciono o arquivo, then esta configurado com: environment `'jsdom'`, globals `true`, setupFiles `['./src/test/setup.js']`, include `['src/**/*.{test,spec}.{js,jsx}']`, alias `@` para `./src`
- [ ] Given que `src/test/setup.js` existe, when eu inspeciono o arquivo, then importa `@testing-library/jest-dom` para matchers extras (toBeInTheDocument, etc.)
- [ ] Given que os scripts foram adicionados ao package.json, when eu rodo `npm test`, then Vitest executa em modo single-run e reporta resultados
- [ ] Given que os scripts existem, when eu rodo `npm run test:watch`, then Vitest executa em modo watch (re-run ao salvar arquivos)
- [ ] Given que os scripts existem, when eu rodo `npm run test:coverage`, then Vitest gera relatorio de cobertura em formato text + HTML
- [ ] Given que `src/lib/__tests__/validators.test.js` existe, when eu rodo `npm test`, then pelo menos 1 teste passa (smoke test validando createTaskSchema)
- [ ] Given que o smoke test valida `createTaskSchema.safeParse({ column_id: 'uuid-valido', title: 'Test' })`, when o teste executa, then `result.success` e `true` e o teste passa
- [ ] Given que o smoke test valida `createTaskSchema.safeParse({ column_id: '', title: '' })`, when o teste executa, then `result.success` e `false` e o teste passa

## Notas Tecnicas
- **Instalacao**: `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`. Todas como devDependencies. Ver architecture-sprint2.md, secao 11.1.
- **vitest.config.js**: ver architecture-sprint2.md, secao 8.2 para configuracao completa. Alias `@` resolve para `./src` (mesmo path mapping do Next.js).
- **setup.js**: apenas `import '@testing-library/jest-dom'`. Adiciona matchers como `toBeInTheDocument()`, `toHaveTextContent()`, etc.
- **Scripts npm**: `test` (single run), `test:watch` (watch mode), `test:coverage` (com v8 provider), `test:ui` (Vitest UI). Ver architecture-sprint2.md, secao 8.7.
- **Testes ficam em `__tests__/`**: adjacentes ao codigo fonte. Pattern: `src/lib/__tests__/validators.test.js` para testar `src/lib/validators.js`.
- **Smoke test**: validar que o setup funciona end-to-end (importa modulo, executa teste, reporta resultado). Nao precisa ser exaustivo nesta story.

## Estimativa
P -- Instalacao de dependencias, criacao de config e 1 arquivo de teste. Baixo risco, alto impacto (desbloqueia todas as stories de teste).

## Definition of Done
- [ ] Codigo implementado
- [ ] `npm test` executa e passa (pelo menos 1 teste)
- [ ] `npm run test:coverage` gera relatorio
- [ ] Build da aplicacao continua passando (`npm run build`)

---

# Story 7.2: Unit tests para validators e date utilities

## Status: Draft

## Descricao
Como **desenvolvedor**, eu quero ter testes unitarios cobrindo os validators Zod e as funcoes de dateUtils para que mudancas futuras nao quebrem a logica de validacao e classificacao de datas silenciosamente.

## Contexto Tecnico
- Arquivos a criar:
  - `src/lib/__tests__/validators.test.js` -- testes exaustivos para createTaskSchema, updateTaskSchema, moveTaskSchema, createCommentSchema
  - `src/lib/__tests__/dateUtils.test.js` -- testes para getDueDateStatus, getDueDateLabel, formatDueDateShort
- Dependencias: Story 7.1 (Vitest configurado), Story 5.1 (dateUtils.js criado), Story 6.1 (createCommentSchema adicionado ao validators.js)
- Stack: vitest

## Criterios de Aceite
- [ ] Given que `validators.test.js` existe, when eu rodo `npm test`, then todos os testes de validators passam
- [ ] Given que `createTaskSchema` e testado, when dados validos sao fornecidos (column_id UUID, title "Tarefa"), then `result.success` e `true` e defaults sao aplicados (type='task', priority='medium')
- [ ] Given que `createTaskSchema` e testado, when titulo vazio e fornecido, then `result.success` e `false` com mensagem "Titulo e obrigatorio"
- [ ] Given que `createTaskSchema` e testado, when column_id invalido (nao-UUID) e fornecido, then `result.success` e `false`
- [ ] Given que `createTaskSchema` e testado, when tipo invalido (ex: 'invalid') e fornecido, then `result.success` e `false`
- [ ] Given que `updateTaskSchema` e testado, when nenhum campo e fornecido (objeto vazio), then `result.success` e `true` (todos os campos sao opcionais)
- [ ] Given que `moveTaskSchema` e testado, when position negativa e fornecida, then `result.success` e `false`
- [ ] Given que `createCommentSchema` e testado, when dados validos (author + content) sao fornecidos, then `result.success` e `true`
- [ ] Given que `createCommentSchema` e testado, when content vazio e fornecido, then `result.success` e `false` com mensagem "Conteudo e obrigatorio"
- [ ] Given que `createCommentSchema` e testado, when content com mais de 5000 caracteres e fornecido, then `result.success` e `false`
- [ ] Given que `dateUtils.test.js` existe, when eu rodo `npm test`, then todos os testes de dateUtils passam
- [ ] Given que `getDueDateStatus` e testado com data de ontem (usando `vi.useFakeTimers`), when a funcao executa, then retorna `'overdue'`
- [ ] Given que `getDueDateStatus` e testado com data de hoje, when a funcao executa, then retorna `'today'`
- [ ] Given que `getDueDateStatus` e testado com data de 5 dias no futuro, when a funcao executa, then retorna `'this-week'`
- [ ] Given que `getDueDateStatus` e testado com data de 15 dias no futuro, when a funcao executa, then retorna `'future'`
- [ ] Given que `getDueDateStatus` e testado com `null`, when a funcao executa, then retorna `null`
- [ ] Given que `getDueDateLabel` e testado, when recebe cada status possivel, then retorna labels em PT-BR: 'Atrasado', 'Vence hoje', 'Vence esta semana', '' (future), '' (null)
- [ ] Given que `formatDueDateShort` e testado, when recebe '2026-02-20', then retorna '20 fev'
- [ ] Given que `formatDueDateShort` e testado, when recebe null, then retorna '' (string vazia)

## Notas Tecnicas
- **Testes de dateUtils**: DEVEM usar `vi.useFakeTimers()` e `vi.setSystemTime()` para controlar "hoje". Sem isso, os testes falham dependendo do dia em que rodam. Usar `afterEach(() => vi.useRealTimers())` para cleanup. Ver architecture-sprint2.md, secao 8.6.
- **Estrutura dos testes**: usar `describe` por funcao/schema e `it` por cenario. Padrao: `describe('createTaskSchema', () => { it('aceita dados validos', ...) })`.
- **Coverage target**: estes testes devem cobrir 100% das linhas de `validators.js` e `dateUtils.js`.

## Estimativa
P -- Testes unitarios de funcoes puras. Alta previsibilidade, sem dependencias externas.

## Definition of Done
- [ ] Codigo implementado
- [ ] `npm test` passa com todos os testes
- [ ] Cobertura de 100% para validators.js e dateUtils.js
- [ ] Testes usam vi.useFakeTimers() onde necessario

---

# Story 7.3: Store tests (useBoardStore, useUIStore)

## Status: Draft

## Descricao
Como **desenvolvedor**, eu quero ter testes automatizados para os Zustand stores cobrindo filtros, getFilteredTasksByColumn e toasts para que a logica de state management esteja protegida contra regressoes.

## Contexto Tecnico
- Arquivos a criar:
  - `src/stores/__tests__/useUIStore.test.js` -- testes de filtros (setFilter, clearFilters, hasActiveFilters), toasts e toggle actions
  - `src/stores/__tests__/useBoardStore.test.js` -- testes de getFilteredTasksByColumn com diferentes combinacoes de filtros
- Dependencias: Story 7.1 (Vitest configurado), Story 4.1 (filtros implementados nos stores)
- Stack: vitest, zustand

## Criterios de Aceite
- [ ] Given que `useUIStore.test.js` existe, when eu rodo `npm test`, then todos os testes de useUIStore passam
- [ ] Given que `setFilter('type', 'bug')` e testado, when a action e chamada, then `filters.type` e `'bug'` e demais filtros nao mudam
- [ ] Given que `clearFilters()` e testado apos filtros serem setados, when a action e chamada, then todos os filtros voltam ao estado inicial
- [ ] Given que `hasActiveFilters()` e testado sem filtros ativos, when a funcao e chamada, then retorna `false`
- [ ] Given que `hasActiveFilters()` e testado com filtro de busca `search: 'login'`, when a funcao e chamada, then retorna `true`
- [ ] Given que `addToast('Mensagem', 'success')` e testado, when a action e chamada, then um toast e adicionado ao array `toasts` com message, type e id
- [ ] Given que `useBoardStore.test.js` existe, when eu rodo `npm test`, then todos os testes de useBoardStore passam
- [ ] Given que o store tem tasks de tipo misto, when `getFilteredTasksByColumn` e chamado com `filters.type = 'bug'`, then retorna apenas tasks do tipo bug
- [ ] Given que o store tem tasks com prioridades mistas, when `getFilteredTasksByColumn` e chamado com `filters.priority = 'urgent'`, then retorna apenas tasks urgentes
- [ ] Given que o store tem tasks com assignees diferentes, when `getFilteredTasksByColumn` e chamado com `filters.assignee = 'andrey'`, then retorna apenas tasks atribuidas a andrey
- [ ] Given que `filters.search = 'login'`, when `getFilteredTasksByColumn` e chamado, then retorna tasks cujo titulo contém "login" (case-insensitive)
- [ ] Given que `filters.search = 'login'` e uma task tem "login" na descricao (nao no titulo), when `getFilteredTasksByColumn` e chamado, then a task e incluida no resultado (busca em titulo E descricao)
- [ ] Given que `filters.type = 'bug'` e `filters.priority = 'urgent'` estao ativos simultaneamente, when `getFilteredTasksByColumn` e chamado, then retorna apenas tasks que sao bug E urgent (AND)
- [ ] Given que nenhum filtro esta ativo, when `getFilteredTasksByColumn` e chamado, then retorna todas as tasks da coluna (identico a getTasksByColumn)

## Notas Tecnicas
- **Reset de state entre testes**: usar `beforeEach` com `useUIStore.setState({...})` e `useBoardStore.setState({...})` para resetar stores antes de cada teste. Zustand permite setar state diretamente para testes.
- **Mock de tasks para testes**: criar fixture com ~5-10 tasks de tipos, prioridades e assignees variados em uma mesma coluna para testar combinacoes de filtros.
- **Acoplamento entre stores**: `getFilteredTasksByColumn` le `useUIStore.getState().filters`. Nos testes, setar o state do useUIStore ANTES de chamar o getter do useBoardStore.
- **Testes de toast**: verificar que `addToast` adiciona ao array. NAO testar o setTimeout de remocao automatica (teste unitario, nao integracao de timers).

## Estimativa
M -- Testes de state management com fixtures de dados e combinacoes de filtros. Requer setup cuidadoso de estado entre testes.

## Definition of Done
- [ ] Codigo implementado
- [ ] `npm test` passa com todos os testes
- [ ] Cobertura de getFilteredTasksByColumn cobre todos os cenarios de filtro
- [ ] Stores resetados entre testes (sem state leaking)

---

# Story 7.4: Component tests (Card, FilterBar, Badge)

## Status: Draft

## Descricao
Como **desenvolvedor**, eu quero ter testes de componentes para Card, FilterBar e Badge usando Testing Library para que a renderizacao e interacao dos componentes-chave estejam protegidas contra regressoes visuais e comportamentais.

## Contexto Tecnico
- Arquivos a criar:
  - `src/components/Kanban/__tests__/Card.test.js` -- testes de renderizacao do Card com diferentes props
  - `src/components/Kanban/__tests__/FilterBar.test.js` -- testes de interacao (selecionar filtro, limpar filtros)
  - `src/components/ui/__tests__/Badge.test.js` -- testes de renderizacao com cada variante de prioridade
- Dependencias: Story 7.1 (Vitest + Testing Library configurados), Story 4.4 (FilterBar criada), Story 5.3 (Card com DueDateBadge)
- Stack: vitest, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom

## Criterios de Aceite
- [ ] Given que `Card.test.js` existe, when eu rodo `npm test`, then todos os testes de Card passam
- [ ] Given que Card e renderizado com uma task, when o teste verifica, then o titulo da task esta visivel no DOM (`toBeInTheDocument`)
- [ ] Given que Card e renderizado com `type: 'bug'`, when o teste verifica, then o label "Bug" esta visivel
- [ ] Given que Card e renderizado com `priority: 'urgent'`, when o teste verifica, then o Badge de prioridade "Urgente" esta visivel
- [ ] Given que Card e renderizado com `assignee: 'Andrey'`, when o teste verifica, then o avatar com "A" esta visivel
- [ ] Given que Card e renderizado com `due_date` no passado, when o teste verifica, then o DueDateBadge com "Vencido" esta visivel
- [ ] Given que Card e renderizado sem `due_date`, when o teste verifica, then nenhum DueDateBadge e renderizado
- [ ] Given que `Badge.test.js` existe, when eu rodo `npm test`, then todos os testes de Badge passam
- [ ] Given que Badge e renderizado com `priority: 'low'`, when o teste verifica, then exibe texto "Baixa"
- [ ] Given que Badge e renderizado com `priority: 'urgent'`, when o teste verifica, then exibe texto "Urgente"
- [ ] Given que `FilterBar.test.js` existe, when eu rodo `npm test`, then todos os testes de FilterBar passam
- [ ] Given que FilterBar e renderizada, when o teste verifica elementos iniciais, then o campo de busca e os dropdowns de filtro estao presentes no DOM
- [ ] Given que nenhum filtro esta ativo, when o teste verifica, then o botao "Limpar filtros" NAO esta no DOM

## Notas Tecnicas
- **Mock de stores**: para testes de componentes que dependem de Zustand, usar `vi.mock('@/stores/useBoardStore')` e `vi.mock('@/stores/useUIStore')` ou setar state diretamente com `setState`.
- **Mock de @dnd-kit**: o Card usa `useSortable` do @dnd-kit. Para testes, mockar o hook para retornar valores default: `{ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null, transition: null, isDragging: false }`.
- **Testing Library best practices**: usar `screen.getByText()`, `screen.getByRole()`, `screen.queryByText()` (para verificar ausencia). Preferir queries por role/label (acessibilidade) sobre queries por test-id.
- **Fixtures de task**: criar task mock com todos os campos para reutilizar nos testes do Card.
- **FilterBar mock**: como FilterBar compoe SearchBar + FilterDropdowns, pode ser necessario mockar sub-componentes ou renderizar de forma simplificada.

## Estimativa
M -- Testes de componentes requerem setup de mocks (stores, dnd-kit) e conhecimento de Testing Library. 3 arquivos de teste.

## Definition of Done
- [ ] Codigo implementado
- [ ] `npm test` passa com todos os testes
- [ ] Card testado com diferentes combinacoes de props
- [ ] Badge testado com todas as variantes de prioridade
- [ ] FilterBar testada com presenca de elementos-chave

---

## Resumo do Sprint 2

### Total de Stories: 15

### Distribuicao por Epico

| Epico | Stories | Descricao |
|-------|:-------:|-----------|
| 4 -- Filtros e Busca | 5 | State management, SearchBar, FilterDropdown, FilterBar, Column integration |
| 5 -- Due Date Funcional | 3 | DateInput + dateUtils, DueDateBadge, Card/Modal/Form integration |
| 6 -- Comentarios | 3 | Schema + API, CommentItem + CommentInput, CommentSection no TaskModal |
| 7 -- Testes Automatizados | 4 | Vitest setup, unit tests, store tests, component tests |

### Estimativas

| Tamanho | Quantidade | Stories |
|---------|:----------:|---------|
| P (Pequena) | 4 | 4.2, 4.5, 5.2, 7.1, 7.2 |
| M (Media) | 11 | 4.1, 4.3, 4.4, 5.1, 5.3, 6.1, 6.2, 6.3, 7.3, 7.4 |

> **Nota:** A Story 7.2 foi classificada como P na tabela acima, totalizando 5P e 10M (ajuste vs indice: 4.2, 4.5, 5.2, 7.1 = 4P e 7.2 conta como 5a P).

### Ordem de Implementacao (Respeita Dependencias)

```
Batch 1 - Infraestrutura (paralelo):
  Story 4.1  Filter state management    [M]  (sem dependencias)
  Story 5.1  DateInput + dateUtils      [M]  (sem dependencias)
  Story 6.1  Schema + API comments      [M]  (sem dependencias)
  Story 7.1  Vitest setup               [P]  (sem dependencias)

Batch 2 - Componentes (paralelo, apos Batch 1):
  Story 4.2  SearchBar component        [P]  (depende de 4.1)
  Story 4.3  FilterDropdown components  [M]  (depende de 4.1)
  Story 5.2  DueDateBadge component     [P]  (depende de 5.1)
  Story 6.2  CommentItem + CommentInput [M]  (sem dependencia direta, mas design tokens de 6.1)

Batch 3 - Integracao (parcialmente paralelo, apos Batch 2):
  Story 4.4  FilterBar organism         [M]  (depende de 4.1, 4.2, 4.3)
  Story 4.5  Column integration         [P]  (depende de 4.1, 4.4)
  Story 5.3  Card/Modal/Form due_date   [M]  (depende de 5.1, 5.2)
  Story 6.3  CommentSection no Modal    [M]  (depende de 6.1, 6.2)

Batch 4 - Testes (apos Batch 3):
  Story 7.2  Unit tests validators/date [P]  (depende de 7.1, 5.1, 6.1)
  Story 7.3  Store tests                [M]  (depende de 7.1, 4.1)
  Story 7.4  Component tests            [M]  (depende de 7.1, 4.4, 5.3)
```

### Grafo de Dependencias

```
4.1 ──> 4.2 ──┐
  │           ├──> 4.4 ──> 4.5
  └──> 4.3 ──┘

5.1 ──> 5.2 ──┐
              ├──> 5.3
5.1 ──────────┘

6.1 ──> 6.2 ──> 6.3

7.1 ──> 7.2
  │──> 7.3
  └──> 7.4
```

### Arquivos Novos (Sprint 2)

| Arquivo | Story |
|---------|-------|
| `src/stores/useUIStore.js` (modificado: filtros) | 4.1 |
| `src/stores/useBoardStore.js` (modificado: filtros + comentarios) | 4.1, 6.3 |
| `src/hooks/useDebounce.js` | 4.2 |
| `src/components/ui/SearchBar.js` + `.module.css` | 4.2 |
| `src/components/ui/FilterDropdown.js` + `.module.css` | 4.3 |
| `src/components/ui/FilterChip.js` + `.module.css` | 4.3 |
| `src/components/Kanban/FilterBar.js` + `.module.css` | 4.4 |
| `src/components/Kanban/Board.js` (modificado) | 4.4 |
| `src/components/Kanban/Column.js` (modificado) | 4.5 |
| `src/components/ui/DateInput.js` + `.module.css` | 5.1 |
| `src/lib/dateUtils.js` | 5.1 |
| `src/components/ui/DueDateBadge.js` + `.module.css` | 5.2 |
| `src/components/Kanban/Card.js` (modificado) | 5.3 |
| `src/components/Kanban/TaskModal.js` (modificado) | 5.3, 6.3 |
| `src/components/Kanban/TaskForm.js` (modificado) | 5.3 |
| `supabase/migration-sprint2.sql` | 6.1 |
| `src/lib/validators.js` (modificado) | 6.1 |
| `src/app/api/tasks/[taskId]/comments/route.js` | 6.1 |
| `src/app/api/tasks/[taskId]/comments/[commentId]/route.js` | 6.1 |
| `src/components/ui/CommentItem.js` + `.module.css` | 6.2 |
| `src/components/ui/CommentInput.js` + `.module.css` | 6.2 |
| `src/components/Kanban/CommentSection.js` + `.module.css` | 6.3 |
| `src/lib/constants.js` (modificado) | 6.3 |
| `src/app/globals.css` (modificado: tokens) | 4.2, 4.3, 5.1, 6.2 |
| `vitest.config.js` | 7.1 |
| `src/test/setup.js` | 7.1 |
| `src/lib/__tests__/validators.test.js` | 7.1, 7.2 |
| `src/lib/__tests__/dateUtils.test.js` | 7.2 |
| `src/stores/__tests__/useUIStore.test.js` | 7.3 |
| `src/stores/__tests__/useBoardStore.test.js` | 7.3 |
| `src/components/Kanban/__tests__/Card.test.js` | 7.4 |
| `src/components/Kanban/__tests__/FilterBar.test.js` | 7.4 |
| `src/components/ui/__tests__/Badge.test.js` | 7.4 |

### Limitacoes Conhecidas do Sprint 2

1. **Sem sincronizacao em tempo real**: Supabase Realtime foi diferido. Alteracoes feitas por outro usuario so aparecem apos recarregar a pagina.
2. **Autor de comentario manual**: sem autenticacao, o usuario seleciona quem esta comentando via dropdown. No Sprint 3, o autor sera automatico baseado no login.
3. **Filtros nao persistem entre reloads**: estado de filtros vive em memoria (useUIStore). Ao recarregar, filtros voltam ao estado inicial.
4. **Busca textual simples**: `String.includes()` client-side. Para volumes maiores (>500 tasks), sera necessario full-text search no Postgres.
5. **Sem deletar comentario proprio vs alheio**: sem auth, qualquer usuario pode deletar qualquer comentario. Restricao vem no Sprint 3.
6. **Testes nao cobrem API routes**: testes de API routes com Supabase mock foram considerados COULD TEST. Cobertura foca em validators, utils, stores e componentes.

---

> **Documento preparado por River (Scrum Master Agent)**
> **Orquestrado por Orion (Master Orchestrator)**
> **Para uso do Dex (Dev Agent) -- Fevereiro 2026**
