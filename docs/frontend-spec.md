# O2 Kanban -- Especificacao Frontend (Sprint 1)

> **Documento:** Frontend Design Specification
> **Projeto:** O2 Kanban -- Sprint 1 Enhancement
> **Fase:** Phase 2 -- Frontend Design Specification
> **Data:** 20 de Fevereiro de 2026
> **Autora:** Uma (UX/UI Design Expert Agent)
> **Versao:** 1.0
> **Baseado em:** PRD (Morgan, v1.0) + Project Brief (Atlas, v1.0) + Codigo-fonte existente

---

## Indice

1. [Novos Design Tokens](#1-novos-design-tokens)
2. [Novos Componentes (Atomic Design)](#2-novos-componentes-atomic-design)
3. [Padroes de Interacao](#3-padroes-de-interacao)
4. [Estados dos Componentes](#4-estados-dos-componentes)
5. [Responsividade dos Novos Componentes](#5-responsividade-dos-novos-componentes)
6. [ASCII Wireframes](#6-ascii-wireframes)
7. [Resumo de Entregaveis](#7-resumo-de-entregaveis)

---

## 1. Novos Design Tokens

Os tokens abaixo **complementam** os existentes em `globals.css`. Nenhum token existente deve ser alterado. Todos os novos tokens seguem a nomenclatura `--prefixo-contexto` ja estabelecida.

### 1.1 Form Inputs

```css
/* Form Inputs */
--input-bg: #1c1e22;                       /* Igual a --bg-card */
--input-bg-hover: #22252a;                 /* Ligeiramente mais claro */
--input-border: #363940;                   /* Entre --border e --border-hover */
--input-border-focus: var(--accent);       /* Verde accent para focus */
--input-border-error: var(--color-danger); /* Vermelho para erro */
--input-text: var(--text-primary);         /* Texto dentro do input */
--input-placeholder: var(--text-muted);    /* Placeholder */
--input-radius: var(--radius-md);          /* 8px */
--input-height: 40px;                      /* Altura padrao */
--input-height-sm: 32px;                   /* Altura compacta (inline forms) */
```

### 1.2 Toast / Notification

```css
/* Toast Notifications */
--toast-bg-success: rgba(34, 197, 94, 0.15);
--toast-border-success: rgba(34, 197, 94, 0.3);
--toast-text-success: var(--color-success);

--toast-bg-error: rgba(239, 68, 68, 0.15);
--toast-border-error: rgba(239, 68, 68, 0.3);
--toast-text-error: var(--color-danger);

--toast-bg-info: rgba(99, 102, 241, 0.15);
--toast-border-info: rgba(99, 102, 241, 0.3);
--toast-text-info: var(--color-info);
```

### 1.3 Transitions / Animations

```css
/* Transitions */
--transition-fast: 0.15s ease;       /* Hover states, small toggles */
--transition-normal: 0.2s ease;      /* Ja existe como --transition */
--transition-slow: 0.3s ease;        /* Modal open/close, sidebar collapse */
--transition-spring: 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); /* Bounce effect para toasts */
```

### 1.4 Layout (Novos)

```css
/* Layout - Novos */
--sidebar-width-collapsed: 60px;     /* Sidebar colapsada (ja usado no media query tablet) */
--column-width-collapsed: 48px;      /* Coluna colapsada */
--modal-width: 560px;                /* Largura do modal em desktop */
--modal-max-height: 85vh;            /* Altura maxima do modal */
--toast-width: 360px;                /* Largura do toast */
--z-modal: 1000;                     /* Z-index do modal overlay */
--z-toast: 1100;                     /* Z-index dos toasts (acima do modal) */
--z-dropdown: 900;                   /* Z-index de dropdowns */
```

### 1.5 Prioridade (Badge Colors)

```css
/* Priority Badges */
--priority-low-bg: rgba(107, 114, 128, 0.15);
--priority-low-text: var(--color-neutral);
--priority-low-border: rgba(107, 114, 128, 0.3);

--priority-medium-bg: rgba(245, 158, 11, 0.15);
--priority-medium-text: var(--color-warning);
--priority-medium-border: rgba(245, 158, 11, 0.3);

--priority-high-bg: rgba(249, 115, 22, 0.15);
--priority-high-text: #f97316;
--priority-high-border: rgba(249, 115, 22, 0.3);

--priority-urgent-bg: rgba(239, 68, 68, 0.15);
--priority-urgent-text: var(--color-danger);
--priority-urgent-border: rgba(239, 68, 68, 0.3);
```

> **Nota:** O token `--bg-overlay` ja existe (`rgba(0, 0, 0, 0.6)`) e sera reutilizado para o backdrop do modal. Nenhum token novo necessario para overlay.

---

## 2. Novos Componentes (Atomic Design)

Estrutura de pastas conforme ADR-007 (feature-based):

```
src/components/
  ui/                        <-- Atomos e Moleculas reutilizaveis
    Input.js                 + Input.module.css
    Select.js                + Select.module.css
    IconButton.js            + IconButton.module.css
    Badge.js                 + Badge.module.css
    FormField.js             + FormField.module.css
    TaskTypeSelector.js      + TaskTypeSelector.module.css
    PrioritySelector.js      + PrioritySelector.module.css
    Toast.js                 + Toast.module.css
    ConfirmDialog.js         + ConfirmDialog.module.css
  kanban/                    <-- Organismos especificos do Kanban
    Board.js                 (existente, sera estendido)
    Card.js                  (existente, sera estendido)
    Column.js                (existente, sera estendido)
    Sidebar.js               (existente, sera estendido)
    TaskModal.js             + TaskModal.module.css
    TaskForm.js              + TaskForm.module.css
    CreateTaskButton.js      + CreateTaskButton.module.css
    CollapsibleColumn.js     + CollapsibleColumn.module.css
```

---

### 2.1 ATOMOS

#### 2.1.1 Input (Text / Textarea)

**Arquivo:** `src/components/ui/Input.js`

**Props:**
| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `type` | `"text" \| "textarea"` | `"text"` | Tipo do campo |
| `value` | `string` | `""` | Valor controlado |
| `onChange` | `function` | required | Handler de mudanca |
| `placeholder` | `string` | `""` | Texto placeholder |
| `error` | `boolean` | `false` | Estado de erro visual |
| `disabled` | `boolean` | `false` | Estado desabilitado |
| `size` | `"sm" \| "md"` | `"md"` | Tamanho: sm=32px, md=40px |
| `rows` | `number` | `3` | Linhas do textarea |
| `maxLength` | `number` | `undefined` | Limite de caracteres |
| `ariaLabel` | `string` | `undefined` | Acessibilidade |

**Estilos:**
```css
.input {
  width: 100%;
  height: var(--input-height);
  padding: var(--space-2) var(--space-3);
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: var(--input-radius);
  color: var(--input-text);
  font-size: 0.875rem;
  font-family: inherit;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}

.input::placeholder {
  color: var(--input-placeholder);
}

.input:hover:not(:disabled) {
  background: var(--input-bg-hover);
}

.input:focus {
  outline: none;
  border-color: var(--input-border-focus);
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15);
}

.input.error {
  border-color: var(--input-border-error);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.15);
}

.input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input.sm {
  height: var(--input-height-sm);
  font-size: 0.8rem;
  padding: var(--space-1) var(--space-2);
}

.textarea {
  height: auto;
  min-height: 80px;
  resize: vertical;
}
```

---

#### 2.1.2 Select / Dropdown

**Arquivo:** `src/components/ui/Select.js`

**Props:**
| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `value` | `string` | `""` | Valor selecionado |
| `onChange` | `function` | required | Handler |
| `options` | `Array<{value, label, icon?}>` | `[]` | Opcoes |
| `placeholder` | `string` | `"Selecione..."` | Texto quando vazio |
| `error` | `boolean` | `false` | Estado de erro |
| `disabled` | `boolean` | `false` | Desabilitado |
| `size` | `"sm" \| "md"` | `"md"` | Tamanho |

**Comportamento:**
- Clique abre dropdown customizado posicionado abaixo do trigger
- Seta para cima/baixo navega entre opcoes
- Enter seleciona, Escape fecha
- Clique fora fecha o dropdown
- Dropdown abre para cima se nao houver espaco abaixo (collision detection)

**Estilos do Dropdown Menu:**
```css
.selectTrigger {
  /* Herda estilos do .input */
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.selectMenu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--bg-elevated);
  border: 1px solid var(--border-hover);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: var(--z-dropdown);
  max-height: 200px;
  overflow-y: auto;
  padding: var(--space-1);
}

.selectOption {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  transition: background var(--transition-fast);
}

.selectOption:hover,
.selectOption.focused {
  background: var(--bg-card);
  color: var(--text-primary);
}

.selectOption.selected {
  color: var(--accent);
}
```

---

#### 2.1.3 IconButton

**Arquivo:** `src/components/ui/IconButton.js`

**Props:**
| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `icon` | `ReactNode` | required | Icone lucide-react |
| `onClick` | `function` | required | Handler |
| `variant` | `"ghost" \| "subtle" \| "danger"` | `"ghost"` | Variante visual |
| `size` | `"sm" \| "md"` | `"md"` | sm=28px, md=36px |
| `ariaLabel` | `string` | required | Acessibilidade (obrigatorio) |
| `disabled` | `boolean` | `false` | Desabilitado |
| `title` | `string` | `undefined` | Tooltip nativo |

**Estilos por variante:**

```css
/* Ghost (padrao) -- usado no header, acoes sutis */
.iconBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-muted);
  background: transparent;
}

.iconBtn.md {
  width: 36px;
  height: 36px;
}

.iconBtn.sm {
  width: 28px;
  height: 28px;
}

.iconBtn.ghost:hover {
  background: var(--bg-elevated);
  color: var(--text-primary);
}

/* Subtle -- usado dentro de forms, areas de conteudo */
.iconBtn.subtle {
  color: var(--text-secondary);
}

.iconBtn.subtle:hover {
  background: var(--bg-elevated);
  color: var(--text-primary);
}

/* Danger -- usado para delete */
.iconBtn.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
}

.iconBtn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

> **Nota:** Este componente substitui o padrao `header-icon-btn` inline e `.collapse-btn` existentes. Componentes existentes podem ser migrados progressivamente.

---

#### 2.1.4 Badge (Prioridade)

**Arquivo:** `src/components/ui/Badge.js`

**Props:**
| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `priority` | `"low" \| "medium" \| "high" \| "urgent"` | required | Nivel de prioridade |
| `size` | `"sm" \| "md"` | `"sm"` | Tamanho |

**Mapeamento visual (PT-BR):**

| Prioridade | Label | Cor Texto | Cor BG | Icone (opcional) |
|-----------|-------|-----------|--------|-----------------|
| `low` | Baixa | `--color-neutral` | `--priority-low-bg` | -- |
| `medium` | Media | `--color-warning` | `--priority-medium-bg` | -- |
| `high` | Alta | `#f97316` (orange) | `--priority-high-bg` | ArrowUp |
| `urgent` | Urgente | `--color-danger` | `--priority-urgent-bg` | AlertTriangle |

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
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid;
  white-space: nowrap;
}

.badge.sm {
  font-size: 0.6rem;
  padding: 0.1rem 0.4rem;
}

/* Variantes por prioridade */
.badge.low {
  background: var(--priority-low-bg);
  color: var(--priority-low-text);
  border-color: var(--priority-low-border);
}

.badge.medium {
  background: var(--priority-medium-bg);
  color: var(--priority-medium-text);
  border-color: var(--priority-medium-border);
}

.badge.high {
  background: var(--priority-high-bg);
  color: var(--priority-high-text);
  border-color: var(--priority-high-border);
}

.badge.urgent {
  background: var(--priority-urgent-bg);
  color: var(--priority-urgent-text);
  border-color: var(--priority-urgent-border);
}
```

> **Nota:** Este componente **substitui** as classes `.tag-medium`, `.tag-urgent` existentes no kanban.css para representar prioridade. As tags existentes continuam para labels genericas (Slack, Nova, Rotina).

---

### 2.2 MOLECULAS

#### 2.2.1 FormField (Label + Input + Error)

**Arquivo:** `src/components/ui/FormField.js`

**Props:**
| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `label` | `string` | required | Texto do label |
| `error` | `string \| null` | `null` | Mensagem de erro |
| `required` | `boolean` | `false` | Indicador visual de obrigatorio |
| `htmlFor` | `string` | `undefined` | ID do input associado |
| `children` | `ReactNode` | required | O Input/Select filho |

**Layout:**
```
[Label] [*]        <-- label + indicador required
[Input........]    <-- children (Input, Select, etc.)
[Mensagem erro]    <-- texto de erro em vermelho
```

**Estilos:**
```css
.formField {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.required {
  color: var(--color-danger);
  margin-left: 2px;
}

.errorMsg {
  font-size: 0.75rem;
  color: var(--color-danger);
  margin-top: 2px;
}
```

---

#### 2.2.2 TaskTypeSelector

**Arquivo:** `src/components/ui/TaskTypeSelector.js`

**Props:**
| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `value` | `string` | `"Task"` | Tipo selecionado |
| `onChange` | `function` | required | Handler |

**Opcoes com icones (lucide-react):**

| Valor | Label PT-BR | Icone | Cor |
|-------|-------------|-------|-----|
| `Task` | Tarefa | `Copy` | `--text-muted` |
| `User Story` | User Story | `BookOpen` | `--text-muted` |
| `Bug` | Bug | `Bug` | `--color-danger` |
| `Epic` | Epico | `Zap` | `--color-progress` |

**Comportamento:**
- Renderiza como grupo de botoes (button group) com icone + label
- Apenas um selecionado por vez (radio behavior)
- O botao selecionado tem background `--bg-elevated` e borda `--accent`
- Acessibilidade: `role="radiogroup"` com `role="radio"` nos filhos

**Estilos:**
```css
.typeSelector {
  display: flex;
  gap: var(--space-1);
  flex-wrap: wrap;
}

.typeOption {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.typeOption:hover {
  border-color: var(--border-hover);
  background: var(--bg-card);
}

.typeOption.selected {
  border-color: var(--accent);
  background: rgba(16, 185, 129, 0.08);
  color: var(--text-primary);
}
```

---

#### 2.2.3 PrioritySelector

**Arquivo:** `src/components/ui/PrioritySelector.js`

**Props:**
| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `value` | `string` | `"medium"` | Prioridade selecionada |
| `onChange` | `function` | required | Handler |

**Opcoes:**

| Valor | Label PT-BR | Cor |
|-------|-------------|-----|
| `low` | Baixa | `--color-neutral` |
| `medium` | Media | `--color-warning` |
| `high` | Alta | `#f97316` |
| `urgent` | Urgente | `--color-danger` |

**Comportamento:**
- Renderiza como grupo de botoes horizontal, cada um com um ponto de cor + label
- Apenas um selecionado por vez
- O botao selecionado usa o background da cor correspondente (com alpha 0.15)
- Acessibilidade: `role="radiogroup"`

**Estilos:**
```css
.prioritySelector {
  display: flex;
  gap: var(--space-1);
}

.priorityOption {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.priorityDot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
}

.priorityOption:hover {
  border-color: var(--border-hover);
}

/* .priorityOption.selected aplica a cor da prioridade correspondente */
/* Ex: .priorityOption.selected.urgent { border-color: var(--color-danger); ... } */
```

---

### 2.3 ORGANISMOS

#### 2.3.1 TaskModal -- Modal de Detalhes/Edicao

**Arquivo:** `src/components/kanban/TaskModal.js`

**Props:**
| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `task` | `object \| null` | `null` | Tarefa para visualizar/editar. `null` = fechado |
| `onClose` | `function` | required | Fechar modal |
| `onSave` | `function` | required | Salvar edicoes |
| `onDelete` | `function` | required | Deletar tarefa |
| `columns` | `Array` | required | Lista de colunas (para mover) |
| `members` | `Array` | required | Lista de membros (para assignee) |

**Comportamento:**
- Abre como overlay centralizado em desktop (centered modal)
- Backdrop com `--bg-overlay` (rgba(0,0,0,0.6)) e click fora fecha
- Tecla Escape fecha o modal
- Focus trap: Tab navega apenas dentro do modal
- Campos sao editaveis inline (nao precisa de "modo edicao")
- Botao "Salvar" habilita somente quando ha alteracoes (dirty state)
- Botao "Deletar" abre ConfirmDialog antes de executar
- Animacao de entrada: fade-in do backdrop + scale-up do modal (0.95 -> 1.0)
- Animacao de saida: fade-out + scale-down

**Campos do Modal:**
1. **Titulo** -- Input text, editavel, `maxLength: 500`
2. **Tipo** -- TaskTypeSelector (Task, User Story, Bug, Epic)
3. **Prioridade** -- PrioritySelector (low, medium, high, urgent)
4. **Descricao** -- Textarea, editavel, `maxLength: 10000`, placeholder "Adicione uma descricao..."
5. **Responsavel** -- Select dropdown com lista de membros
6. **Coluna** -- Select dropdown com lista de colunas (mover tarefa)
7. **Data de criacao** -- Texto read-only, formato "dd/mm/aaaa HH:mm"

**Botoes do Footer:**
- **Deletar** (esquerda) -- IconButton variant="danger", icone Trash2
- **Cancelar** (direita) -- Botao ghost, texto "Cancelar"
- **Salvar** (direita) -- Botao primary accent, texto "Salvar alteracoes"

**Estilos:**
```css
.modalOverlay {
  position: fixed;
  inset: 0;
  background: var(--bg-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  animation: fadeIn var(--transition-slow) ease;
  padding: var(--space-6);
}

.modalContent {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: var(--modal-width);
  max-height: var(--modal-max-height);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  animation: scaleIn var(--transition-slow) ease;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
}

.modalHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--border);
}

.modalBody {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  flex: 1;
  overflow-y: auto;
}

.modalFooter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--border);
}

.modalFooterRight {
  display: flex;
  gap: var(--space-3);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
```

**Botao Salvar (Primary):**
```css
.btnPrimary {
  padding: var(--space-2) var(--space-5);
  background: var(--accent);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.btnPrimary:hover {
  background: var(--accent-hover);
}

.btnPrimary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Botao Cancelar (Ghost):**
```css
.btnGhost {
  padding: var(--space-2) var(--space-5);
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btnGhost:hover {
  border-color: var(--border-hover);
  color: var(--text-primary);
}
```

---

#### 2.3.2 TaskForm -- Formulario de Criacao

**Arquivo:** `src/components/kanban/TaskForm.js`

**Props:**
| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `columnId` | `string` | required | Coluna onde a tarefa sera criada |
| `onSubmit` | `function` | required | Handler de submit (dados da tarefa) |
| `onCancel` | `function` | required | Fechar/cancelar form |
| `members` | `Array` | required | Lista de membros para assignee |

**Campos:**
1. **Titulo** -- Input text, obrigatorio, placeholder "Titulo da tarefa..."
2. **Tipo** -- TaskTypeSelector, default "Task"
3. **Prioridade** -- PrioritySelector, default "medium"
4. **Descricao** -- Textarea, opcional, placeholder "Descricao (opcional)..."
5. **Responsavel** -- Select, opcional, placeholder "Sem responsavel"

**Validacao (via Zod):**
- `titulo`: string, min 1, max 500 -- erro: "Titulo e obrigatorio"
- `tipo`: enum ["Task", "User Story", "Bug", "Epic"] -- default "Task"
- `prioridade`: enum ["low", "medium", "high", "urgent"] -- default "medium"
- `descricao`: string, max 10000, optional
- `responsavel`: string (id), optional

**Comportamento de Submit:**
1. Valida campos com Zod
2. Se invalido, exibe mensagens de erro nos FormFields
3. Se valido, chama `onSubmit` com os dados
4. Exibe loading state no botao "Criar" durante a persistencia
5. Apos sucesso, fecha o form e exibe toast de sucesso
6. Em caso de erro na persistencia, exibe toast de erro e mantem o form aberto

**Exibicao:**
O TaskForm sera renderizado **dentro de um modal** (reutilizando o pattern do TaskModal), aberto ao clicar no botao "+" da coluna. O modal de criacao e uma versao simplificada do TaskModal (sem botao deletar, sem data de criacao, botao "Criar tarefa" em vez de "Salvar").

---

#### 2.3.3 CreateTaskButton -- Botao "+" nas Colunas

**Arquivo:** `src/components/kanban/CreateTaskButton.js`

**Props:**
| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `columnId` | `string` | required | ID da coluna |
| `onClick` | `function` | required | Handler (abre TaskForm) |

**Posicao:** No **rodape** de cada coluna, abaixo dos cards e acima do padding inferior.

**Estilos:**
```css
.createTaskBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-3);
  background: transparent;
  border: 1px dashed var(--border);
  border-radius: var(--radius-md);
  color: var(--text-muted);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.createTaskBtn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(16, 185, 129, 0.05);
}

.createTaskBtn:active {
  background: rgba(16, 185, 129, 0.1);
}
```

**Texto:** `+ Adicionar tarefa` (icone Plus do lucide-react + texto)

---

#### 2.3.4 CollapsibleSidebar -- Sidebar que Colapsa

**Nao e um componente novo.** Sera uma **extensao do `Sidebar.js` existente**.

**Props adicionais:**
| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `isCollapsed` | `boolean` | `false` | Estado colapsado (vem do `useUIStore`) |
| `onToggle` | `function` | required | Toggle collapse (atualiza `useUIStore`) |

**Comportamento:**
- **Expandida (default):** Exibe logo + texto, nav items com icone + label, botao collapse (ChevronLeft)
- **Colapsada:** Largura `--sidebar-width-collapsed` (60px), exibe apenas icones centralizados, botao de collapse rotaciona para ChevronRight
- Transicao: `width var(--transition-slow)` suave
- Tooltip nos icones quando colapsada (title attribute ou tooltip customizado)
- No mobile (<768px): sidebar vira barra horizontal e nao colapsa (comportamento atual)
- No tablet (<1024px): sidebar inicia colapsada por padrao

**CSS para estado colapsado:**
```css
.sidebar.collapsed {
  width: var(--sidebar-width-collapsed);
  padding: var(--space-4) 0;
}

.sidebar.collapsed .logo-text,
.sidebar.collapsed .nav-item span {
  display: none;
  /* Alternativa: opacity: 0; width: 0; overflow: hidden; para animacao suave */
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: var(--space-3);
}

.sidebar.collapsed .sidebar-header {
  justify-content: center;
  padding: 0 var(--space-2);
}

.sidebar.collapsed .collapse-btn svg {
  transform: rotate(180deg);
  transition: transform var(--transition-slow);
}
```

---

#### 2.3.5 CollapsibleColumn -- Coluna que Minimiza

**Nao e um componente totalmente novo.** Sera uma **extensao do `Column.js` existente**, adicionando logica de collapse.

**Props adicionais:**
| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `isCollapsed` | `boolean` | `false` | Estado colapsado (vem do `useUIStore`) |
| `onToggleCollapse` | `function` | required | Toggle collapse |

**Comportamento:**
- **Expandida (default):** Layout atual completo com header, cards e footer
- **Colapsada:** Barra vertical fina (`--column-width-collapsed` = 48px) com:
  - Titulo rotacionado 90 graus (vertical, leitura de baixo para cima)
  - Badge de contagem de tarefas
  - Status dot (cor da coluna)
  - Click em qualquer area da coluna colapsada expande novamente
- Transicao: `width var(--transition-slow)`, `min-width var(--transition-slow)`
- Drag-and-drop: colunas colapsadas ainda aceitam drop (isOver ativa visual)
- Icone do botao: ChevronsLeft quando expandida, ChevronsRight quando colapsada

**CSS para estado colapsado:**
```css
.columnCollapsed {
  min-width: var(--column-width-collapsed);
  width: var(--column-width-collapsed);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-4) 0;
  gap: var(--space-3);
  transition: min-width var(--transition-slow), width var(--transition-slow);
}

.columnCollapsed:hover {
  background: var(--bg-elevated);
}

.columnCollapsedTitle {
  writing-mode: vertical-lr;
  transform: rotate(180deg);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
  letter-spacing: 0.5px;
}

.columnCollapsedCount {
  background: #1f2937;
  color: var(--text-secondary);
  font-size: 0.7rem;
  padding: 0.15rem 0.4rem;
  border-radius: var(--radius-full);
  font-weight: 500;
}

/* Visual feedback para drop em coluna colapsada */
.columnCollapsed.active-col {
  border-color: var(--border-focus);
  background: #1c142e;
}
```

---

#### 2.3.6 Toast -- Notificacao de Feedback

**Arquivo:** `src/components/ui/Toast.js`

**Props:**
| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `type` | `"success" \| "error" \| "info"` | `"info"` | Tipo visual |
| `message` | `string` | required | Mensagem |
| `duration` | `number` | `4000` | Duracao em ms (0 = permanente) |
| `onClose` | `function` | required | Handler para fechar |

**Posicao:** Canto inferior direito, empilhados de baixo para cima (stack).

**Icones por tipo:**
- `success`: CheckCircle (lucide-react), cor `--color-success`
- `error`: XCircle, cor `--color-danger`
- `info`: Info, cor `--color-info`

**Animacao:**
- Entrada: slide-in da direita + fade-in (`translateX(100%) -> translateX(0)`)
- Saida: slide-out para direita + fade-out
- Timing: `--transition-spring` (bounce suave)

**Estilos:**
```css
.toastContainer {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  display: flex;
  flex-direction: column-reverse;
  gap: var(--space-3);
  z-index: var(--z-toast);
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: var(--toast-width);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid;
  pointer-events: auto;
  animation: slideInRight var(--transition-spring) ease;
}

.toast.success {
  background: var(--toast-bg-success);
  border-color: var(--toast-border-success);
  color: var(--toast-text-success);
}

.toast.error {
  background: var(--toast-bg-error);
  border-color: var(--toast-border-error);
  color: var(--toast-text-error);
}

.toast.info {
  background: var(--toast-bg-info);
  border-color: var(--toast-border-info);
  color: var(--toast-text-info);
}

.toastMessage {
  flex: 1;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-primary);
}

.toastClose {
  /* IconButton ghost sm */
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

---

#### 2.3.7 ConfirmDialog -- Dialogo de Confirmacao

**Arquivo:** `src/components/ui/ConfirmDialog.js`

**Props:**
| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `isOpen` | `boolean` | `false` | Visibilidade |
| `title` | `string` | `"Confirmar acao"` | Titulo do dialogo |
| `message` | `string` | required | Mensagem de confirmacao |
| `confirmLabel` | `string` | `"Confirmar"` | Texto do botao de confirmacao |
| `cancelLabel` | `string` | `"Cancelar"` | Texto do botao de cancelar |
| `variant` | `"danger" \| "default"` | `"default"` | Variante (danger = botao vermelho) |
| `onConfirm` | `function` | required | Handler de confirmacao |
| `onCancel` | `function` | required | Handler de cancelamento |

**Comportamento:**
- Renderizado como modal pequeno (max-width: 400px)
- Backdrop com `--bg-overlay`
- Focus trap ativo
- Escape fecha (cancela)
- Botao de confirmacao recebe focus automatico quando `variant="default"`, botao cancelar recebe focus quando `variant="danger"` (prevenir acao acidental)

**Uso principal:** Confirmacao de delete de tarefa.
```
Mensagem: "Tem certeza que deseja excluir esta tarefa? Esta acao nao pode ser desfeita."
confirmLabel: "Excluir tarefa"
variant: "danger"
```

**Estilos:**
```css
.confirmDialog {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  max-width: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.confirmTitle {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.confirmMessage {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.confirmActions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

.btnDanger {
  padding: var(--space-2) var(--space-5);
  background: var(--color-danger);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.btnDanger:hover {
  background: #dc2626;
}
```

---

#### 2.3.8 Card (Extensao) -- Click para Abrir Modal

**Arquivo existente:** `src/components/kanban/Card.js`

**Alteracao necessaria:**

O Card precisa diferenciar **click** (abrir modal) de **drag** (mover card). O `@dnd-kit` ja lida com isso via `activationConstraint: { distance: 5 }` no PointerSensor. Portanto:

**Nova prop:**
| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `onClick` | `function` | required | Handler de click (abre TaskModal) |

**Comportamento de click vs drag:**
- Se o ponteiro se mover menos de 5px antes de soltar: e um **click** -> abre modal
- Se o ponteiro se mover 5px ou mais: e um **drag** -> DnD normal

**Implementacao sugerida:**
O Card deve ter um handler `onPointerUp` que verifica se `isDragging` e `false`, e entao chama `onClick(task)`. Alternativa: wrapper div com `onClick` que verifica se nao houve drag.

**Alteracao visual no Card:**
- Adicionar `Badge` de prioridade no card (substituindo tags de prioridade)
- Manter tags genericas (Slack, Nova, Rotina) separadas
- Cursor muda de `grab` para `pointer` quando hover (indicar clickabilidade), mas mantem `grabbing` durante drag

---

### 2.4 Componentes do Board Header (Extensao)

**Arquivo existente:** `src/components/kanban/Board.js`

O Board header atualmente tem botoes sem funcionalidade. Para o Sprint 1:

| Botao | Acao Sprint 1 |
|-------|---------------|
| ArrowLeft (Voltar) | **Remover** ou tornar noop visualmente oculto (nao ha rota para voltar no Sprint 1) |
| Bell (Notificacoes) | **Remover** do Sprint 1 (filtros e notificacoes sao Sprint 2) |
| Filter (Filtrar) | **Remover** do Sprint 1 (Sprint 2) |
| LayoutGrid (Visualizacao) | **Remover** do Sprint 1 (nao ha views alternativas) |

> **Principio:** Zero botoes "mortos". Se nao funciona, nao aparece.

**O que fica no header do Sprint 1:**
- Titulo "Oxy" (ou nome do board do Supabase)
- Avatar group dos membros
- (Futuramente: SearchBar e filtros no Sprint 2)

---

## 3. Padroes de Interacao

### 3.1 Abrir Modal de Detalhes

```
Usuario clica no card
  -> Verifica que nao foi drag (distance < 5px)
  -> Chama onClick(task)
  -> useUIStore.setActiveModal({ type: 'task-detail', taskId })
  -> TaskModal renderiza com overlay
  -> Focus trap ativado (primeiro elemento focavel)
  -> Backdrop fade-in (0.3s)
  -> Modal scale-in (0.3s, 0.95 -> 1.0)
```

**Fechar modal:**
```
Click no X OU click no backdrop OU tecla Escape
  -> useUIStore.clearActiveModal()
  -> Se ha alteracoes nao salvas:
     -> Exibe ConfirmDialog: "Descartar alteracoes?"
     -> Confirmar: fecha sem salvar
     -> Cancelar: volta ao modal
  -> Se nao ha alteracoes: fecha direto
  -> Modal scale-out + backdrop fade-out
```

### 3.2 Criar Nova Tarefa

```
Usuario clica no botao "+ Adicionar tarefa" na coluna
  -> useUIStore.setActiveModal({ type: 'task-create', columnId })
  -> TaskForm renderiza dentro de modal (overlay central)
  -> Focus automatico no campo titulo
  -> Usuario preenche campos
  -> Click "Criar tarefa":
     -> Validacao Zod
     -> Se invalido: exibe erros inline nos FormFields
     -> Se valido:
        -> Botao muda para loading (spinner + "Criando...")
        -> useTaskStore.createTask(data)
        -> Optimistic update: card aparece na coluna imediatamente
        -> Supabase INSERT em background
        -> Sucesso: fecha modal, exibe toast "Tarefa criada com sucesso"
        -> Erro: rollback do optimistic update, exibe toast de erro, modal permanece aberto
```

### 3.3 Editar Tarefa

```
Usuario abre modal de detalhes (3.1)
  -> Edita campos inline
  -> Dirty state tracked (comparacao com estado original)
  -> Botao "Salvar alteracoes" habilita quando dirty
  -> Click "Salvar alteracoes":
     -> Validacao Zod
     -> Se valido:
        -> Botao muda para loading
        -> useTaskStore.updateTask(taskId, changes)
        -> Optimistic update na UI
        -> Supabase UPDATE em background
        -> Sucesso: fecha modal, exibe toast "Tarefa atualizada"
        -> Erro: rollback, toast de erro
```

### 3.4 Deletar Tarefa

```
Usuario abre modal de detalhes
  -> Clica no icone de lixeira (Trash2)
  -> ConfirmDialog aparece:
     Titulo: "Excluir tarefa"
     Mensagem: "Tem certeza que deseja excluir esta tarefa? Esta acao nao pode ser desfeita."
     Botao: "Excluir tarefa" (variant danger, vermelho)
  -> Confirmar:
     -> useTaskStore.deleteTask(taskId)
     -> Optimistic update: card removido da UI
     -> Supabase DELETE em background
     -> Sucesso: fecha modal e ConfirmDialog, toast "Tarefa excluida"
     -> Erro: rollback, toast de erro
  -> Cancelar:
     -> Fecha ConfirmDialog, volta ao modal
```

### 3.5 Colapsar Sidebar

```
Usuario clica no botao ChevronLeft no header da sidebar
  -> useUIStore.toggleSidebar()
  -> CSS transition:
     width: 240px -> 60px (0.3s ease)
     Logo text: opacity 1 -> 0, display none (com delay)
     Nav labels: opacity 1 -> 0, display none
     Nav items: padding ajusta para centralizar icones
  -> Icone do botao rotaciona 180 graus (ChevronLeft -> ChevronRight visualmente)
  -> Board content expande para preencher espaco liberado (flex: 1 faz isso automatico)
  -> Estado salvo no useUIStore (persiste durante sessao)

Click novamente:
  -> Processo inverso, animacao suave
```

### 3.6 Colapsar Coluna

```
Usuario clica no botao ChevronsLeft no header da coluna
  -> useUIStore.toggleColumnCollapse(columnId)
  -> CSS transition:
     width: 320px -> 48px (0.3s ease)
     Cards: opacity 1 -> 0, display none
     Header: transforma em layout vertical
     Titulo: writing-mode vertical, rotacionado 180 graus
  -> Outras colunas expandem no espaco (flex natural do board-content)
  -> Drop zone continua ativa (visual highlight ao arrastar sobre)

Click na coluna colapsada:
  -> Expande novamente (processo inverso)
```

### 3.7 Drag-and-Drop com Persistencia

```
Usuario inicia drag (pointer move > 5px)
  -> DragOverlay renderiza card fantasma
  -> Card original fica com opacity 0.5

Usuario solta o card:
  -> Posicao atualizada na UI (imediato, optimistic)
  -> useTaskStore.moveTask(taskId, newColumnId, newPosition)
  -> Supabase UPDATE do column_id e position (FLOAT)
  -> Se falhar: rollback para posicao anterior, toast de erro

Card solto em coluna colapsada:
  -> Coluna colapsada aceita drop normalmente
  -> Tarefa adicionada ao final da coluna
  -> Badge de contagem atualiza
  -> Visual feedback: borda da coluna colapsada fica com --border-focus durante hover
```

### 3.8 Feedback Visual -- Toasts

| Acao | Tipo Toast | Mensagem |
|------|-----------|----------|
| Tarefa criada | `success` | "Tarefa criada com sucesso" |
| Tarefa atualizada | `success` | "Alteracoes salvas" |
| Tarefa excluida | `success` | "Tarefa excluida" |
| Erro ao salvar | `error` | "Erro ao salvar. Tente novamente." |
| Erro ao carregar | `error` | "Erro ao carregar tarefas. Verifique sua conexao." |
| Erro ao mover (DnD) | `error` | "Erro ao mover tarefa. Posicao restaurada." |

**Duracao padrao:** 4000ms (4 segundos)
**Erros:** 6000ms (mais tempo para ler)

---

## 4. Estados dos Componentes

### 4.1 Input

| Estado | Visual |
|--------|--------|
| **Default** | bg: `--input-bg`, border: `--input-border`, text: `--input-placeholder` |
| **Hover** | bg: `--input-bg-hover`, border: `--input-border` |
| **Focus** | border: `--input-border-focus` (verde), box-shadow: green glow 2px |
| **Error** | border: `--input-border-error` (vermelho), box-shadow: red glow 2px |
| **Disabled** | opacity: 0.5, cursor: not-allowed |
| **Filled** | text: `--input-text`, bg: `--input-bg` |

### 4.2 Select

| Estado | Visual |
|--------|--------|
| **Default** | Mesmo visual do Input com chevron-down a direita |
| **Hover** | bg: `--input-bg-hover` |
| **Open** | border: `--input-border-focus`, dropdown visivel abaixo |
| **Option Hover** | bg: `--bg-card`, text: `--text-primary` |
| **Option Selected** | text: `--accent`, checkmark a esquerda |
| **Disabled** | opacity: 0.5, cursor: not-allowed |
| **Error** | Mesmo do Input com border vermelha |

### 4.3 IconButton

| Estado | Visual |
|--------|--------|
| **Default** | color: `--text-muted`, bg: transparent |
| **Hover (ghost)** | bg: `--bg-elevated`, color: `--text-primary` |
| **Hover (danger)** | bg: `rgba(239,68,68,0.1)`, color: `--color-danger` |
| **Focus** | outline: 2px solid `--border-focus`, offset: 2px |
| **Active** | scale: 0.95 (press feedback) |
| **Disabled** | opacity: 0.4, cursor: not-allowed |

### 4.4 Badge (Prioridade)

| Estado | Visual |
|--------|--------|
| **low** | bg: cinza translucido, text: `--color-neutral`, border: cinza |
| **medium** | bg: amarelo translucido, text: `--color-warning`, border: amarelo |
| **high** | bg: laranja translucido, text: `#f97316`, border: laranja |
| **urgent** | bg: vermelho translucido, text: `--color-danger`, border: vermelho |

### 4.5 Card (Existente + Extensao)

| Estado | Visual |
|--------|--------|
| **Default** | bg: `--bg-card`, border: `--border`, cursor: pointer |
| **Hover** | border: `--border-hover`, slight elevation visual |
| **Focus** | outline: 2px solid `--border-focus`, offset: 2px |
| **Active (press)** | scale: 0.99 (micro feedback) |
| **Dragging** | opacity: 0.5, border: `--border-focus`, shadow: `--shadow-drag` |
| **DragOverlay** | opacity: 1.0, shadow: `--shadow-drag`, scale: 1.02, cursor: grabbing |

### 4.6 Column

| Estado | Visual |
|--------|--------|
| **Default** | bg: `--bg-surface`, border: transparent |
| **DragOver (active-col)** | border: `--border-focus`, bg: `#1c142e` |
| **Collapsed** | width: 48px, titulo vertical, cursor: pointer |
| **Collapsed + DragOver** | border: `--border-focus`, bg: `#1c142e` |
| **Empty** | Texto italico "Nenhuma tarefa" + botao "+" |

### 4.7 Sidebar

| Estado | Visual |
|--------|--------|
| **Expanded (default)** | width: 240px, icones + labels visiveis |
| **Collapsed** | width: 60px, apenas icones centralizados |
| **Nav item default** | color: `--text-secondary`, bg: transparent |
| **Nav item hover** | bg: `--bg-elevated`, color: `--text-primary` |
| **Nav item active** | bg: `--bg-elevated`, icone: `--accent` |

### 4.8 TaskModal

| Estado | Visual |
|--------|--------|
| **Opening** | backdrop fade-in, modal scale 0.95->1.0 |
| **Open** | backdrop: `--bg-overlay`, modal: `--bg-surface` |
| **Closing** | inverso do opening |
| **Dirty (alteracoes pendentes)** | Botao "Salvar" habilitado (accent verde) |
| **Clean (sem alteracoes)** | Botao "Salvar" desabilitado (opacity 0.5) |
| **Saving** | Botao "Salvar" com spinner + texto "Salvando..." |

### 4.9 CreateTaskButton

| Estado | Visual |
|--------|--------|
| **Default** | border dashed: `--border`, color: `--text-muted`, texto "+ Adicionar tarefa" |
| **Hover** | border dashed: `--accent`, color: `--accent`, bg: verde translucido |
| **Active (press)** | bg verde translucido mais intenso |
| **Focus** | outline: 2px solid `--border-focus` |

### 4.10 Toast

| Estado | Visual |
|--------|--------|
| **Entering** | slide-in da direita (translateX 100% -> 0) |
| **Visible** | posicao final, totalmente visivel |
| **Exiting** | slide-out para direita + fade-out |
| **Success** | bg verde translucido, icone CheckCircle verde |
| **Error** | bg vermelho translucido, icone XCircle vermelho |
| **Info** | bg indigo translucido, icone Info indigo |

### 4.11 ConfirmDialog

| Estado | Visual |
|--------|--------|
| **Opening** | Mesmo do modal (backdrop fade-in, dialog scale-in) |
| **Default variant** | Botao primario accent (verde) |
| **Danger variant** | Botao primario vermelho (`--color-danger`) |
| **Confirming** | Botao com spinner (se acao async) |

---

## 5. Responsividade dos Novos Componentes

### 5.1 Breakpoints (Reutilizando os Existentes)

| Breakpoint | Range | Alvo |
|-----------|-------|------|
| **Desktop** | > 1024px | Prioridade principal |
| **Tablet** | 768px -- 1024px | Funcional |
| **Mobile** | < 768px | Funcional (layout adaptado) |

### 5.2 TaskModal

| Breakpoint | Comportamento |
|-----------|--------------|
| **Desktop** | Modal centralizado, `max-width: 560px`, padding `24px` |
| **Tablet** | Modal centralizado, `max-width: 480px`, padding `20px` |
| **Mobile** | **Fullscreen**, `inset: 0`, sem border-radius, scroll interno |

```css
@media (max-width: 768px) {
  .modalContent {
    max-width: 100%;
    max-height: 100%;
    height: 100%;
    border-radius: 0;
    animation: slideUp var(--transition-slow) ease;
  }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

### 5.3 TaskForm

| Breakpoint | Comportamento |
|-----------|--------------|
| **Desktop** | Campos em grid 2 colunas (Tipo + Prioridade lado a lado) |
| **Mobile** | Todos os campos em stack vertical (1 coluna) |

```css
.formGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

@media (max-width: 768px) {
  .formGrid {
    grid-template-columns: 1fr;
  }
}
```

### 5.4 Sidebar

| Breakpoint | Comportamento |
|-----------|--------------|
| **Desktop** | Expandida por padrao (240px), colapsavel via botao |
| **Tablet** | **Colapsada por padrao** (60px), expandivel via botao |
| **Mobile** | Barra horizontal no topo (comportamento atual), sem collapse |

### 5.5 Colunas Colapsadas

| Breakpoint | Comportamento |
|-----------|--------------|
| **Desktop** | Colunas colapsam para 48px com titulo vertical |
| **Tablet** | Mesmo comportamento, colunas com 280px quando expandidas |
| **Mobile** | Collapse desabilitado (colunas ficam em scroll horizontal) |

### 5.6 Toast

| Breakpoint | Comportamento |
|-----------|--------------|
| **Desktop** | Bottom-right, 360px de largura |
| **Mobile** | Bottom-center, largura `calc(100vw - 32px)`, sem margin lateral |

```css
@media (max-width: 768px) {
  .toastContainer {
    right: var(--space-4);
    left: var(--space-4);
    bottom: var(--space-4);
  }

  .toast {
    width: 100%;
  }
}
```

### 5.7 ConfirmDialog

| Breakpoint | Comportamento |
|-----------|--------------|
| **Desktop** | Centralizado, max-width 400px |
| **Mobile** | Centralizado com padding lateral, `max-width: calc(100vw - 32px)` |

---

## 6. ASCII Wireframes

### 6.1 TaskModal -- Desktop

```
+----------------------------------------------------------+
|                     BACKDROP (overlay)                     |
|                                                            |
|    +--------------------------------------------------+   |
|    |  [Bug]  Analise Vertical                    [X]  |   |
|    |--------------------------------------------------|   |
|    |                                                  |   |
|    |  Titulo                                          |   |
|    |  +----------------------------------------------+|   |
|    |  | Analise Vertical                             ||   |
|    |  +----------------------------------------------+|   |
|    |                                                  |   |
|    |  Tipo                                            |   |
|    |  [Tarefa] [User Story] [*Bug*] [Epico]           |   |
|    |                                                  |   |
|    |  Prioridade                                      |   |
|    |  [Baixa] [Media] [Alta] [*Urgente*]              |   |
|    |                                                  |   |
|    |  Descricao                                       |   |
|    |  +----------------------------------------------+|   |
|    |  | Adicione uma descricao...                    ||   |
|    |  |                                              ||   |
|    |  +----------------------------------------------+|   |
|    |                                                  |   |
|    |  Responsavel            Coluna                   |   |
|    |  +------------------+  +--------------------+    |   |
|    |  | Carlos      [v]  |  | Priorizado    [v]  |   |   |
|    |  +------------------+  +--------------------+    |   |
|    |                                                  |   |
|    |  Criado em: 20/02/2026 14:30                     |   |
|    |                                                  |   |
|    |--------------------------------------------------|   |
|    |  [Trash]            [Cancelar] [Salvar alteracoes]|   |
|    +--------------------------------------------------+   |
|                                                            |
+----------------------------------------------------------+
```

### 6.2 TaskModal -- Mobile (Fullscreen)

```
+------------------------+
| [<]  Detalhes     [X]  |
|------------------------|
|                        |
| Titulo                 |
| +--------------------+ |
| | Analise Vertical   | |
| +--------------------+ |
|                        |
| Tipo                   |
| [Tarefa] [US]          |
| [*Bug*]  [Epico]       |
|                        |
| Prioridade             |
| [Baixa]  [Media]       |
| [Alta]  [*Urgente*]    |
|                        |
| Descricao              |
| +--------------------+ |
| | Adicione uma       | |
| | descricao...       | |
| +--------------------+ |
|                        |
| Responsavel            |
| +--------------------+ |
| | Carlos        [v]  | |
| +--------------------+ |
|                        |
| Coluna                 |
| +--------------------+ |
| | Priorizado    [v]  | |
| +--------------------+ |
|                        |
| Criado em:             |
| 20/02/2026 14:30       |
|                        |
|------------------------|
| [Trash]  [Canc] [Salv] |
+------------------------+
```

### 6.3 Coluna com Botao "+" de Criar Tarefa

```
+---------------------------+
| * A Fazer          [3] [<]|    <- Header: dot + titulo + count + collapse
|---------------------------|
|                           |
| +------------------------+|
| | [Copy] Tarefa          ||    <- Card 1
| | Corrigir mapeamento... ||
| | [Media]                ||
| | [msg 0]           [A]  ||
| +------------------------+|
|                           |
| +------------------------+|
| | [Book] User Story      ||    <- Card 2
| | US-014: Criacao de...  ||
| | [Media]                ||
| | [msg 0]           [B]  ||
| +------------------------+|
|                           |
| +------------------------+|
| | [Copy] Tarefa          ||    <- Card 3
| | Revisar documentacao   ||
| | [Baixa]                ||
| | [msg 0]           [F]  ||
| +------------------------+|
|                           |
| +- - - - - - - - - - - -+|
| |    + Adicionar tarefa   ||    <- Botao criar (borda dashed)
| +- - - - - - - - - - - -+|
|                           |
+---------------------------+
```

### 6.4 Sidebar Expandida vs Colapsada

**Expandida (240px):**
```
+--------------------+
| [K] O2 Kanban  [<] |    <- Logo + texto + collapse btn
|--------------------|
|                    |
| [#] Meus Quadros   |    <- Nav item ativo (com accent)
| [U] Usuarios       |    <- Nav item
| [S] Configuracoes  |    <- Nav item
|                    |
|                    |
|                    |
+--------------------+
```

**Colapsada (60px):**
```
+--------+
|  [K]   |    <- Apenas icone do logo
|--------|
|        |
|  [#]   |    <- Icone nav (com tooltip "Meus Quadros")
|  [U]   |    <- Icone nav (com tooltip "Usuarios")
|  [S]   |    <- Icone nav (com tooltip "Configuracoes")
|        |
|  [>]   |    <- Botao expand (chevron rotacionado)
+--------+
```

### 6.5 Coluna Colapsada

**Expandida (320px) vs Colapsada (48px):**

```
EXPANDIDA:                        COLAPSADA:
+---------------------------+     +------+
| * Em Progresso     [2] [<]|     | [*]  |    <- Status dot
|---------------------------|     |      |
|                           |     | [2]  |    <- Count badge
| +------------------------+|     |      |
| | [Zap] Epico            ||     |  E   |
| | Gerenciamento de...    ||     |  m   |    <- Titulo vertical
| | [Media]                ||     |      |    (writing-mode: vertical)
| | [msg 0]           [F]  ||     |  P   |
| +------------------------+|     |  r   |
|                           |     |  o   |
| +- - - - - - - - - - - -+|     |  g   |
| |    + Adicionar tarefa   ||     |  r   |
| +- - - - - - - - - - - -+|     |  e   |
|                           |     |  s   |
+---------------------------+     |  s   |
                                  |  o   |
                                  |      |
                                  +------+
```

### 6.6 ConfirmDialog (Delete)

```
+----------------------------------------------------------+
|                     BACKDROP (overlay)                     |
|                                                            |
|          +------------------------------------+            |
|          |  Excluir tarefa                    |            |
|          |                                    |            |
|          |  Tem certeza que deseja excluir     |            |
|          |  esta tarefa? Esta acao nao pode    |            |
|          |  ser desfeita.                      |            |
|          |                                    |            |
|          |         [Cancelar] [Excluir tarefa] |            |
|          +------------------------------------+            |
|                                                            |
+----------------------------------------------------------+
```

### 6.7 Toast (Success)

```
                                    +---------------------------+
                                    | [CheckCircle] Tarefa      |
                                    |  criada com sucesso   [X] |
                                    +---------------------------+
                                                      ^
                                                Bottom-right
```

### 6.8 Layout Geral -- Desktop (Sprint 1)

```
+--------+---------------------------------------------------+
|        | [<-]  Oxy           [M][A][F][C][+5]              |
| O2     |---------------------------------------------------|
| Kanban |                                                   |
|--------|  +--------+ +--------+ +--------+ +--------+ ... |
| [#] My |  |A Fazer | |Prioriz.| |Em Prog.| |Revisao |     |
| [U] Us |  |  [3]   | |  [1]   | |  [1]   | |  [0]   |     |
| [S] Co |  |--------| |--------| |--------| |--------|     |
|        |  | Card 1 | | Card 3 | | Card 4 | |Nenhuma |     |
|        |  | Card 2 | |        | |        | |tarefa  |     |
|        |  | Card 5 | |+ Add..| |+ Add..| |        |     |
|        |  |+ Add..| |        | |        | |+ Add..|     |
|        |  +--------+ +--------+ +--------+ +--------+     |
+--------+---------------------------------------------------+
```

---

## 7. Resumo de Entregaveis

### 7.1 Novos Design Tokens Adicionados

| Categoria | Quantidade | Tokens |
|-----------|:----------:|--------|
| Form Inputs | 9 | `--input-bg`, `--input-bg-hover`, `--input-border`, `--input-border-focus`, `--input-border-error`, `--input-text`, `--input-placeholder`, `--input-radius`, `--input-height`, `--input-height-sm` |
| Toast Colors | 9 | `--toast-bg-*`, `--toast-border-*`, `--toast-text-*` (x3 variantes) |
| Transitions | 3 | `--transition-fast`, `--transition-slow`, `--transition-spring` |
| Layout | 7 | `--sidebar-width-collapsed`, `--column-width-collapsed`, `--modal-width`, `--modal-max-height`, `--toast-width`, `--z-modal`, `--z-toast`, `--z-dropdown` |
| Priority Badge | 12 | `--priority-*-bg`, `--priority-*-text`, `--priority-*-border` (x4 prioridades) |
| **Total** | **~40** | |

### 7.2 Novos Componentes

| Nivel | Componente | Arquivo | CSS Module |
|-------|-----------|---------|------------|
| Atomo | Input | `ui/Input.js` | `Input.module.css` |
| Atomo | Select | `ui/Select.js` | `Select.module.css` |
| Atomo | IconButton | `ui/IconButton.js` | `IconButton.module.css` |
| Atomo | Badge | `ui/Badge.js` | `Badge.module.css` |
| Molecula | FormField | `ui/FormField.js` | `FormField.module.css` |
| Molecula | TaskTypeSelector | `ui/TaskTypeSelector.js` | `TaskTypeSelector.module.css` |
| Molecula | PrioritySelector | `ui/PrioritySelector.js` | `PrioritySelector.module.css` |
| Organismo | Toast | `ui/Toast.js` | `Toast.module.css` |
| Organismo | ConfirmDialog | `ui/ConfirmDialog.js` | `ConfirmDialog.module.css` |
| Organismo | TaskModal | `kanban/TaskModal.js` | `TaskModal.module.css` |
| Organismo | TaskForm | `kanban/TaskForm.js` | `TaskForm.module.css` |
| Organismo | CreateTaskButton | `kanban/CreateTaskButton.js` | `CreateTaskButton.module.css` |
| **Extensao** | Card (onClick, Badge) | `kanban/Card.js` | (existente) |
| **Extensao** | Column (collapse, create btn) | `kanban/Column.js` | `CollapsibleColumn.module.css` |
| **Extensao** | Sidebar (collapse) | `kanban/Sidebar.js` | (existente + novos estilos) |
| **Extensao** | Board (header cleanup) | `kanban/Board.js` | (existente) |

### 7.3 Componentes Existentes Modificados

| Componente | Modificacao |
|-----------|-------------|
| `Card.js` | Adicionar `onClick` prop, Badge de prioridade, diferenciacao click vs drag |
| `Column.js` | Adicionar collapse state, CreateTaskButton no footer, DnD em coluna colapsada |
| `Sidebar.js` | Adicionar collapse state com `isCollapsed`/`onToggle` props, transicoes |
| `Board.js` | Remover botoes sem funcionalidade (Bell, Filter, LayoutGrid, ArrowLeft) |
| `page.js` | Extrair estado para Zustand stores, coordenar modals via useUIStore |

### 7.4 Checklist de Acessibilidade (Novos Componentes)

| Requisito | Aplicacao |
|-----------|-----------|
| ARIA labels | Todos os botoes (`aria-label`), modal (`aria-modal`, `role="dialog"`), selects (`role="listbox"`) |
| Focus trap | TaskModal, ConfirmDialog |
| Keyboard nav | Escape fecha modal/dropdown, Enter confirma, Tab navega, Arrow keys em selects |
| Focus visible | Todos os elementos interativos (ja definido no globals.css) |
| Contraste | Minimo WCAG AA (4.5:1 para texto, 3:1 para elementos UI) -- garantido pelos tokens existentes |
| Screen reader | Toasts anunciados via `role="alert"`, live region `aria-live="polite"` |
| Semantic HTML | `<dialog>` para modals, `<button>` para acoes, `<label>` para form fields |

### 7.5 Dependencias de Implementacao

```
1. Zustand stores (useUIStore, useTaskStore)
   |
   +-> 2. Sidebar collapse (useUIStore.sidebarCollapsed)
   +-> 3. Column collapse (useUIStore.collapsedColumns)
   +-> 4. TaskModal (useUIStore.activeModal + useTaskStore)
   +-> 5. TaskForm / CreateTaskButton (useTaskStore.createTask)
   +-> 6. Toast system (useUIStore.toasts)
   |
   7. Card onClick (abre TaskModal)
   8. Board header cleanup (remover botoes mortos)
```

**Ordem sugerida de implementacao:**
1. Design tokens em `globals.css`
2. Atomos (Input, Select, IconButton, Badge)
3. Moleculas (FormField, TaskTypeSelector, PrioritySelector)
4. Toast + ConfirmDialog
5. Sidebar collapse
6. Column collapse
7. CreateTaskButton + TaskForm
8. TaskModal (detail/edit)
9. Card click integration
10. Board header cleanup

---

> **Documento preparado por Uma (UX/UI Design Expert Agent)**
> **Orquestrado por Orion (Master Orchestrator)**
> **Para uso interno da O2 Inc -- Fevereiro 2026**
