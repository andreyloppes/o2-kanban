# O2 Kanban -- Especificacao Frontend (Sprint 2: Usability)

> **Documento:** Frontend Design Specification -- Sprint 2
> **Projeto:** O2 Kanban -- Sprint 2 "Usability"
> **Fase:** Phase 2 -- Frontend Design Specification
> **Data:** 20 de Fevereiro de 2026
> **Autora:** Uma (UX/UI Design Expert Agent)
> **Versao:** 1.0
> **Baseado em:** Sprint 1 completo (CRUD, DnD, sidebar/column collapse, toasts) + globals.css existente
> **Pre-requisito:** `docs/frontend-spec.md` (Sprint 1) totalmente implementado

---

## Indice

1. [Novos Design Tokens](#1-novos-design-tokens)
2. [Novos Componentes (Atomic Design)](#2-novos-componentes-atomic-design)
3. [Componentes Modificados](#3-componentes-modificados)
4. [Padroes de Interacao](#4-padroes-de-interacao)
5. [Estados dos Componentes](#5-estados-dos-componentes)
6. [Estrategia Responsiva](#6-estrategia-responsiva)
7. [ASCII Wireframes](#7-ascii-wireframes)
8. [Acessibilidade](#8-acessibilidade)
9. [Resumo de Entregaveis](#9-resumo-de-entregaveis)

---

## 1. Novos Design Tokens

Todos os tokens abaixo **complementam** os existentes em `globals.css`. Nenhum token existente sera alterado. A nomenclatura segue o padrao `--prefixo-contexto` ja estabelecido no Sprint 1.

### 1.1 Filter Bar

```css
/* Filter Bar */
--filter-bg: var(--bg-surface);                     /* Fundo da barra de filtros */
--filter-border: var(--border);                      /* Borda inferior da barra */
--filter-chip-bg: rgba(139, 92, 246, 0.12);         /* Fundo do chip ativo (roxo translucido) */
--filter-chip-bg-hover: rgba(139, 92, 246, 0.2);    /* Hover do chip */
--filter-chip-text: #a78bfa;                         /* Texto do chip (roxo claro) */
--filter-chip-border: rgba(139, 92, 246, 0.3);      /* Borda do chip */
--filter-chip-remove: var(--text-muted);             /* Cor do X do chip */
--filter-chip-remove-hover: var(--text-primary);     /* Hover do X do chip */
--filter-dropdown-bg: var(--bg-elevated);            /* Fundo do dropdown de filtro */
--filter-dropdown-shadow: 0 8px 24px rgba(0, 0, 0, 0.4); /* Sombra do dropdown */
--filter-active-indicator: var(--color-progress);    /* Cor do indicador de filtros ativos */
--filter-count-bg: rgba(139, 92, 246, 0.15);        /* Fundo do badge de contagem */
--filter-count-text: var(--color-progress);          /* Texto do badge de contagem */
```

### 1.2 Due Date Indicators

```css
/* Due Date */
--due-overdue-bg: rgba(239, 68, 68, 0.12);          /* Fundo badge vencido */
--due-overdue-text: var(--color-danger);             /* Texto badge vencido (#ef4444) */
--due-overdue-border: rgba(239, 68, 68, 0.3);       /* Borda badge vencido */
--due-overdue-accent: var(--color-danger);           /* Borda esquerda do card vencido */

--due-today-bg: rgba(245, 158, 11, 0.12);           /* Fundo badge "hoje" */
--due-today-text: var(--color-warning);              /* Texto badge "hoje" (#f59e0b) */
--due-today-border: rgba(245, 158, 11, 0.3);        /* Borda badge "hoje" */

--due-soon-bg: rgba(99, 102, 241, 0.12);            /* Fundo badge "esta semana" */
--due-soon-text: var(--color-info);                  /* Texto badge "esta semana" (#6366f1) */
--due-soon-border: rgba(99, 102, 241, 0.3);         /* Borda badge "esta semana" */

--due-future-bg: rgba(107, 114, 128, 0.1);          /* Fundo badge futuro (>7 dias) */
--due-future-text: var(--text-muted);                /* Texto badge futuro */
--due-future-border: rgba(107, 114, 128, 0.2);      /* Borda badge futuro */
```

### 1.3 Comment Section

```css
/* Comments */
--comment-bg: var(--bg-card);                        /* Fundo de cada comentario */
--comment-border: var(--border);                     /* Separador entre comentarios */
--comment-input-bg: var(--input-bg);                 /* Fundo do campo de comentario */
--comment-avatar-size: 32px;                         /* Tamanho do avatar no comentario */
--comment-timestamp: var(--text-muted);              /* Cor do timestamp */
--comment-author: var(--text-primary);               /* Cor do nome do autor */
--comment-content: var(--text-secondary);            /* Cor do conteudo do comentario */
--comment-section-max-height: 320px;                 /* Altura maxima da lista de comentarios */
```

### 1.4 Search Input

```css
/* Search */
--search-bg: var(--bg-card);                         /* Fundo do campo de busca */
--search-bg-focus: var(--bg-elevated);               /* Fundo do campo ao focar */
--search-icon: var(--text-muted);                    /* Cor do icone de busca */
--search-icon-focus: var(--text-secondary);          /* Cor do icone ao focar */
--search-shortcut-bg: rgba(107, 114, 128, 0.15);    /* Fundo da hint de atalho (Ctrl+K) */
--search-shortcut-text: var(--text-muted);           /* Texto da hint de atalho */
--search-shortcut-border: rgba(107, 114, 128, 0.3); /* Borda da hint de atalho */
--search-width: 280px;                               /* Largura do campo de busca */
--search-width-focus: 360px;                         /* Largura expandida ao focar */
```

### 1.5 Layout (Novos)

```css
/* Layout - Sprint 2 */
--filter-bar-height: auto;                           /* Altura dinamica (conteudo) */
--filter-bar-padding: var(--space-3) var(--space-6); /* Padding interno da barra */
--z-filter-dropdown: 950;                            /* Z-index do dropdown de filtro (abaixo de modal) */
```

> **Nota:** Reutilizamos `--z-dropdown: 900` (Sprint 1) como base. O dropdown de filtro usa 950 para ficar acima de dropdowns comuns mas abaixo do modal (1000).

---

## 2. Novos Componentes (Atomic Design)

### Estrutura de Pastas (Novos Arquivos Sprint 2)

```
src/components/
  ui/                            <-- Atomos e Moleculas reutilizaveis
    DateInput.js                 + DateInput.module.css         [NOVO]
    FilterChip.js                + FilterChip.module.css        [NOVO]
    DueDateBadge.js              + DueDateBadge.module.css      [NOVO]
    SearchBar.js                 + SearchBar.module.css         [NOVO]
    FilterDropdown.js            + FilterDropdown.module.css    [NOVO]
    CommentItem.js               + CommentItem.module.css       [NOVO]
    CommentInput.js              + CommentInput.module.css      [NOVO]
  Kanban/                        <-- Organismos do Kanban
    FilterBar.js                 + FilterBar.module.css         [NOVO]
    CommentSection.js            + CommentSection.module.css    [NOVO]
    Board.js                     (existente, sera MODIFICADO)
    Card.js                      (existente, sera MODIFICADO)
    Column.js                    (existente, sera MODIFICADO)
    TaskModal.js                 (existente, sera MODIFICADO)
    TaskForm.js                  (existente, sera MODIFICADO)
```

---

### 2.1 ATOMOS

#### 2.1.1 DateInput -- Campo de Data

**Arquivo:** `src/components/ui/DateInput.js` + `DateInput.module.css`

**Descricao:** Campo de input de data estilizado de forma consistente com o sistema de design existente. Utiliza o input nativo `type="date"` para garantir acessibilidade e suporte a pickers nativos do sistema operacional, com customizacao visual para manter coerencia com o tema dark.

**Props:**
| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `id` | `string` | `undefined` | ID para associacao com label |
| `value` | `string` | `""` | Data no formato `YYYY-MM-DD` |
| `onChange` | `function` | required | Handler de mudanca `(e) => ...` |
| `placeholder` | `string` | `"Selecionar data"` | Texto quando vazio |
| `min` | `string` | `undefined` | Data minima permitida (YYYY-MM-DD) |
| `max` | `string` | `undefined` | Data maxima permitida (YYYY-MM-DD) |
| `error` | `boolean` | `false` | Estado de erro visual |
| `disabled` | `boolean` | `false` | Estado desabilitado |
| `clearable` | `boolean` | `true` | Exibe botao X para limpar a data |

**Composicao Interna:**
```
+-----------------------------------------------+
| [CalendarIcon]  15/03/2026              [X]    |
+-----------------------------------------------+
```

- Icone `Calendar` (lucide-react, 16px) a esquerda
- Data formatada em PT-BR (dd/mm/aaaa) como label visual
- Input nativo `type="date"` posicionado sobre o container (opacity: 0) para captura de interacao
- Botao X (clear) visivel apenas quando ha data selecionada e `clearable=true`

**Estilos:**
```css
.dateInput {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  height: var(--input-height);
  padding: var(--space-2) var(--space-3);
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: var(--input-radius);
  color: var(--input-text);
  font-size: 0.875rem;
  cursor: pointer;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}

.dateInput:hover:not(.disabled) {
  background: var(--input-bg-hover);
}

.dateInput:focus-within {
  border-color: var(--input-border-focus);
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15);
}

.dateInput.error {
  border-color: var(--input-border-error);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.15);
}

.dateInput.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.calendarIcon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.dateLabel {
  flex: 1;
  color: var(--input-text);
}

.datePlaceholder {
  color: var(--input-placeholder);
}

.nativeInput {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
}

.nativeInput::-webkit-calendar-picker-indicator {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.clearBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
  z-index: 2; /* Acima do input nativo para capturar click */
}

.clearBtn:hover {
  color: var(--text-primary);
  background: var(--bg-elevated);
}
```

**Comportamento:**
- Ao clicar no container, o picker nativo do sistema abre
- Se o browser nao suportar `type="date"` adequadamente, o input aceita digitacao manual no formato YYYY-MM-DD
- O botao clear impede a propagacao do click para nao abrir o picker ao limpar
- `onChange` recebe o evento padrao do input (e.target.value no formato YYYY-MM-DD)

---

#### 2.1.2 FilterChip -- Chip de Filtro Ativo

**Arquivo:** `src/components/ui/FilterChip.js` + `FilterChip.module.css`

**Descricao:** Pequeno pill/badge que representa um filtro ativo. Exibe o tipo do filtro e o valor selecionado, com botao X para remover. Usado dentro da FilterBar para dar feedback visual dos filtros aplicados.

**Props:**
| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `label` | `string` | required | Texto do chip (ex: "Bug", "Urgente", "Andrey") |
| `category` | `string` | `undefined` | Categoria do filtro (ex: "Tipo", "Prioridade") |
| `onRemove` | `function` | required | Handler ao clicar no X para remover |
| `icon` | `ReactNode` | `undefined` | Icone opcional a esquerda |

**Composicao Interna:**
```
+-------------------------------+
| [icon?]  Tipo: Bug      [X]  |
+-------------------------------+
```

- Se `category` fornecido: exibe como "Categoria: Label"
- Se sem `category`: exibe apenas "Label"
- Icone opcional a esquerda (ex: icone do tipo de task)
- Botao X a direita para remover

**Estilos:**
```css
.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 0.2rem var(--space-2) 0.2rem var(--space-3);
  background: var(--filter-chip-bg);
  border: 1px solid var(--filter-chip-border);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--filter-chip-text);
  white-space: nowrap;
  transition: background var(--transition-fast);
  max-width: 200px;
}

.chip:hover {
  background: var(--filter-chip-bg-hover);
}

.chipIcon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.chipCategory {
  color: var(--text-muted);
  font-weight: 400;
}

.chipLabel {
  overflow: hidden;
  text-overflow: ellipsis;
}

.removeBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  color: var(--filter-chip-remove);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
  padding: 0;
}

.removeBtn:hover {
  color: var(--filter-chip-remove-hover);
  background: rgba(255, 255, 255, 0.1);
}
```

---

#### 2.1.3 DueDateBadge -- Badge de Data de Entrega

**Arquivo:** `src/components/ui/DueDateBadge.js` + `DueDateBadge.module.css`

**Descricao:** Badge que exibe a data de entrega de uma tarefa com codificacao visual por cor baseada na urgencia. Nao renderiza nada se `dueDate` for `null` ou `undefined`.

**Props:**
| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `dueDate` | `string \| null` | `null` | Data no formato ISO (YYYY-MM-DD). `null` = nao renderiza |
| `size` | `"sm" \| "md"` | `"sm"` | Tamanho do badge |

**Logica de Classificacao:**
```javascript
function getDueDateStatus(dueDate) {
  if (!dueDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + 'T00:00:00');
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';     // Vencido
  if (diffDays === 0) return 'today';      // Hoje
  if (diffDays <= 7) return 'soon';        // Esta semana (1-7 dias)
  return 'future';                          // Mais de 7 dias
}
```

**Mapeamento Visual:**

| Status | Label | Icone (lucide) | Cor Texto | Cor BG | Cor Borda |
|--------|-------|----------------|-----------|--------|-----------|
| `overdue` | "Vencido" ou "Vencido ha X dias" | `AlertCircle` (14px) | `--due-overdue-text` | `--due-overdue-bg` | `--due-overdue-border` |
| `today` | "Hoje" | `Clock` (14px) | `--due-today-text` | `--due-today-bg` | `--due-today-border` |
| `soon` | "Em X dias" ou data "dd/mm" | `Calendar` (14px) | `--due-soon-text` | `--due-soon-bg` | `--due-soon-border` |
| `future` | Data "dd/mm" | `Calendar` (14px) | `--due-future-text` | `--due-future-bg` | `--due-future-border` |

**Formato da label:**
- `overdue`: "Vencido" (se 1 dia) ou "Vencido ha N dias" (se >1 dia). Em `size="sm"`: apenas "Vencido"
- `today`: "Hoje"
- `soon`: "Em N dias" (N = 1..7). Em `size="sm"`: "dd/mm"
- `future`: "dd/mm" (formato curto)

**Estilos:**
```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
  letter-spacing: 0.3px;
  border: 1px solid;
  white-space: nowrap;
}

.sm {
  font-size: 0.6rem;
  padding: 0.1rem 0.4rem;
}

.sm .icon {
  width: 12px;
  height: 12px;
}

.md .icon {
  width: 14px;
  height: 14px;
}

.overdue {
  background: var(--due-overdue-bg);
  color: var(--due-overdue-text);
  border-color: var(--due-overdue-border);
}

.today {
  background: var(--due-today-bg);
  color: var(--due-today-text);
  border-color: var(--due-today-border);
}

.soon {
  background: var(--due-soon-bg);
  color: var(--due-soon-text);
  border-color: var(--due-soon-border);
}

.future {
  background: var(--due-future-bg);
  color: var(--due-future-text);
  border-color: var(--due-future-border);
}
```

---

### 2.2 MOLECULAS

#### 2.2.1 SearchBar -- Barra de Busca

**Arquivo:** `src/components/ui/SearchBar.js` + `SearchBar.module.css`

**Descricao:** Campo de busca com icone, debounce de 300ms, botao de limpar e hint de atalho de teclado (Ctrl+K / Cmd+K). Usado no header do board dentro da FilterBar.

**Props:**
| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `value` | `string` | `""` | Valor controlado do campo |
| `onChange` | `function` | required | Handler chamado apos debounce (recebe string) |
| `placeholder` | `string` | `"Buscar tarefas..."` | Texto placeholder |
| `debounceMs` | `number` | `300` | Tempo de debounce em ms |

**Composicao Interna:**
```
Estado vazio:
+-------------------------------------------+
| [SearchIcon]  Buscar tarefas...   [Ctrl+K] |
+-------------------------------------------+

Estado com texto:
+-------------------------------------------+
| [SearchIcon]  analise vertic        [X]    |
+-------------------------------------------+
```

- Icone `Search` (lucide-react, 16px) a esquerda, fixo
- Input de texto no centro
- Quando vazio: exibe badge de atalho "Ctrl+K" (ou "Cmd+K" no Mac) a direita
- Quando com texto: badge de atalho desaparece, botao X aparece a direita

**Logica Interna:**
```javascript
// Estado interno para valor imediato (antes do debounce)
const [localValue, setLocalValue] = useState(value);
const debouncedRef = useRef(null);

// Debounce
useEffect(() => {
  clearTimeout(debouncedRef.current);
  debouncedRef.current = setTimeout(() => {
    onChange(localValue);
  }, debounceMs);
  return () => clearTimeout(debouncedRef.current);
}, [localValue, debounceMs]);

// Atalho Ctrl+K / Cmd+K
useEffect(() => {
  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      inputRef.current?.focus();
    }
  }
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);
```

**Estilos:**
```css
.searchBar {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: var(--search-width);
  height: var(--input-height-sm);
  padding: 0 var(--space-3);
  background: var(--search-bg);
  border: 1px solid var(--input-border);
  border-radius: var(--radius-md);
  transition: width var(--transition), border-color var(--transition-fast),
              background var(--transition-fast), box-shadow var(--transition-fast);
}

.searchBar:focus-within {
  width: var(--search-width-focus);
  border-color: var(--input-border-focus);
  background: var(--search-bg-focus);
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15);
}

.searchIcon {
  color: var(--search-icon);
  flex-shrink: 0;
  transition: color var(--transition-fast);
}

.searchBar:focus-within .searchIcon {
  color: var(--search-icon-focus);
}

.searchInput {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--input-text);
  font-size: 0.8rem;
  font-family: inherit;
  outline: none;
  min-width: 0;
}

.searchInput::placeholder {
  color: var(--input-placeholder);
}

.shortcutHint {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0.1rem 0.35rem;
  background: var(--search-shortcut-bg);
  border: 1px solid var(--search-shortcut-border);
  border-radius: var(--radius-sm);
  font-size: 0.65rem;
  font-weight: 500;
  color: var(--search-shortcut-text);
  white-space: nowrap;
  flex-shrink: 0;
  pointer-events: none;
}

.clearBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
  padding: 0;
}

.clearBtn:hover {
  color: var(--text-primary);
  background: var(--bg-elevated);
}
```

---

#### 2.2.2 FilterDropdown -- Dropdown com Multi-select

**Arquivo:** `src/components/ui/FilterDropdown.js` + `FilterDropdown.module.css`

**Descricao:** Dropdown que abre abaixo de um botao trigger, com checkboxes para selecao multipla. Usado para filtrar por tipo, prioridade e responsavel.

**Props:**
| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `label` | `string` | required | Label do botao trigger (ex: "Tipo", "Prioridade") |
| `icon` | `ReactNode` | `undefined` | Icone opcional no trigger |
| `options` | `Array<{value, label, icon?, color?}>` | `[]` | Opcoes disponiveis |
| `selected` | `Array<string>` | `[]` | Valores selecionados |
| `onChange` | `function` | required | Handler (recebe array de valores selecionados) |
| `multiple` | `boolean` | `true` | Permitir selecao multipla |

**Composicao Interna:**

```
Trigger (fechado):
+---------------------+
| [Icon] Tipo  [v] [2] |    <- [2] = badge com count de selecionados
+---------------------+

Dropdown (aberto):
+---------------------+
| [Icon] Tipo  [^] [2] |
+---------------------+
| [x] Tarefa           |
| [ ] User Story       |
| [x] Bug              |
| [ ] Epico            |
| [ ] Spike            |
|---------------------|
| Limpar selecao       |
+---------------------+
```

- Trigger e um botao estilizado como input compacto
- Badge numerico ao lado do trigger mostra quantidade de opcoes selecionadas (oculto quando 0)
- Dropdown abre abaixo com lista de checkboxes
- Cada opcao pode ter icone e/ou cor a esquerda
- Botao "Limpar selecao" no rodape do dropdown (visivel apenas quando ha selecao)
- Click fora fecha o dropdown
- Escape fecha o dropdown

**Estilos:**
```css
.wrapper {
  position: relative;
  display: inline-flex;
}

.trigger {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: var(--input-height-sm);
  padding: 0 var(--space-3);
  background: var(--bg-card);
  border: 1px solid var(--input-border);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: inherit;
  white-space: nowrap;
}

.trigger:hover {
  border-color: var(--border-hover);
  background: var(--input-bg-hover);
  color: var(--text-primary);
}

.triggerOpen {
  border-color: var(--input-border-focus);
  background: var(--input-bg-hover);
  color: var(--text-primary);
}

.triggerIcon {
  display: flex;
  align-items: center;
  color: var(--text-muted);
}

.chevron {
  color: var(--text-muted);
  transition: transform var(--transition-fast);
}

.chevronOpen {
  transform: rotate(180deg);
}

.countBadge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: var(--filter-count-bg);
  color: var(--filter-count-text);
  border-radius: var(--radius-full);
  font-size: 0.65rem;
  font-weight: 600;
}

.dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 200px;
  max-width: 280px;
  background: var(--filter-dropdown-bg);
  border: 1px solid var(--border-hover);
  border-radius: var(--radius-md);
  box-shadow: var(--filter-dropdown-shadow);
  z-index: var(--z-filter-dropdown);
  max-height: 280px;
  overflow-y: auto;
  padding: var(--space-1);
  animation: dropdownIn var(--transition-fast) ease;
}

.option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--text-secondary);
  transition: background var(--transition-fast);
}

.option:hover {
  background: var(--bg-card);
  color: var(--text-primary);
}

.optionSelected {
  color: var(--text-primary);
}

.checkbox {
  width: 16px;
  height: 16px;
  border: 1.5px solid var(--border-hover);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--transition-fast);
  background: transparent;
}

.checkboxChecked {
  background: var(--accent);
  border-color: var(--accent);
}

.checkIcon {
  color: var(--text-inverse);
}

.optionIcon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.optionColorDot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.clearAction {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2) var(--space-3);
  border-top: 1px solid var(--border);
  margin-top: var(--space-1);
  font-size: 0.75rem;
  color: var(--text-muted);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.clearAction:hover {
  color: var(--text-primary);
}

@keyframes dropdownIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

#### 2.2.3 CommentItem -- Item de Comentario

**Arquivo:** `src/components/ui/CommentItem.js` + `CommentItem.module.css`

**Descricao:** Exibe um unico comentario com avatar do autor, nome, timestamp e conteudo. Componente puramente visual (presentational).

**Props:**
| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `author` | `string` | required | Nome do autor |
| `authorId` | `string` | `undefined` | ID do autor (para cor do avatar) |
| `content` | `string` | required | Conteudo do comentario |
| `timestamp` | `string` | required | Data/hora ISO do comentario |
| `isOptimistic` | `boolean` | `false` | Se `true`, exibe com opacity reduzida (comentario sendo salvo) |

**Composicao Interna:**
```
+-----------------------------------------------+
| [A]  Andrey              20/02/2026 14:30      |
|      Este bug precisa ser corrigido antes do   |
|      deploy de sexta-feira.                    |
+-----------------------------------------------+
```

- Avatar circular com a inicial do nome (reutiliza padrao de avatar do Card)
- Nome do autor em negrito, alinhado a esquerda
- Timestamp a direita do nome, em `--text-muted`
- Conteudo abaixo, com `white-space: pre-wrap` para preservar quebras de linha
- Formato do timestamp: "dd/mm/aaaa HH:mm" (reutiliza `formatDate` do TaskModal)

**Estilos:**
```css
.commentItem {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  transition: opacity var(--transition-fast);
}

.commentItem + .commentItem {
  border-top: 1px solid var(--comment-border);
}

.optimistic {
  opacity: 0.6;
}

.avatar {
  width: var(--comment-avatar-size);
  height: var(--comment-avatar-size);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
  background-color: #3b82f6;
  flex-shrink: 0;
}

.commentBody {
  flex: 1;
  min-width: 0;
}

.commentHeader {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}

.authorName {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--comment-author);
}

.timestamp {
  font-size: 0.7rem;
  color: var(--comment-timestamp);
}

.commentContent {
  font-size: 0.825rem;
  line-height: 1.5;
  color: var(--comment-content);
  white-space: pre-wrap;
  word-break: break-word;
}
```

---

#### 2.2.4 CommentInput -- Campo de Novo Comentario

**Arquivo:** `src/components/ui/CommentInput.js` + `CommentInput.module.css`

**Descricao:** Textarea compacta com botao de enviar para adicionar novos comentarios. O submit pode ser feito via botao ou via `Ctrl+Enter` / `Cmd+Enter`.

**Props:**
| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `onSubmit` | `function` | required | Handler de submit (recebe string do comentario) |
| `placeholder` | `string` | `"Adicionar comentario..."` | Texto placeholder |
| `isSubmitting` | `boolean` | `false` | Estado de carregamento |
| `disabled` | `boolean` | `false` | Desabilita o campo |

**Composicao Interna:**
```
Estado vazio:
+-----------------------------------------------+
| Adicionar comentario...                        |
+-----------------------------------------------+

Estado com texto:
+-----------------------------------------------+
| Este e o meu comentario                        |
|                                                |
+-----------------------------------------------+
|                  Ctrl+Enter para enviar [Enviar]|
+-----------------------------------------------+
```

- Textarea que cresce automaticamente (auto-resize) ate 120px
- Footer aparece quando ha texto digitado
- Hint "Ctrl+Enter para enviar" a esquerda (ou "Cmd+Enter" no Mac)
- Botao "Enviar" a direita (estilo primary compacto)
- Botao desabilitado quando texto vazio ou `isSubmitting=true`
- Apos submit bem-sucedido, limpa o campo

**Logica Interna:**
```javascript
function handleKeyDown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    handleSubmit();
  }
}

function handleSubmit() {
  const trimmed = value.trim();
  if (!trimmed || isSubmitting) return;
  onSubmit(trimmed);
  setValue('');
}
```

**Estilos:**
```css
.commentInputWrapper {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--input-border);
  border-radius: var(--input-radius);
  background: var(--comment-input-bg);
  transition: border-color var(--transition-fast);
  overflow: hidden;
}

.commentInputWrapper:focus-within {
  border-color: var(--input-border-focus);
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15);
}

.textarea {
  width: 100%;
  min-height: 40px;
  max-height: 120px;
  padding: var(--space-2) var(--space-3);
  border: none;
  background: transparent;
  color: var(--input-text);
  font-size: 0.825rem;
  font-family: inherit;
  resize: none;
  outline: none;
  line-height: 1.5;
}

.textarea::placeholder {
  color: var(--input-placeholder);
}

.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-1) var(--space-3) var(--space-2);
  opacity: 0;
  height: 0;
  overflow: hidden;
  transition: opacity var(--transition-fast), height var(--transition-fast);
}

.footerVisible {
  opacity: 1;
  height: auto;
}

.hint {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.submitBtn {
  padding: var(--space-1) var(--space-3);
  background: var(--accent);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast);
  font-family: inherit;
}

.submitBtn:hover:not(:disabled) {
  background: var(--accent-hover);
}

.submitBtn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

### 2.3 ORGANISMOS

#### 2.3.1 FilterBar -- Barra de Filtros do Board

**Arquivo:** `src/components/Kanban/FilterBar.js` + `FilterBar.module.css`

**Descricao:** Container horizontal posicionado entre o board-header e o board-content. Contem a SearchBar, multiplos FilterDropdowns (tipo, prioridade, responsavel), FilterChips ativos e botao "Limpar filtros". Gerencia o estado de filtros componiveis.

**Props:**
| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `filters` | `object` | `{}` | Estado atual dos filtros (vem do store) |
| `onFilterChange` | `function` | required | Handler quando filtros mudam |
| `onSearchChange` | `function` | required | Handler quando busca muda |
| `searchValue` | `string` | `""` | Valor atual da busca |
| `taskCount` | `object` | `{ filtered: 0, total: 0 }` | Contagem para exibir |

**Estrutura do `filters`:**
```javascript
{
  types: [],       // Array<string> ex: ['bug', 'task']
  priorities: [],  // Array<string> ex: ['urgent', 'high']
  assignees: [],   // Array<string> ex: ['andrey', 'felipe']
}
```

**Composicao Interna:**
```
+----------------------------------------------------------------------+
| [SearchBar............]  [Tipo v] [Prioridade v] [Responsavel v]     |
|                                                                      |
| [Tipo: Bug x] [Prioridade: Urgente x] [Resp: Andrey x]  [Limpar td]|
|                                                         12 de 45 tarefas |
+----------------------------------------------------------------------+
```

- Linha 1: SearchBar + FilterDropdowns em row
- Linha 2 (condicional): FilterChips ativos + botao "Limpar todos" + contagem (so aparece quando ha filtros ativos)
- FilterChips sao gerados dinamicamente a partir do estado `filters`

**Logica de Filtragem (sugerida para o store):**
```javascript
// Getter derivado no useBoardStore ou useFilterStore
getFilteredTasks: () => {
  const { tasks } = get();
  const { search, types, priorities, assignees } = filterState;

  return tasks.filter(task => {
    // Busca textual (titulo + descricao)
    if (search) {
      const searchLower = search.toLowerCase();
      const matchTitle = task.title?.toLowerCase().includes(searchLower);
      const matchDesc = task.description?.toLowerCase().includes(searchLower);
      if (!matchTitle && !matchDesc) return false;
    }

    // Filtro por tipo
    if (types.length > 0 && !types.includes(task.type)) return false;

    // Filtro por prioridade
    if (priorities.length > 0 && !priorities.includes(task.priority)) return false;

    // Filtro por responsavel
    if (assignees.length > 0 && !assignees.includes(task.assignee)) return false;

    return true;
  });
}
```

**Estilos:**
```css
.filterBar {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--filter-bar-padding);
  background: var(--filter-bg);
  border-bottom: 1px solid var(--filter-border);
}

.filterRow {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.filterDropdowns {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.chipsRow {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.clearAllBtn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  font-family: inherit;
  white-space: nowrap;
}

.clearAllBtn:hover {
  color: var(--color-danger);
  background: rgba(239, 68, 68, 0.08);
}

.filterInfo {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.filterActiveIndicator {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.indicatorDot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--filter-active-indicator);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
```

---

#### 2.3.2 CommentSection -- Secao de Comentarios no TaskModal

**Arquivo:** `src/components/Kanban/CommentSection.js` + `CommentSection.module.css`

**Descricao:** Secao completa de comentarios dentro do TaskModal. Contem a lista de CommentItems com scroll e o CommentInput no rodape. Os comentarios sao carregados ao abrir o modal e adicionados de forma otimista.

**Props:**
| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `taskId` | `string` | required | ID da tarefa para carregar/adicionar comentarios |
| `comments` | `Array<Comment>` | `[]` | Lista de comentarios |
| `onAddComment` | `function` | required | Handler para adicionar comentario (recebe string) |
| `isLoading` | `boolean` | `false` | Carregando comentarios |

**Estrutura do `Comment`:**
```javascript
{
  id: string,
  task_id: string,
  author: string,        // Nome do autor
  author_id: string,     // ID do autor
  content: string,       // Conteudo do comentario
  created_at: string,    // ISO timestamp
}
```

**Composicao Interna:**
```
+-----------------------------------------------+
| Comentarios (3)                                |
|-----------------------------------------------|
|                                                |
| [A] Andrey            20/02/2026 14:30         |
|     Este bug precisa ser corrigido antes do    |
|     deploy de sexta-feira.                     |
|                                                |
| ---|                                           |
|                                                |
| [F] Felipe            20/02/2026 15:10         |
|     Concordo, vou priorizar.                   |
|                                                |
| ---|                                           |
|                                                |
| [A] Andrey            20/02/2026 15:45         |
|     Perfeito, obrigado!                        |
|                                                |
|-----------------------------------------------|
| [Adicionar comentario...                   ]   |
|                     Ctrl+Enter para enviar [>] |
+-----------------------------------------------+
```

- Header com titulo "Comentarios" e contagem em parenteses
- Lista de CommentItems com scroll vertical (max-height: `--comment-section-max-height`)
- Separador sutil entre comentarios (`border-top`)
- CommentInput fixo no rodape da secao
- Auto-scroll para o final quando novo comentario e adicionado
- Estado vazio: texto "Nenhum comentario ainda. Seja o primeiro!" em italico

**Comportamento de adicao otimista:**
```javascript
async function handleAddComment(content) {
  const optimisticComment = {
    id: `temp-${Date.now()}`,
    task_id: taskId,
    author: currentUser.name,
    author_id: currentUser.id,
    content,
    created_at: new Date().toISOString(),
    _isOptimistic: true,
  };

  // 1. Adiciona otimisticamente
  setLocalComments(prev => [...prev, optimisticComment]);

  // 2. Scroll para o final
  scrollToBottom();

  // 3. Persiste via API
  try {
    const savedComment = await api.addComment(taskId, content);
    // 4. Substitui otimista pelo real
    setLocalComments(prev =>
      prev.map(c => c.id === optimisticComment.id ? savedComment : c)
    );
  } catch (error) {
    // 5. Rollback em caso de erro
    setLocalComments(prev =>
      prev.filter(c => c.id !== optimisticComment.id)
    );
    addToast('Erro ao adicionar comentario', 'error');
  }
}
```

**Estilos:**
```css
.commentSection {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--border);
  padding-top: var(--space-4);
}

.sectionHeader {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.sectionTitle {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.commentCount {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 400;
}

.commentList {
  display: flex;
  flex-direction: column;
  max-height: var(--comment-section-max-height);
  overflow-y: auto;
  padding-right: var(--space-1); /* Espaco para scrollbar */
  margin-bottom: var(--space-3);
}

.commentList::-webkit-scrollbar {
  width: 4px;
}

.commentList::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: var(--radius-sm);
}

.emptyState {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6) var(--space-4);
  color: var(--text-muted);
  font-size: 0.825rem;
  font-style: italic;
}

.loadingState {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6) var(--space-4);
  color: var(--text-muted);
  font-size: 0.825rem;
}
```

---

## 3. Componentes Modificados

### 3.1 Board.js -- Adicionar FilterBar

**Arquivo existente:** `src/components/Kanban/Board.js`

**Alteracao:** Inserir a `FilterBar` entre o `<header>` (board-header) e o `<div class="board-content">`.

**Nova estrutura:**
```jsx
<main className="main-area">
  <header className="board-header">
    {/* ... titulo e avatar group (sem mudancas) ... */}
  </header>

  {/* NOVO: FilterBar */}
  <FilterBar
    filters={filters}
    onFilterChange={handleFilterChange}
    onSearchChange={handleSearchChange}
    searchValue={searchValue}
    taskCount={{ filtered: filteredCount, total: totalCount }}
  />

  <div className="board-content">
    {children}
  </div>
</main>
```

**Estado de filtros:** Sera gerenciado via novo store `useFilterStore` (Zustand) ou slice adicionado ao `useUIStore`. Recomendacao: criar `useFilterStore` separado para manter responsabilidade unica.

**Novo store sugerido -- `useFilterStore.js`:**
```javascript
import { create } from 'zustand';

const useFilterStore = create((set, get) => ({
  search: '',
  types: [],
  priorities: [],
  assignees: [],

  setSearch: (search) => set({ search }),
  setTypes: (types) => set({ types }),
  setPriorities: (priorities) => set({ priorities }),
  setAssignees: (assignees) => set({ assignees }),

  clearAll: () => set({ search: '', types: [], priorities: [], assignees: [] }),

  hasActiveFilters: () => {
    const s = get();
    return s.search !== '' || s.types.length > 0 ||
           s.priorities.length > 0 || s.assignees.length > 0;
  },

  getActiveFilterCount: () => {
    const s = get();
    return s.types.length + s.priorities.length + s.assignees.length +
           (s.search ? 1 : 0);
  },
}));
```

---

### 3.2 Card.js -- Adicionar DueDateBadge e Indicador Visual

**Arquivo existente:** `src/components/Kanban/Card.js`

**Alteracoes:**

1. **Importar e renderizar DueDateBadge** no footer do card, ao lado do avatar
2. **Adicionar borda esquerda colorida** para tasks vencidas (overdue)
3. **Suportar filtragem visual:** cards que nao correspondem ao filtro ficam com `opacity: 0.2` ou `display: none`

**Nova estrutura do Card:**
```jsx
<div
  ref={setNodeRef}
  style={style}
  className={`card ${isDragging ? 'dragging' : ''} ${isOverdue ? 'card-overdue' : ''} ${isFiltered ? 'card-filtered-out' : ''}`}
  role="article"
  aria-label={task.title}
  onClick={handleClick}
  {...attributes}
  {...listeners}
>
  <div className="card-header">
    {getTypeIcon(task.type)}
    <span>{typeLabel}</span>
  </div>

  <p className="card-title">{task.title}</p>

  {(task.priority || task.due_date || (task.tags && task.tags.length > 0)) && (
    <div className="tags-container">
      {task.priority && <Badge priority={task.priority} size="sm" />}
      {task.due_date && <DueDateBadge dueDate={task.due_date} size="sm" />}
      {task.tags && task.tags.map((tag, idx) => (
        <span key={idx} className={`tag tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}>
          {tag}
        </span>
      ))}
    </div>
  )}

  {(task.assignee || task.due_date) && (
    <div className="card-footer">
      <div className="card-meta">
        {/* Espaco reservado para futuros meta items */}
      </div>
      <div className="card-footer-right">
        {task.assignee && (
          <div className="avatar" title={task.assignee} aria-label={`Responsavel: ${task.assignee}`}>
            {task.assignee.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  )}
</div>
```

**Novos estilos CSS para o Card (adicionar ao `kanban.css`):**
```css
/* Card com due date vencido -- borda esquerda vermelha */
.card-overdue {
  border-left: 3px solid var(--due-overdue-accent);
}

/* Card filtrado (nao corresponde ao filtro ativo) */
.card-filtered-out {
  opacity: 0.15;
  pointer-events: none;
  transition: opacity var(--transition);
}

/* Footer com due date */
.card-footer-right {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
```

---

### 3.3 TaskModal.js -- Adicionar Due Date e CommentSection

**Arquivo existente:** `src/components/Kanban/TaskModal.js`

**Alteracoes:**

1. **Adicionar campo `due_date`** usando `DateInput` no grid de formulario (ao lado de Prioridade, ou em nova linha)
2. **Adicionar `CommentSection`** abaixo da secao de metadata
3. **Atualizar o dirty check** para incluir `due_date`
4. **Atualizar `handleSave`** para incluir `due_date` nos updates

**Nova posicao dos campos no body do modal:**
```
Titulo        [Input]
Tipo          [TaskTypeSelector]     Prioridade [PrioritySelector]
Descricao     [Textarea]
Responsavel   [Select]               Data Limite [DateInput]
--- meta section ---
Coluna: Em Progresso
Criado em: 20/02/2026 14:30
--- comment section ---
Comentarios (3)
[CommentItem 1]
[CommentItem 2]
[CommentItem 3]
[CommentInput]
```

**Trecho JSX modificado (body do modal):**
```jsx
<div className={styles.body}>
  {/* ... titulo, tipo, prioridade, descricao (sem mudancas) ... */}

  <div className={styles.formGrid}>
    <FormField label="Responsavel" htmlFor="modal-assignee">
      <Select
        id="modal-assignee"
        value={editAssignee}
        onChange={(e) => setEditAssignee(e.target.value)}
        options={memberOptions}
        placeholder="Sem responsavel"
      />
    </FormField>

    {/* NOVO: Campo de Data Limite */}
    <FormField label="Data Limite" htmlFor="modal-due-date">
      <DateInput
        id="modal-due-date"
        value={editDueDate}
        onChange={(e) => setEditDueDate(e.target.value)}
        clearable
      />
    </FormField>
  </div>

  {/* Meta section (sem mudancas) */}
  <div className={styles.metaSection}>
    {/* ... coluna, criado em ... */}
  </div>

  {/* NOVO: Comment Section */}
  <CommentSection
    taskId={task.id}
    comments={comments}
    onAddComment={handleAddComment}
    isLoading={isLoadingComments}
  />
</div>
```

**Novo estado local:**
```javascript
const [editDueDate, setEditDueDate] = useState('');
const [comments, setComments] = useState([]);
const [isLoadingComments, setIsLoadingComments] = useState(false);

// Sync due_date quando task muda
useEffect(() => {
  if (task) {
    setEditDueDate(task.due_date || '');
    // Carregar comentarios
    loadComments(task.id);
  }
}, [task]);

// Atualizar dirty check
const isDirty = useMemo(() => {
  if (!task) return false;
  return (
    editTitle !== (task.title || '') ||
    editType !== (task.type || 'task') ||
    editPriority !== (task.priority || 'medium') ||
    editDescription !== (task.description || '') ||
    editAssignee !== (task.assignee || '') ||
    editDueDate !== (task.due_date || '')  // NOVO
  );
}, [task, editTitle, editType, editPriority, editDescription, editAssignee, editDueDate]);
```

---

### 3.4 TaskForm.js -- Adicionar Campo de Due Date

**Arquivo existente:** `src/components/Kanban/TaskForm.js`

**Alteracao:** Adicionar campo `DateInput` no formulario de criacao, posicionado abaixo do campo de Responsavel.

**Novo campo na estrutura do form:**
```jsx
<div className={styles.formGrid}>
  <FormField label="Responsavel" htmlFor="task-assignee">
    <Select
      id="task-assignee"
      value={assignee}
      onChange={(e) => setAssignee(e.target.value)}
      options={memberOptions}
      placeholder="Sem responsavel"
    />
  </FormField>

  {/* NOVO: Campo de Data Limite */}
  <FormField label="Data Limite" htmlFor="task-due-date">
    <DateInput
      id="task-due-date"
      value={dueDate}
      onChange={(e) => setDueDate(e.target.value)}
      clearable
    />
  </FormField>
</div>
```

**Novo estado:**
```javascript
const [dueDate, setDueDate] = useState('');

// Reset no form quando abrir
useEffect(() => {
  if (isOpen) {
    // ... resets existentes ...
    setDueDate('');
  }
}, [isOpen]);

// Incluir no submit
const formData = {
  column_id: columnId,
  title: title.trim(),
  type,
  priority,
  description: description.trim() || null,
  assignee: assignee || null,
  due_date: dueDate || null,  // NOVO
};
```

---

### 3.5 Column.js -- Exibir Contagem Filtrada

**Arquivo existente:** `src/components/Kanban/Column.js`

**Alteracao:** Quando filtros estao ativos, exibir a contagem de tasks vissiveis vs total. Exemplo: "2/5" ao inves de apenas "5".

**Trecho modificado:**
```jsx
const tasks = useBoardStore((state) => state.getTasksByColumn(column.id));
const hasActiveFilters = useFilterStore((state) => state.hasActiveFilters());

// Calcular tasks visiveis (que passam no filtro)
const filteredTasks = useMemo(() => {
  if (!hasActiveFilters) return tasks;
  return tasks.filter(task => matchesFilters(task, filterState));
}, [tasks, filterState, hasActiveFilters]);

const taskCount = tasks.length;
const filteredCount = filteredTasks.length;

// No header da coluna:
<span className="task-count">
  {hasActiveFilters ? `${filteredCount}/${taskCount}` : taskCount}
</span>
```

**Novo estilo para contagem filtrada (adicionar ao `kanban.css`):**
```css
.task-count-filtered {
  background-color: var(--filter-count-bg);
  color: var(--filter-count-text);
}
```

---

## 4. Padroes de Interacao

### 4.1 Fluxo de Filtragem por Tipo/Prioridade/Responsavel

```
Usuario clica no botao "Tipo" na FilterBar
  -> FilterDropdown abre abaixo do botao
  -> Exibe lista de opcoes com checkboxes (Tarefa, User Story, Bug, Epico, Spike)
  -> Usuario marca "Bug" e "Epico"
  -> onChange dispara com ['bug', 'epic']
  -> useFilterStore.setTypes(['bug', 'epic'])
  -> Cards que NAO sao Bug nem Epico ficam com opacity 0.15
  -> FilterChips aparecem: [Tipo: Bug x] [Tipo: Epico x]
  -> Contagem na coluna atualiza: "2/5"
  -> Badge no trigger "Tipo" mostra [2]

Usuario clica no X do chip "Tipo: Bug"
  -> useFilterStore.setTypes(['epic'])
  -> Cards de Bug voltam a ficar opacos (nao passam mais no filtro)
  -> Chip removido

Usuario clica "Limpar todos"
  -> useFilterStore.clearAll()
  -> Todos os cards voltam a opacity 1
  -> Chips removidos
  -> Contagem volta ao normal
```

### 4.2 Fluxo de Busca Textual

```
Usuario foca no SearchBar (ou pressiona Ctrl+K / Cmd+K)
  -> SearchBar expande de 280px para 360px
  -> Hint "Ctrl+K" desaparece
  -> Cursor no campo

Usuario digita "analise"
  -> Estado local atualiza imediatamente (responsividade visual)
  -> Debounce de 300ms inicia
  -> Apos 300ms sem digitar: onChange("analise") dispara
  -> useFilterStore.setSearch('analise')
  -> Cards cujo titulo/descricao NAO contem "analise" ficam com opacity 0.15
  -> Contagem atualiza

Usuario clica no X do SearchBar
  -> Campo limpa
  -> useFilterStore.setSearch('')
  -> Cards voltam ao normal

Usuario pressiona Escape com SearchBar focado
  -> Campo perde foco (blur)
  -> SearchBar volta a largura normal (280px)
  -> Se campo vazio: hint "Ctrl+K" reaparece
```

### 4.3 Filtros Compostos (Search + Tipo + Prioridade + Responsavel)

Todos os filtros sao **compostos com logica AND** entre categorias e **OR** dentro de cada categoria:

```
Logica: (search) AND (type1 OR type2) AND (priority1 OR priority2) AND (assignee1 OR assignee2)
```

**Exemplo pratico:**
- Busca: "deploy"
- Tipos: [Bug, Task]
- Prioridades: [Urgent, High]
- Responsaveis: [Andrey]

Resultado: mostra apenas cards que:
1. Contem "deploy" no titulo ou descricao, E
2. Sao do tipo Bug ou Task, E
3. Tem prioridade Urgent ou High, E
4. Estao atribuidos a Andrey

### 4.4 Fluxo de Due Date no Card

```
Card com due_date definido:
  -> DueDateBadge renderiza no tags-container
  -> Cor determinada pela logica de classificacao (overdue/today/soon/future)

Card com due_date vencido (overdue):
  -> DueDateBadge com fundo vermelho e texto "Vencido"
  -> Card recebe borda esquerda vermelha (3px solid --due-overdue-accent)
  -> Visualmente destaca o card como urgente

Card sem due_date:
  -> DueDateBadge nao renderiza
  -> Sem borda esquerda especial
```

### 4.5 Fluxo de Comentarios

```
Usuario abre TaskModal
  -> CommentSection renderiza
  -> Se task tem comentarios: carrega via API (GET /api/tasks/:id/comments)
  -> Loading state: "Carregando comentarios..."
  -> Lista de CommentItems aparece

Usuario digita comentario e pressiona Ctrl+Enter (ou clica "Enviar")
  -> Validacao: texto nao vazio (trim)
  -> Comentario otimista adicionado a lista (opacity 0.6)
  -> Auto-scroll para o final da lista
  -> POST /api/tasks/:id/comments com { content }
  -> Sucesso: comentario otimista substituido pelo real (opacity 1.0)
  -> Erro: comentario otimista removido, toast de erro

Usuario abre task sem comentarios
  -> Estado vazio: "Nenhum comentario ainda. Seja o primeiro!"
  -> CommentInput disponivel para o primeiro comentario
```

### 4.6 Indicador de Filtros Ativos

```
Quando pelo menos um filtro esta ativo (search, types, priorities, assignees):
  -> Linha de chips aparece abaixo dos dropdowns
  -> Cada filtro ativo gera um FilterChip correspondente
  -> Botao "Limpar todos" aparece no final dos chips
  -> Contagem "X de Y tarefas" aparece a direita
  -> Dot pulsante (--filter-active-indicator) ao lado do titulo "Filtros"

Quando todos os filtros sao removidos:
  -> Linha de chips desaparece (com transicao suave)
  -> Contagem desaparece
  -> FilterBar fica apenas com SearchBar + triggers dos dropdowns
```

---

## 5. Estados dos Componentes

### 5.1 DateInput

| Estado | Visual |
|--------|--------|
| **Default** | bg: `--input-bg`, border: `--input-border`, icone calendario cinza, placeholder |
| **Hover** | bg: `--input-bg-hover`, cursor pointer |
| **Focus** | border: `--input-border-focus`, box-shadow green glow, picker nativo abre |
| **Filled** | Data formatada em PT-BR (dd/mm/aaaa), botao X visivel |
| **Error** | border: `--input-border-error`, box-shadow red glow |
| **Disabled** | opacity: 0.5, cursor: not-allowed |

### 5.2 FilterChip

| Estado | Visual |
|--------|--------|
| **Default** | bg: `--filter-chip-bg`, text: `--filter-chip-text`, border: `--filter-chip-border` |
| **Hover** | bg: `--filter-chip-bg-hover` (mais opaco) |
| **Remove hover** | X muda para `--filter-chip-remove-hover`, bg circulo sutil |
| **Appearing** | Animacao fade-in + scale (0.9 -> 1.0) |
| **Removing** | Animacao fade-out + scale (1.0 -> 0.9) |

### 5.3 DueDateBadge

| Estado | Visual |
|--------|--------|
| **Overdue** | bg vermelho translucido, texto "Vencido", icone AlertCircle |
| **Today** | bg laranja translucido, texto "Hoje", icone Clock |
| **Soon** (1-7 dias) | bg indigo translucido, texto "Em N dias", icone Calendar |
| **Future** (>7 dias) | bg cinza translucido, texto "dd/mm", icone Calendar |
| **Null** | Nao renderiza (retorna null) |

### 5.4 SearchBar

| Estado | Visual |
|--------|--------|
| **Default (vazio)** | Largura 280px, icone search cinza, placeholder, hint "Ctrl+K" |
| **Focus (vazio)** | Largura 360px, border verde, icone mais claro, hint desaparece |
| **Typing** | Largura 360px, texto sendo digitado, sem hint |
| **Filled** | Largura 360px, texto completo, botao X visivel a direita |
| **Debouncing** | Visual sem mudanca (debounce e transparente para o usuario) |

### 5.5 FilterDropdown

| Estado | Visual |
|--------|--------|
| **Closed (nenhum selecionado)** | Trigger com label + chevron down, sem badge |
| **Closed (com selecao)** | Trigger com label + badge numerico + chevron down |
| **Open** | Trigger com border focus, chevron rotacionado, dropdown visivel abaixo |
| **Option hover** | bg: `--bg-card`, texto mais claro |
| **Option selected** | Checkbox com bg verde + check branco |
| **Clear visible** | Link "Limpar selecao" no rodape do dropdown |

### 5.6 CommentItem

| Estado | Visual |
|--------|--------|
| **Default** | Avatar + nome + timestamp + conteudo, opacity 1.0 |
| **Optimistic** | Mesma estrutura, opacity 0.6 (salvando) |
| **Error** | Removido da lista (rollback) |

### 5.7 CommentInput

| Estado | Visual |
|--------|--------|
| **Empty** | Textarea compacta (40px), placeholder visivel, footer oculto |
| **Focused (vazio)** | Border verde, footer aparece com hint, botao desabilitado |
| **Typing** | Textarea cresce, footer visivel, botao habilitado |
| **Submitting** | Botao com "Enviando...", textarea desabilitada |
| **Submitted** | Campo limpa, volta ao estado empty |

### 5.8 FilterBar

| Estado | Visual |
|--------|--------|
| **No filters** | Apenas SearchBar + triggers dos dropdowns, sem linha de chips |
| **With filters** | Linha de chips visivel, contagem "X de Y tarefas", dot pulsante |
| **All cleared** | Transicao suave para estado "no filters" |

### 5.9 CommentSection

| Estado | Visual |
|--------|--------|
| **Loading** | Texto "Carregando comentarios..." centralizado |
| **Empty** | Texto "Nenhum comentario ainda. Seja o primeiro!" em italico |
| **With comments** | Lista de CommentItems com scroll, CommentInput no rodape |
| **Adding** | Novo CommentItem aparece (otimista, opacity 0.6) + scroll to bottom |

---

## 6. Estrategia Responsiva

### 6.1 Breakpoints (Reutilizando os Existentes)

| Breakpoint | Range | Alvo |
|-----------|-------|------|
| **Desktop** | > 1024px | Layout completo, todas features |
| **Tablet** | 768px -- 1024px | Layout adaptado, funcional |
| **Mobile** | < 768px | Layout empilhado, filtros em sheet |

### 6.2 FilterBar

| Breakpoint | Comportamento |
|-----------|--------------|
| **Desktop** | Layout horizontal: SearchBar (280px) + dropdowns em row |
| **Tablet** | SearchBar encolhe para 200px, dropdowns empilham se necessario (flex-wrap) |
| **Mobile** | SearchBar ocupa largura total. Dropdowns empilham abaixo. Botao "Filtros" abre um bottom sheet com os dropdowns |

**CSS responsivo da FilterBar:**
```css
@media (max-width: 1024px) {
  .filterRow {
    flex-wrap: wrap;
  }

  .searchBar {
    width: 200px;
  }

  .searchBar:focus-within {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .filterBar {
    padding: var(--space-2) var(--space-4);
  }

  .filterRow {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-2);
  }

  .searchBar,
  .searchBar:focus-within {
    width: 100%;
  }

  .filterDropdowns {
    display: flex;
    gap: var(--space-2);
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: var(--space-1);
  }

  .chipsRow {
    overflow-x: auto;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
    padding-bottom: var(--space-1);
  }

  .filterInfo {
    font-size: 0.7rem;
    margin-left: 0;
    text-align: center;
    padding-top: var(--space-1);
  }
}
```

### 6.3 SearchBar

| Breakpoint | Comportamento |
|-----------|--------------|
| **Desktop** | 280px default, 360px ao focar, hint Ctrl+K visivel |
| **Tablet** | 200px default, 280px ao focar, hint Ctrl+K visivel |
| **Mobile** | 100% largura, sem expansao (ja ocupa tudo), hint oculta |

### 6.4 FilterDropdown

| Breakpoint | Comportamento |
|-----------|--------------|
| **Desktop** | Dropdown abre abaixo do trigger, min-width 200px |
| **Tablet** | Mesmo comportamento do desktop |
| **Mobile** | Dropdown abre abaixo, largura `calc(100vw - 32px)`, position fixed no bottom (bottom sheet style) |

**CSS responsivo do FilterDropdown no mobile:**
```css
@media (max-width: 768px) {
  .dropdown {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: auto;
    max-width: 100%;
    max-height: 50vh;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    animation: slideUp var(--transition) ease;
    z-index: var(--z-modal);
  }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

### 6.5 CommentSection (dentro do TaskModal)

| Breakpoint | Comportamento |
|-----------|--------------|
| **Desktop** | Max-height 320px para lista, scroll interno |
| **Tablet** | Max-height 280px |
| **Mobile** | Max-height 200px (modal e fullscreen, entao tem menos espaco vertical disponivel) |

```css
@media (max-width: 768px) {
  .commentList {
    max-height: 200px;
  }
}
```

### 6.6 DueDateBadge

| Breakpoint | Comportamento |
|-----------|--------------|
| **Desktop/Tablet** | Exibe icone + texto completo ("Vencido ha 3 dias") |
| **Mobile** | Exibe apenas icone + texto curto ("Vencido", "Hoje", "dd/mm") -- usa `size="sm"` |

### 6.7 FilterChips

| Breakpoint | Comportamento |
|-----------|--------------|
| **Desktop** | Chips em flex-wrap, multiplas linhas se necessario |
| **Tablet** | Mesmo do desktop |
| **Mobile** | Chips em scroll horizontal (nowrap), usuario faz swipe lateral |

---

## 7. ASCII Wireframes

### 7.1 Board Header com FilterBar Expandida (Desktop)

```
+--------+-----------------------------------------------------------------------+
|        | Oxy                                     [M][A][F][C][+1]              |
| O2     |-----------------------------------------------------------------------|
| Kanban | [SearchIcon] Buscar tarefas...   [Ctrl+K]  [Tipo v] [Prior. v] [Resp. v] |
|--------| [Tipo: Bug x] [Prior: Urgente x] [Resp: Andrey x]  Limpar  5 de 23  |
|        |-----------------------------------------------------------------------|
| [#] My |                                                                       |
| [U] Us |  +--------+ +--------+ +--------+ +--------+ +---------+             |
| [S] Co |  |A Fazer | |Prioriz.| |Em Prog.| |Revisao | |Concluido|             |
|        |  | 1/3    | | 0/1    | | 1/2    | | 1/1    | | 2/2     |             |
|        |  |--------| |--------| |--------| |--------| |---------|             |
|        |  | Card 1 | | (dim)  | | Card 4 | | Card 6 | | Card 7  |             |
|        |  | (dim)  | |        | | (dim)  | |        | | Card 8  |             |
|        |  | Card 3 | |+ Add..| |+ Add..| |+ Add..| |+ Add.. |             |
|        |  |+ Add..| |        | |        | |        | |         |             |
|        |  +--------+ +--------+ +--------+ +--------+ +---------+             |
+--------+-----------------------------------------------------------------------+

Legenda: (dim) = card com opacity 0.15 (nao corresponde ao filtro)
         1/3   = 1 card filtrado de 3 total
```

### 7.2 Card com DueDateBadge (Variantes)

```
Card VENCIDO:                         Card HOJE:
+-RED-BORDER---------------------+    +----------------------------+
| | [Bug] Bug                    |    | [Copy] Tarefa              |
| | Corrigir regressao no login  |    | Preparar release notes     |
| |                              |    |                            |
| | [Urgente] [!Vencido]         |    | [Media] [~Hoje]            |
| |                              |    |                            |
| |                         [A]  |    |                       [F]  |
+-|------------------------------+    +----------------------------+
  ^                                              ^
  Borda esquerda 3px vermelha                    Badge laranja "Hoje"

Card ESTA SEMANA:                     Card FUTURO:
+----------------------------+        +----------------------------+
| [Zap] Epico                |        | [Book] User Story          |
| Redesign do dashboard      |        | US-020: Nova tela de...    |
|                            |        |                            |
| [Alta] [>Em 3 dias]        |        | [Baixa] [=15/03]           |
|                            |        |                            |
|                       [M]  |        |                       [C]  |
+----------------------------+        +----------------------------+
           ^                                      ^
           Badge indigo "Em 3 dias"               Badge cinza "15/03"

Card SEM DUE DATE (inalterado):
+----------------------------+
| [Copy] Tarefa              |
| Revisar documentacao       |
|                            |
| [Media]                    |
|                            |
|                       [F]  |
+----------------------------+
```

### 7.3 TaskModal com CommentSection (Desktop)

```
+----------------------------------------------------------+
|                     BACKDROP (overlay)                     |
|                                                            |
|    +--------------------------------------------------+   |
|    |  [Bug]  Bug                                 [X]  |   |
|    |--------------------------------------------------|   |
|    |                                                  |   |
|    |  Titulo                                          |   |
|    |  +----------------------------------------------+|   |
|    |  | Corrigir regressao no login                  ||   |
|    |  +----------------------------------------------+|   |
|    |                                                  |   |
|    |  Tipo                       Prioridade           |   |
|    |  [Tar] [US] [*Bug*] [Ep]   [B] [M] [A] [*Urg*] |   |
|    |                                                  |   |
|    |  Descricao                                       |   |
|    |  +----------------------------------------------+|   |
|    |  | O login quebra quando o email contem...       ||   |
|    |  +----------------------------------------------+|   |
|    |                                                  |   |
|    |  Responsavel                Data Limite          |   |
|    |  +------------------+      +------------------+  |   |
|    |  | Andrey      [v]  |      | [Cal] 15/02/2026 [x]|  |   |
|    |  +------------------+      +------------------+  |   |
|    |                                                  |   |
|    |  ---- meta ----                                  |   |
|    |  Coluna: Em Progresso                            |   |
|    |  Criado em: 10/02/2026 09:00                     |   |
|    |                                                  |   |
|    |  ---- comentarios ----                           |   |
|    |  Comentarios (3)                                 |   |
|    |                                                  |   |
|    |  [A] Andrey          15/02/2026 10:30            |   |
|    |      Ja estou investigando, parece ser um        |   |
|    |      problema na validacao de regex.             |   |
|    |  ---|                                            |   |
|    |  [F] Felipe          15/02/2026 11:00            |   |
|    |      Confere se nao e o mesmo bug do Sprint 1.   |   |
|    |  ---|                                            |   |
|    |  [A] Andrey          15/02/2026 14:00            |   |
|    |      Confirmado, e diferente. Ja tenho o fix.    |   |
|    |                                                  |   |
|    |  +----------------------------------------------+|   |
|    |  | Adicionar comentario...                      ||   |
|    |  +----------------------------------------------+|   |
|    |               Ctrl+Enter para enviar    [Enviar] |   |
|    |                                                  |   |
|    |--------------------------------------------------|   |
|    |  [Trash]            [Cancelar] [Salvar alteracoes]|   |
|    +--------------------------------------------------+   |
|                                                            |
+----------------------------------------------------------+
```

### 7.4 FilterDropdown Aberto (Desktop)

```
Trigger:                        Dropdown aberto:
+---------------------+        +---------------------+
| [Layers] Tipo  [v]  |        | [Layers] Tipo  [^] [2]|
+---------------------+        +---------------------+
                                | [x] Tarefa           |
                                | [ ] User Story       |
                                | [x] Bug              |
                                | [ ] Epico            |
                                | [ ] Spike            |
                                |---------------------|
                                |   Limpar selecao     |
                                +---------------------+

Trigger com prioridades:        Dropdown de prioridade:
+---------------------+        +---------------------+
| Prioridade     [v]  |        | Prioridade     [^] [1]|
+---------------------+        +---------------------+
                                | [ ] * Baixa          |
                                | [ ] * Media          |
                                | [ ] * Alta           |
                                | [x] * Urgente        |
                                |---------------------|
                                |   Limpar selecao     |
                                +---------------------+
                                (* = color dot da prioridade)

Trigger com responsaveis:       Dropdown de responsavel:
+---------------------+        +---------------------+
| [User] Resp.   [v]  |        | [User] Resp.   [^] [2]|
+---------------------+        +---------------------+
                                | [x] [A] Andrey       |
                                | [x] [F] Felipe       |
                                | [ ] [C] Caio         |
                                | [ ] [M] Matheus      |
                                |---------------------|
                                |   Limpar selecao     |
                                +---------------------+
```

### 7.5 Experiencia de Filtro no Mobile

```
MOBILE -- FilterBar:
+----------------------------+
| Oxy                   [+1] |
|----------------------------|
| [Search] Buscar tarefas... |
|                            |
| [Tipo v] [Prior v] [Resp v]|
|                            |
| [Tipo:Bug x] [Prior:Urg x]>|  <- scroll horizontal nos chips
|           5 de 23 tarefas  |
|----------------------------|
|                            |
| +------------------------+ |
| | Card 1 (visivel)       | |
| +------------------------+ |
|                            |
| +------------------------+ |
| | Card 2 (dim opacity)   | |
| +------------------------+ |
|                            |
+----------------------------+

MOBILE -- FilterDropdown (bottom sheet):
+----------------------------+
|                            |
|     (conteudo acima)       |
|                            |
|============================|  <- overlay escurece
| +------------------------+ |
| |       Tipo             | |
| |------------------------| |
| | [x] Tarefa             | |
| | [ ] User Story         | |
| | [x] Bug                | |
| | [ ] Epico              | |
| | [ ] Spike              | |
| |------------------------| |
| |    Limpar selecao       | |
| +------------------------+ |
+----------------------------+
```

### 7.6 TaskModal no Mobile com Comentarios

```
+------------------------+
| [Bug]  Bug        [X]  |
|------------------------|
|                        |
| Titulo                 |
| +--------------------+ |
| | Corrigir regressao | |
| +--------------------+ |
|                        |
| Tipo                   |
| [Tar] [US] [*Bug*] .. |
|                        |
| Prioridade             |
| [B] [M] [A] [*Urg*]   |
|                        |
| Descricao              |
| +--------------------+ |
| | O login quebra...  | |
| +--------------------+ |
|                        |
| Responsavel            |
| +--------------------+ |
| | Andrey        [v]  | |
| +--------------------+ |
|                        |
| Data Limite            |
| +--------------------+ |
| | [Cal] 15/02/26 [x] | |
| +--------------------+ |
|                        |
| --- meta ---           |
| Coluna: Em Progresso   |
| Criado: 10/02/26 09:00 |
|                        |
| --- comentarios ---    |
| Comentarios (3)        |
|                        |
| [A] Andrey   15/02 10h |
|     Ja estou investi.. |
| ---|                   |
| [F] Felipe   15/02 11h |
|     Confere se nao e.  |
| ---|                   |
| [A] Andrey   15/02 14h |
|     Confirmado, e di.. |
|                        |
| +--------------------+ |
| | Add comentario...  | |
| +--------------------+ |
| Cmd+Enter       [Env.] |
|                        |
|------------------------|
| [Trash] [Canc] [Salv]  |
+------------------------+
```

---

## 8. Acessibilidade

### 8.1 FilterChip

| Requisito | Implementacao |
|-----------|--------------|
| **aria-label** | `aria-label="Remover filtro: Tipo Bug"` (descritivo completo) |
| **role** | O chip e informativo; o botao X tem `role="button"` implicito |
| **Focus** | Botao X recebe focus com Tab, outline visivel `--border-focus` |
| **Keyboard** | Enter/Space no botao X remove o filtro |
| **Screen reader** | Anuncia "Filtro ativo: Tipo Bug. Pressione para remover." |

### 8.2 SearchBar

| Requisito | Implementacao |
|-----------|--------------|
| **role** | `role="searchbox"` no input |
| **aria-label** | `aria-label="Buscar tarefas no board"` |
| **aria-describedby** | Referencia para texto "Use Ctrl+K para focar" (visually hidden) |
| **Keyboard** | `Ctrl+K` / `Cmd+K` foca o campo |
| **Focus** | Input recebe focus com Tab, outline visivel |
| **Clear** | Botao X com `aria-label="Limpar busca"` |
| **Live region** | Contagem de resultados anunciada via `aria-live="polite"` (ex: "5 de 23 tarefas encontradas") |

### 8.3 FilterDropdown

| Requisito | Implementacao |
|-----------|--------------|
| **Trigger** | `aria-haspopup="true"`, `aria-expanded="true/false"`, `aria-label="Filtrar por Tipo"` |
| **Dropdown** | `role="listbox"` para o container, `role="option"` para cada opcao |
| **aria-selected** | `aria-selected="true"` para opcoes selecionadas |
| **Keyboard** | Arrow Up/Down navega opcoes, Space/Enter toggle selecao, Escape fecha |
| **Focus** | Focus management: ao abrir, focus vai para a primeira opcao |
| **Screen reader** | Anuncia "Filtro por Tipo, 2 selecionados. Pressione para abrir." |

### 8.4 DateInput

| Requisito | Implementacao |
|-----------|--------------|
| **aria-label** | `aria-label="Data limite"` (herdado do FormField via htmlFor) |
| **Keyboard** | Input nativo `type="date"` ja suporta navegacao por teclado |
| **Clear** | Botao X com `aria-label="Limpar data"` |
| **Screen reader** | Anuncia o valor formatado e o estado (ex: "Data limite: 15 de marco de 2026") |

### 8.5 CommentSection

| Requisito | Implementacao |
|-----------|--------------|
| **aria-live** | Container da lista de comentarios com `aria-live="polite"` para anunciar novos comentarios |
| **aria-label** | Secao com `aria-label="Secao de comentarios"` |
| **CommentInput** | `aria-label="Adicionar comentario"`, `aria-describedby` referenciando hint de Ctrl+Enter |
| **Keyboard** | `Ctrl+Enter` / `Cmd+Enter` envia comentario |
| **Focus** | Apos enviar comentario, focus retorna ao CommentInput |
| **Screen reader** | Novo comentario anunciado: "Comentario de Andrey adicionado" |

### 8.6 DueDateBadge

| Requisito | Implementacao |
|-----------|--------------|
| **aria-label** | Descritivo completo: `aria-label="Vencido ha 3 dias"` ou `aria-label="Vence hoje"` |
| **role** | `role="status"` para indicar que e uma informacao de status |
| **Contraste** | Todas as combinacoes de cor texto/fundo atendem WCAG AA (4.5:1 minimo) |

### 8.7 Resumo de Atributos ARIA por Componente

| Componente | Atributos Chave |
|-----------|-----------------|
| FilterBar | `role="search"` no container, `aria-label="Barra de filtros"` |
| SearchBar | `role="searchbox"`, `aria-label`, `aria-describedby` |
| FilterDropdown trigger | `aria-haspopup="true"`, `aria-expanded`, `aria-label` |
| FilterDropdown menu | `role="listbox"`, opcoes com `role="option"`, `aria-selected` |
| FilterChip remove | `aria-label="Remover filtro: {category} {label}"` |
| DateInput | `aria-label` via label, `aria-invalid` para erro |
| DueDateBadge | `aria-label` descritivo, `role="status"` |
| CommentSection | `aria-label="Secao de comentarios"`, lista com `aria-live="polite"` |
| CommentInput | `aria-label="Adicionar comentario"`, `aria-describedby` |
| CommentItem | Semantico: avatar decorativo (`aria-hidden`), conteudo acessivel |

---

## 9. Resumo de Entregaveis

### 9.1 Novos Design Tokens

| Categoria | Quantidade | Prefixo |
|-----------|:----------:|---------|
| Filter Bar | 13 | `--filter-*` |
| Due Date | 12 | `--due-*` |
| Comments | 8 | `--comment-*` |
| Search | 8 | `--search-*` |
| Layout | 3 | `--filter-bar-*`, `--z-filter-dropdown` |
| **Total** | **~44** | |

### 9.2 Novos Componentes

| Nivel | Componente | Arquivo JS | Arquivo CSS |
|-------|-----------|------------|-------------|
| Atomo | DateInput | `ui/DateInput.js` | `DateInput.module.css` |
| Atomo | FilterChip | `ui/FilterChip.js` | `FilterChip.module.css` |
| Atomo | DueDateBadge | `ui/DueDateBadge.js` | `DueDateBadge.module.css` |
| Molecula | SearchBar | `ui/SearchBar.js` | `SearchBar.module.css` |
| Molecula | FilterDropdown | `ui/FilterDropdown.js` | `FilterDropdown.module.css` |
| Molecula | CommentItem | `ui/CommentItem.js` | `CommentItem.module.css` |
| Molecula | CommentInput | `ui/CommentInput.js` | `CommentInput.module.css` |
| Organismo | FilterBar | `Kanban/FilterBar.js` | `FilterBar.module.css` |
| Organismo | CommentSection | `Kanban/CommentSection.js` | `CommentSection.module.css` |
| **Total** | **9 componentes** | **9 arquivos JS** | **9 arquivos CSS** |

### 9.3 Componentes Existentes Modificados

| Componente | Arquivo | Modificacao |
|-----------|---------|-------------|
| `Board.js` | `Kanban/Board.js` | Inserir FilterBar entre header e board-content |
| `Card.js` | `Kanban/Card.js` | Adicionar DueDateBadge, borda overdue, classe filtered-out |
| `TaskModal.js` | `Kanban/TaskModal.js` | Adicionar DateInput para due_date, CommentSection |
| `TaskForm.js` | `Kanban/TaskForm.js` | Adicionar DateInput para due_date |
| `Column.js` | `Kanban/Column.js` | Exibir contagem filtrada "X/Y" quando filtros ativos |

### 9.4 Novo Store Sugerido

| Store | Arquivo | Responsabilidade |
|-------|---------|-----------------|
| `useFilterStore` | `stores/useFilterStore.js` | Estado de filtros (search, types, priorities, assignees) |

### 9.5 Novos Endpoints API Sugeridos

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| `GET` | `/api/tasks/:taskId/comments` | Listar comentarios de uma tarefa |
| `POST` | `/api/tasks/:taskId/comments` | Adicionar comentario a uma tarefa |

### 9.6 Nova Tabela Supabase Sugerida

```sql
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  author_id TEXT NOT NULL,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_comments_task_id ON comments(task_id);
```

### 9.7 Checklist de Acessibilidade (Sprint 2)

| Requisito | Componente(s) | Status |
|-----------|--------------|--------|
| `aria-label` descritivos | FilterChip, SearchBar, FilterDropdown, DateInput, DueDateBadge | A implementar |
| `role="searchbox"` | SearchBar | A implementar |
| `aria-live="polite"` | CommentSection (novos comentarios), FilterBar (contagem) | A implementar |
| `aria-haspopup` + `aria-expanded` | FilterDropdown | A implementar |
| Navegacao por teclado | FilterDropdown (arrows), SearchBar (Ctrl+K), CommentInput (Ctrl+Enter) | A implementar |
| Focus management | FilterDropdown (focus na primeira opcao ao abrir) | A implementar |
| Contraste WCAG AA | Todos os tokens de cor novos | Garantido pelos tokens |
| `aria-selected` | FilterDropdown opcoes | A implementar |
| Screen reader friendly | DueDateBadge (status descritivo), FilterChips (remocao) | A implementar |

### 9.8 Dependencias de Implementacao

```
1. Design tokens em globals.css (novos tokens Sprint 2)
   |
   +-> 2. Atomos (DateInput, FilterChip, DueDateBadge)
   |
   +-> 3. Moleculas (SearchBar, FilterDropdown, CommentItem, CommentInput)
   |
   +-> 4. useFilterStore (Zustand)
   |
   +-> 5. Organismos (FilterBar, CommentSection)
   |
   +-> 6. Modificacoes em componentes existentes:
   |     +-> Board.js (inserir FilterBar)
   |     +-> Card.js (DueDateBadge + filtered-out)
   |     +-> Column.js (contagem filtrada)
   |     +-> TaskModal.js (DateInput + CommentSection)
   |     +-> TaskForm.js (DateInput)
   |
   +-> 7. API endpoints (comments)
   |
   +-> 8. Tabela Supabase (comments)
```

**Ordem sugerida de implementacao:**
1. Design tokens em `globals.css`
2. Tabela Supabase `comments` + endpoints API
3. `useFilterStore` (Zustand)
4. Atomos: DateInput, FilterChip, DueDateBadge
5. Moleculas: SearchBar, FilterDropdown
6. Moleculas: CommentItem, CommentInput
7. Organismo: FilterBar + integracao Board.js
8. Organismo: CommentSection + integracao TaskModal.js
9. Card.js modificacao (DueDateBadge + filtered-out + overdue border)
10. Column.js modificacao (contagem filtrada)
11. TaskForm.js modificacao (DateInput)
12. Testes de acessibilidade e responsividade

---

> **Documento preparado por Uma (UX/UI Design Expert Agent)**
> **Orquestrado por Orion (Master Orchestrator)**
> **Para uso interno da O2 Inc -- Fevereiro 2026**
