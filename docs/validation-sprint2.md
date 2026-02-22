# O2 Kanban -- Relatorio de Validacao Cruzada (Sprint 2)

> **Documento:** Validation Report -- Sprint 2 "Usability"
> **Autor:** Pax (Product Owner Agent)
> **Data:** 20 de Fevereiro de 2026
> **Versao:** 1.0
> **Documentos Validados:**
> - `docs/prd.md` (Sprint 2 section, Epicos 3.3-3.5)
> - `docs/architecture-sprint2.md` (Aria, v1.0)
> - `docs/frontend-spec-sprint2.md` (Uma, v1.0)
> - `docs/architecture-sprint1.md` (referencia)
> - `docs/frontend-spec.md` (Sprint 1, referencia)
> - Codigo-fonte Sprint 1: stores, validators, constants, schema.sql, globals.css

---

## Veredito Geral: APROVADO COM OBSERVACOES

Os documentos de Sprint 2 estao **bem alinhados entre si e com o PRD**. A arquitetura e a especificacao frontend cobrem todas as features do escopo ajustado. Ha, porem, **divergencias menores de nomenclatura** entre os documentos e **pontos de design que precisam de alinhamento antes da implementacao**. Nenhuma das observacoes e bloqueante -- podem ser resolvidas durante a implementacao, desde que o Dex esteja ciente.

---

## 1. Validacao de Cobertura: PRD -> Documentos Sprint 2

### 1.1 Features do PRD Sprint 2 vs Cobertura

| Feature PRD (Sprint 2 "Usability") | Architecture Sprint 2 | Frontend Spec Sprint 2 | Status |
|--------------------------------------|:---------------------:|:---------------------:|:------:|
| **Filtro por tipo, prioridade e responsavel** (US-3.3, US-3.5) | Secao 5 (completa) | Secao 2.2.2, 2.3.1, 3.5 (completa) | COBERTO |
| **Busca textual de tarefas** (US-3.4) | Secao 5.4 (completa) | Secao 2.2.1 SearchBar (completa) | COBERTO |
| **Due date funcional com indicadores visuais** | Secao 7 (completa) | Secao 2.1.1 DateInput, 2.1.3 DueDateBadge, 3.2-3.4 (completa) | COBERTO |
| **Comentarios basicos em tarefas** | Secao 6 (completa) | Secao 2.2.3-2.2.4, 2.3.2, 3.3 (completa) | COBERTO |
| **Testes automatizados (Vitest)** | Secao 8 (completa) | N/A (escopo da arch, nao do frontend spec) | COBERTO |
| **Supabase Realtime** | Marcado como DIFERIDO (correto) | Nao mencionado (correto) | N/A (DIFERIDO) |
| **Toast notifications** (PRD Sprint 2 line) | Ja implementado Sprint 1 | N/A (ja existe) | JA EXISTE |

**Resultado:** Todas as features do escopo ajustado do Sprint 2 estao cobertas por ambos os documentos. Nenhum gap de cobertura identificado.

### 1.2 Features Explicitamente Excluidas (Correto)

Ambos os documentos corretamente excluem:
- Supabase Realtime (diferido por decisao do usuario)
- Autenticacao (Sprint 3)
- Integracao Slack real (Sprint 3)
- Testes E2E com Playwright (Sprint 4)
- Migracao TypeScript (ADR-009)

---

## 2. Validacao de Consistencia Cruzada

### 2.1 Architecture API Routes <-> Frontend Spec Components

| API Route (Arch) | Frontend Component que Consome | Consistente? |
|-------------------|-------------------------------|:------------:|
| `GET /api/tasks/[taskId]/comments` | `CommentSection.js` via `useBoardStore.fetchComments()` | SIM |
| `POST /api/tasks/[taskId]/comments` | `CommentSection.js` via `useBoardStore.addComment()` | SIM |
| `DELETE /api/tasks/[taskId]/comments/[commentId]` | `CommentItem.js` via `useBoardStore.deleteComment()` | SIM |

**Resultado:** API routes e componentes estao alinhados.

### 2.2 Architecture Store Changes <-> Frontend Spec References

| Store Change (Arch) | Frontend Spec Referencia | Consistente? | Observacao |
|---------------------|--------------------------|:------------:|------------|
| `useUIStore.filters` (type, priority, assignee, search) | FilterBar consome `useFilterStore` ou `useUIStore` | DIVERGENCIA MENOR | Ver item 2.2.1 |
| `useBoardStore.getFilteredTasksByColumn()` | Column.js troca getter | SIM | |
| `useBoardStore.commentsCache` + actions | CommentSection via store | SIM | |
| `useUIStore.setFilter()` | FilterBar dispara filtros | DIVERGENCIA MENOR | Ver item 2.2.1 |
| `useUIStore.clearFilters()` | FilterBar "Limpar todos" | DIVERGENCIA MENOR | Ver item 2.2.1 |
| `useUIStore.hasActiveFilters()` | FilterBar indicador ativo | DIVERGENCIA MENOR | Ver item 2.2.1 |

#### 2.2.1 DIVERGENCIA: Estrutura de Filtros no Store

**Architecture Sprint 2** (secao 4.1) define filtros no `useUIStore` com estrutura **escalar/single-select**:
```javascript
filters: {
  type: null,        // single value: 'bug' | null
  priority: null,    // single value: 'urgent' | null
  assignee: null,    // single value: 'andrey' | null
  search: '',
}
```

**Frontend Spec Sprint 2** (secao 3.1) sugere um `useFilterStore` separado com estrutura **array/multi-select**:
```javascript
{
  search: '',
  types: [],       // array: ['bug', 'task']
  priorities: [],  // array: ['urgent', 'high']
  assignees: [],   // array: ['andrey', 'felipe']
}
```

**Impacto:** A logica de filtragem e diferente. Na arquitetura, filtros sao AND entre categorias com valor unico. Na frontend spec, filtros sao AND entre categorias mas OR dentro de cada categoria (multi-select).

**Recomendacao:** Adotar a abordagem da **Frontend Spec** (multi-select com arrays). E mais rica para o usuario e o PRD US-3.3 menciona "filtros sao combinaveis". O componente `FilterDropdown` da Uma ja suporta `multiple: true` por padrao. O Dex deve ajustar a estrutura do store para usar arrays ao inves de valores escalares. A logica de `getFilteredTasksByColumn` deve usar `.includes()` ao inves de `===`.

**Severidade:** BAIXA -- E uma escolha de design, nao uma inconsistencia critica. Ambas as abordagens funcionam.

### 2.3 Architecture Schema Changes <-> Schema Atual (schema.sql)

| Verificacao | Resultado |
|-------------|-----------|
| Tabela `tasks` no schema atual tem `due_date DATE` | SIM -- linha 48: `due_date DATE` |
| Tabela `tasks` tem campo `assignee VARCHAR(100)` | SIM -- linha 46: `assignee VARCHAR(100)` |
| Campo `type` aceita os valores corretos | SIM -- `CHECK (type IN ('task', 'user_story', 'bug', 'epic', 'spike'))` |
| Campo `priority` aceita os valores corretos | SIM -- `CHECK (priority IN ('low', 'medium', 'high', 'urgent'))` |
| Funcao `update_updated_at()` existe para trigger | SIM -- linhas 63-69 |
| Nova tabela `task_comments` e compativel com schema existente | SIM -- FK `tasks(id)`, `boards(id)` existem |

**Resultado:** Schema Sprint 2 e totalmente compativel com o schema atual. A migracao e aditiva (nova tabela + novos indices).

### 2.4 Design Tokens: Frontend Spec Sprint 2 <-> globals.css Existente

| Token Novo (Frontend Spec S2) | Conflita com Existente? | Observacao |
|-------------------------------|:-----------------------:|------------|
| `--filter-bg`, `--filter-border`, etc. | NAO | Namespace `--filter-*` nao existe |
| `--due-overdue-*`, `--due-today-*`, `--due-soon-*`, `--due-future-*` | DIVERGENCIA MENOR | Ver item 2.4.1 |
| `--comment-*` | NAO | Namespace `--comment-*` nao existe |
| `--search-*` | NAO | Namespace `--search-*` nao existe |
| `--filter-bar-height`, `--filter-bar-padding` | NAO | Nao conflita |
| `--z-filter-dropdown: 950` | NAO | Nao conflita (entre `--z-dropdown: 900` e `--z-modal: 1000`) |

#### 2.4.1 DIVERGENCIA: Nomenclatura Due Date entre Arch e Frontend Spec

**Architecture Sprint 2** (secao 7.3-7.4) usa:
- Status: `overdue`, `today`, `this-week`, `future`
- Tokens: `--due-overdue-*`, `--due-today-*`, `--due-week-*`
- Cor do "this-week": amarelo (`#eab308`)

**Frontend Spec Sprint 2** (secao 1.2, 2.1.3) usa:
- Status: `overdue`, `today`, `soon`, `future`
- Tokens: `--due-overdue-*`, `--due-today-*`, `--due-soon-*`, `--due-future-*`
- Cor do "soon": indigo (`--color-info` / `#6366f1`)

**Diferencas concretas:**

| Aspecto | Architecture | Frontend Spec |
|---------|-------------|---------------|
| Nome do status 1-7 dias | `this-week` | `soon` |
| Token CSS prefix | `--due-week-*` | `--due-soon-*` |
| Cor 1-7 dias | Amarelo `#eab308` | Indigo `#6366f1` |
| Token future | NAO definido | `--due-future-*` definido |

**Recomendacao:** Adotar a nomenclatura e tokens da **Frontend Spec** (`soon` ao inves de `this-week`) por ser mais semantica e visualmente distinta. A frontend spec tambem define o token `--due-future-*` que a arquitetura omitiu. No `dateUtils.js`, usar `'soon'` ao inves de `'this-week'` como retorno do `getDueDateStatus()`.

**Severidade:** BAIXA -- Nomenclatura, nao logica.

### 2.5 Component Naming: Architecture <-> Frontend Spec

| Componente (Architecture) | Componente (Frontend Spec) | Match? | Observacao |
|--------------------------|---------------------------|:------:|------------|
| `FilterBar` (Kanban/) | `FilterBar` (Kanban/) | SIM | |
| `SearchInput` (ui/) | `SearchBar` (ui/) | DIVERGENCIA | Nomes diferentes |
| `CommentSection` (Kanban/) | `CommentSection` (Kanban/) | SIM | |
| `CommentItem` (Kanban/) | `CommentItem` (ui/) | DIVERGENCIA PASTA | Arch coloca em Kanban/, FS coloca em ui/ |
| `DueDateBadge` (ui/) | `DueDateBadge` (ui/) | SIM | |
| N/A | `DateInput` (ui/) | APENAS FS | Arch nao define componente dedicado |
| N/A | `FilterChip` (ui/) | APENAS FS | Arch nao define componente dedicado |
| N/A | `FilterDropdown` (ui/) | APENAS FS | Arch nao define componente dedicado |
| N/A | `CommentInput` (ui/) | APENAS FS | Arch nao define componente dedicado |

**Observacoes:**

1. **SearchInput vs SearchBar:** A arquitetura chama de `SearchInput`, a frontend spec de `SearchBar`. Recomendacao: usar `SearchBar` (mais descritivo, ja que nao e um input simples).

2. **CommentItem -- Kanban/ vs ui/:** A arquitetura coloca em `Kanban/`, a frontend spec em `ui/`. Recomendacao: `ui/` (e um componente presentational reutilizavel, nao especifico do Kanban).

3. **Componentes extras na Frontend Spec:** A frontend spec define `DateInput`, `FilterChip`, `FilterDropdown` e `CommentInput` que a arquitetura nao menciona explicitamente (referencia genericamente como "campo de input" e "campo de busca"). Isso e normal -- a frontend spec detalha atomos/moleculas que a arquitetura trata como implementacao interna.

**Severidade:** BAIXA -- O Dex deve seguir a nomenclatura da Frontend Spec para componentes, pois e mais completa e granular.

### 2.6 Sprint 1 Patterns -> Sprint 2 Continuidade

| Padrao Sprint 1 | Mantido no Sprint 2? | Evidencia |
|-----------------|:--------------------:|-----------|
| CSS Modules para novos componentes | SIM | Todos os novos componentes tem `.module.css` |
| Zustand para state management | SIM | Filtros e comments no Zustand |
| Zod para validacao | SIM | `createCommentSchema` definido |
| Optimistic updates com rollback | SIM | Comments CRUD usa mesmo padrao |
| PT-BR em toda a UI | SIM | Labels, mensagens, placeholders em PT-BR |
| API routes com Supabase server client | SIM | Comments API segue mesmo padrao |
| JSDoc para tipagem | SIM | Typedefs de Comment definidos |
| `lucide-react` para icones | SIM | Calendar, Clock, AlertCircle, Search |
| Float positioning para tasks | SIM | Nao alterado |
| Design tokens em globals.css | SIM | Novos tokens complementam existentes |
| Feature-based folder structure | SIM | ui/ para atomos, Kanban/ para organismos |

**Resultado:** Sprint 2 segue 100% dos padroes estabelecidos no Sprint 1.

---

## 3. Validacao de Completude

### 3.1 Gaps Identificados

| # | Gap | Severidade | Documento Afetado | Recomendacao |
|---|-----|:----------:|-------------------|-------------|
| G1 | **Filtro "Sem responsavel" nao detalhado na arquitetura** | BAIXA | Architecture S2, secao 5 | O PRD US-3.5 pede "opcao Sem responsavel". A frontend spec cobre (FilterDropdown). A arch deve adicionar: `if (filters.assignee === '__none__') tasks = tasks.filter(t => !t.assignee)`. O Dex pode implementar diretamente. |
| G2 | **Selecao de autor de comentario nao detalhada na frontend spec** | BAIXA | Frontend Spec S2 | A arch (secao 6.5) explica que `author` vem de TEAM_MEMBERS dropdown. A frontend spec mostra `CommentInput` mas nao detalha o seletor de autor. O Dex deve adicionar um Select de autor acima ou dentro do CommentInput, reutilizando TEAM_MEMBERS. |
| G3 | **Edicao de comentario nao prevista** | INFO | Ambos | Nenhum documento preve edicao (PATCH) de comentarios. Isso e aceitavel para o MVP de comentarios (secao 1 da arch). Pode ser adicionado no Sprint 3. |
| G4 | **Deletar comentario -- UI nao especificada na frontend spec** | BAIXA | Frontend Spec S2 | A arch (secao 6.4) descreve fluxo de delete com confirmacao, mas a frontend spec nao mostra botao de delete no CommentItem. O Dex deve adicionar um IconButton de lixeira no CommentItem (visivel no hover, similar ao padrao de delete de tasks). |
| G5 | **Hook useDebounce -- duplicidade de abordagem** | INFO | Architecture S2 vs Frontend Spec S2 | A arch sugere `src/hooks/useDebounce.js` como hook generico. A frontend spec implementa debounce diretamente dentro do SearchBar com `useRef`. Ambas funcionam. Recomendacao: criar o hook generico (util para reuso futuro) e usa-lo no SearchBar. |

### 3.2 Dependencias entre Features Identificadas

```
Fase 0: Infraestrutura de Testes
  └── Nenhuma dependencia

Fase 1: Schema + API de Comentarios
  ├── Depende de: Schema Sprint 1 (tabela tasks existe)
  └── Depende de: validators.js (adicionar createCommentSchema)

Fase 2: Utilitarios (dateUtils, useDebounce)
  └── Nenhuma dependencia

Fase 3: Store Changes (filtros + comentarios)
  ├── Depende de: useUIStore (ou novo useFilterStore)
  ├── Depende de: useBoardStore
  └── Depende de: API de comentarios (Fase 1)

Fase 4: Componentes de Filtros
  ├── Depende de: Store Changes (Fase 3)
  └── Depende de: Design tokens em globals.css

Fase 5: Componentes de Due Date
  ├── Depende de: dateUtils (Fase 2)
  └── Depende de: Design tokens em globals.css

Fase 6: Sistema de Comentarios na UI
  ├── Depende de: Store Changes (Fase 3)
  └── Depende de: API de comentarios (Fase 1)

Fase 7: Testes e Polish
  └── Depende de: Todas as fases anteriores
```

O plano de migracao da arquitetura (secao 10) ja contempla esta ordem corretamente.

---

## 4. Validacao de Integridade Tecnica

### 4.1 Validators -- Compatibilidade

O `createCommentSchema` proposto na arquitetura:
```javascript
export const createCommentSchema = z.object({
  author: z.string().min(1, 'Autor e obrigatorio').max(100),
  content: z.string().min(1, 'Conteudo e obrigatorio').max(5000),
});
```

E compativel com o schema SQL da tabela `task_comments`:
- `author VARCHAR(100) NOT NULL` -- alinhado com `.max(100)` e `.min(1)`
- `content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 5000)` -- alinhado com `.min(1).max(5000)`

**Resultado:** Validacao Zod e constraint SQL estao perfeitamente alinhados.

### 4.2 Constants -- Necessidade de Atualizacao

O arquivo `src/lib/constants.js` atual tem TEAM_MEMBERS, TASK_TYPES, TASK_PRIORITIES, COLUMN_COLOR_MAP. A arquitetura menciona adicionar `COMMENT_AUTHOR_KEY` para localStorage. Isso e um detalhe menor -- o Dex pode adicionar durante implementacao.

### 4.3 Store -- Compatibilidade com Codigo Existente

O `useBoardStore.js` atual:
- Ja tem `getTasksByColumn()` -- pode ser facilmente complementado com `getFilteredTasksByColumn()`
- Ja tem `deleteTask()` -- precisa ser estendido para limpar `commentsCache`
- Ja importa `useUIStore` para toasts -- consistente com a proposta de ler filtros de la

O `useUIStore.js` atual:
- Tem espaco para adicionar `filters` + `setFilter` + `clearFilters` + `hasActiveFilters`
- Nao conflita com nada existente

**Resultado:** As adicoes propostas sao retro-compativeis com o codigo existente.

---

## 5. Sugestao de Breakdown em Epicos/Stories para Sprint 2

### Epico S2.1: Sistema de Filtros e Busca

| Story | Titulo | Prioridade | Estimativa | Dependencias |
|-------|--------|:----------:|:----------:|:------------:|
| S2.1.1 | Adicionar state de filtros ao store (useUIStore ou useFilterStore) | MUST | 2h | Nenhuma |
| S2.1.2 | Implementar `getFilteredTasksByColumn` no useBoardStore | MUST | 2h | S2.1.1 |
| S2.1.3 | Criar componentes atomicos (FilterChip, FilterDropdown, SearchBar) | MUST | 6h | S2.1.1 |
| S2.1.4 | Criar FilterBar (organismo) + integrar no Board.js | MUST | 4h | S2.1.2, S2.1.3 |
| S2.1.5 | Atualizar Column.js para usar getFilteredTasksByColumn + contagem | MUST | 2h | S2.1.2, S2.1.4 |
| S2.1.6 | Adicionar filtro "Sem responsavel" | SHOULD | 1h | S2.1.4 |

### Epico S2.2: Due Date Funcional

| Story | Titulo | Prioridade | Estimativa | Dependencias |
|-------|--------|:----------:|:----------:|:------------:|
| S2.2.1 | Criar `dateUtils.js` (getDueDateStatus, formatDueDateShort, getDueDateLabel) | MUST | 1h | Nenhuma |
| S2.2.2 | Criar componentes DateInput e DueDateBadge | MUST | 3h | S2.2.1 |
| S2.2.3 | Adicionar DueDateBadge ao Card.js + borda overdue | MUST | 2h | S2.2.2 |
| S2.2.4 | Adicionar DateInput ao TaskForm.js e TaskModal.js | MUST | 2h | S2.2.2 |
| S2.2.5 | Adicionar tokens de due date ao globals.css | MUST | 0.5h | Nenhuma |

### Epico S2.3: Comentarios Basicos

| Story | Titulo | Prioridade | Estimativa | Dependencias |
|-------|--------|:----------:|:----------:|:------------:|
| S2.3.1 | Criar migration SQL (tabela task_comments + indices) | MUST | 1h | Nenhuma |
| S2.3.2 | Adicionar createCommentSchema ao validators.js | MUST | 0.5h | Nenhuma |
| S2.3.3 | Criar API routes (GET, POST, DELETE comments) | MUST | 3h | S2.3.1, S2.3.2 |
| S2.3.4 | Adicionar actions de comentarios ao useBoardStore | MUST | 3h | S2.3.3 |
| S2.3.5 | Criar componentes CommentItem, CommentInput, CommentSection | MUST | 4h | S2.3.4 |
| S2.3.6 | Integrar CommentSection no TaskModal.js | MUST | 2h | S2.3.5 |
| S2.3.7 | Seletor de autor de comentario (dropdown TEAM_MEMBERS) | SHOULD | 1h | S2.3.5 |

### Epico S2.4: Infraestrutura de Testes

| Story | Titulo | Prioridade | Estimativa | Dependencias |
|-------|--------|:----------:|:----------:|:------------:|
| S2.4.1 | Setup Vitest + Testing Library + jsdom | MUST | 1h | Nenhuma |
| S2.4.2 | Testes unitarios: validators.js (incluindo createCommentSchema) | MUST | 1h | S2.4.1 |
| S2.4.3 | Testes unitarios: dateUtils.js | MUST | 1h | S2.4.1, S2.2.1 |
| S2.4.4 | Testes unitarios: useUIStore (filtros) | MUST | 1h | S2.4.1, S2.1.1 |
| S2.4.5 | Testes unitarios: useBoardStore (getFilteredTasksByColumn) | SHOULD | 2h | S2.4.1, S2.1.2 |
| S2.4.6 | Testes de componente: Card, FilterBar, Badge | SHOULD | 3h | S2.4.1 |
| S2.4.7 | Coverage report funcional | SHOULD | 0.5h | S2.4.1 |

### Estimativa Total Sprint 2

| Epico | Estimativa |
|-------|:----------:|
| S2.1 Filtros e Busca | ~17h |
| S2.2 Due Date | ~8.5h |
| S2.3 Comentarios | ~14.5h |
| S2.4 Testes | ~9.5h |
| **TOTAL** | **~49.5h** |

---

## 6. Resumo de Divergencias e Acoes

| # | Tipo | Descricao | Acao Necessaria | Responsavel |
|---|------|-----------|-----------------|:-----------:|
| D1 | Nomenclatura | Status due date: `this-week` (arch) vs `soon` (FS) | Usar `soon` | Dex |
| D2 | Nomenclatura | `SearchInput` (arch) vs `SearchBar` (FS) | Usar `SearchBar` | Dex |
| D3 | Nomenclatura | Tokens `--due-week-*` (arch) vs `--due-soon-*` (FS) | Usar `--due-soon-*` | Dex |
| D4 | Estrutura | Filtros single-select (arch) vs multi-select (FS) | Usar multi-select (FS) | Dex |
| D5 | Pasta | CommentItem em Kanban/ (arch) vs ui/ (FS) | Usar ui/ | Dex |
| D6 | Gap | Filtro "Sem responsavel" nao detalhado na arch | Implementar conforme FS | Dex |
| D7 | Gap | Seletor de autor no CommentInput nao detalhado na FS | Implementar dropdown TEAM_MEMBERS | Dex |
| D8 | Gap | Botao delete no CommentItem nao visualizado na FS | Adicionar IconButton lixeira no hover | Dex |

**Regra de ouro para o Dex:** Quando houver divergencia entre Architecture e Frontend Spec:
- **Logica de dados/API/store** -> seguir Architecture
- **Nomenclatura de componentes/tokens/visual** -> seguir Frontend Spec

---

## 7. Checklist de Pre-Implementacao

Antes de iniciar o Sprint 2, verificar:

- [x] PRD Sprint 2 features todas cobertas pelos documentos
- [x] Architecture Sprint 2 e tecnicamente consistente com Sprint 1
- [x] Frontend Spec Sprint 2 e visualmente consistente com Sprint 1
- [x] Schema changes sao aditivos (nao quebram Sprint 1)
- [x] Novos tokens nao conflitam com globals.css existente
- [x] Padroes Sprint 1 mantidos (CSS Modules, Zustand, Zod, optimistic updates)
- [x] Dependencias de teste sao devDependencies (nao afetam bundle)
- [x] Plano de migracao respeita ordem de dependencias
- [ ] Divergencias D1-D8 comunicadas ao Dex antes da implementacao

---

## 8. Atualizacoes Necessarias em Documentos Auxiliares

### 8.1 source-tree.md -- Atualizar com Sprint 2

O arquivo `docs/source-tree.md` atual cobre apenas Sprint 1. Precisa de secao adicional para Sprint 2. Ver secao abaixo.

### 8.2 tech-stack.md -- Atualizar com Sprint 2

O arquivo `docs/tech-stack.md` atual lista pacotes do Sprint 1. Precisa adicionar devDependencies de teste. Ver secao abaixo.

---

> **Documento preparado por Pax (Product Owner Agent)**
> **Validacao cruzada de documentos de Sprint 2 do O2 Kanban**
> **Fevereiro 2026**
