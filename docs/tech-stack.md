# O2 Kanban -- Tech Stack & Dependencias (Sprint 1)

> **Documento:** Especificacao de Pacotes e Configuracoes
> **Projeto:** O2 Kanban -- Sprint 1 Enhancement
> **Fase:** Phase 3 -- Validation & Sharding
> **Data:** 20 de Fevereiro de 2026
> **Autor:** Pax (Product Owner Agent)
> **Versao:** 1.0

---

## 1. Dependencias Atuais (Manter)

Estas dependencias ja existem no projeto e **nao devem ser alteradas**:

| Pacote | Versao Atual | Proposito |
|--------|:------------|-----------|
| `next` | 16.1.6 | Framework React (App Router, API Routes, SSR) |
| `react` | 19.2.3 | Biblioteca UI |
| `react-dom` | 19.2.3 | Renderizacao DOM |
| `@dnd-kit/core` | ^6.3.1 | Drag-and-drop core (DndContext, sensores, collision) |
| `@dnd-kit/sortable` | ^10.0.0 | DnD sortable (SortableContext, useSortable) |
| `@dnd-kit/utilities` | ^3.2.2 | Utilities DnD (CSS transform helpers) |
| `lucide-react` | ^0.575.0 | Icones SVG (tree-shakeable) |

### DevDependencies (Manter)

| Pacote | Versao Atual | Proposito |
|--------|:------------|-----------|
| `babel-plugin-react-compiler` | 1.0.0 | React Compiler (otimizacao automatica) |
| `eslint` | ^9 | Linting |
| `eslint-config-next` | 16.1.6 | Regras ESLint para Next.js |

---

## 2. Novas Dependencias (Instalar)

### Comando de Instalacao

```bash
npm install @supabase/supabase-js zustand zod
```

### Detalhamento

| Pacote | Versao | Tamanho | Proposito | ADR |
|--------|:------:|:-------:|-----------|:---:|
| `@supabase/supabase-js` | ^2.x | ~50KB (gzipped) | SDK Supabase: client PostgreSQL, queries, auth (futuro), realtime (futuro). Usado em `lib/supabase/client.js` (browser) e `lib/supabase/server.js` (API routes). | ADR-001 |
| `zustand` | ^5.x | ~1KB (gzipped) | State management minimalista. Substitui `useState` centralizado em page.js. Stores: `useBoardStore`, `useUIStore`. Middleware `persist` disponivel para localStorage (nao usado no Sprint 1). | ADR-002 |
| `zod` | ^3.x | ~13KB (gzipped) | Validacao de schemas em runtime. Usado em API routes (validar request body) e opcionalmente no client (validar forms). Schemas: `createTaskSchema`, `updateTaskSchema`, `moveTaskSchema`. | -- |

### Impacto no Bundle

| Metrica | Antes | Depois (estimativa) | Impacto |
|---------|:-----:|:-------------------:|:-------:|
| Deps runtime | 6 pacotes | 9 pacotes | +3 |
| Bundle size (estimativa) | ~85KB (gzipped) | ~149KB (gzipped) | +~64KB |
| Pacote mais pesado adicionado | -- | @supabase/supabase-js (~50KB) | -- |

> **Nota:** O Supabase SDK e o maior acrescimo. Para sprints futuros, considerar lazy-loading do SDK ou usar apenas a REST API diretamente (sem SDK) para reducao de bundle.

---

## 3. Dependencias NAO Instalar no Sprint 1

Estes pacotes estao planejados para sprints futuros:

| Pacote | Sprint Planejado | Proposito |
|--------|:----------------:|-----------|
| `vitest` | Sprint 2 | Testes unitarios/integracao |
| `@testing-library/react` | Sprint 2 | Testes de componentes React |
| `@testing-library/jest-dom` | Sprint 2 | Matchers extras para testes DOM |
| `playwright` | Sprint 4 | Testes end-to-end |
| `@supabase/ssr` | Sprint 3 | Helpers SSR para auth cookies (quando auth for implementado) |

---

## 4. Variaveis de Ambiente

### 4.1 Criar `.env.local`

```bash
# Supabase -- Obter em https://app.supabase.com > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://[SEU-PROJETO].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[SUA-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[SUA-SERVICE-ROLE-KEY]
```

### 4.2 Criar `.env.example` (template para devs, sem valores)

```bash
# Supabase -- Obter em https://app.supabase.com > Settings > API
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### 4.3 Detalhamento das Variaveis

| Variavel | Prefixo | Exposicao | Onde Usar | Descricao |
|----------|---------|:---------:|-----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `NEXT_PUBLIC_` | Client + Server | `lib/supabase/client.js`, `lib/supabase/server.js` | URL do projeto Supabase. Prefixo NEXT_PUBLIC_ necessario para acesso no browser. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_` | Client + Server | `lib/supabase/client.js` | Chave anonima (publica). Segura para expor no client -- protegida por RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | (nenhum) | Apenas Server | `lib/supabase/server.js` | Chave de servico (privilegiada). **NUNCA expor no client.** Usada apenas em API routes server-side. Bypass RLS. |

### 4.4 Adicionar ao `.gitignore`

```
# Env files
.env.local
.env*.local
```

> **IMPORTANTE:** O arquivo `.env.local` ja e ignorado por padrao no Next.js, mas e boa pratica garantir que esta no `.gitignore`. A `SUPABASE_SERVICE_ROLE_KEY` **nunca** deve ser commitada.

---

## 5. Configuracao Supabase

### 5.1 Criar Projeto no Supabase

1. Acessar https://app.supabase.com
2. Criar novo projeto (nome sugerido: `o2-kanban`)
3. Selecionar regiao mais proxima (ex: `South America (Sao Paulo)` se disponivel, ou `US East`)
4. Definir senha do banco de dados
5. Aguardar provisionamento (~2 minutos)

### 5.2 Obter Credenciais

1. Ir em **Settings > API**
2. Copiar:
   - `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public` key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key -> `SUPABASE_SERVICE_ROLE_KEY`

### 5.3 Executar Schema SQL

1. Ir em **SQL Editor** no Supabase Dashboard
2. Executar o SQL de criacao de tabelas (definido em `architecture-sprint1.md` secao 3.1)
3. Executar o SQL de seed data (definido em `architecture-sprint1.md` secao 3.2)
4. Verificar no **Table Editor** que os dados foram inseridos:
   - 1 board ("Oxy")
   - 6 colunas (A Fazer, Priorizado, Em Progresso, Revisao, Concluido, Backlog)
   - 4 tasks iniciais

### 5.4 Free Tier -- Limites

| Recurso | Limite Free Tier | Uso Estimado Sprint 1 |
|---------|:----------------:|:---------------------:|
| Database | 500 MB | < 1 MB |
| API requests | Ilimitado | Baixo (~100/dia para ~10 users) |
| Realtime connections | 200 simultaneas | N/A (Sprint 1 nao usa Realtime) |
| Auth users | 50.000 MAU | N/A (Sprint 1 nao tem auth) |
| Storage | 1 GB | N/A |
| Edge Functions | 500K invocacoes/mes | N/A |

**Conclusao:** O free tier e mais que suficiente para Sprint 1 e provavelmente para todos os 4 sprints com ~10 usuarios.

---

## 6. Configuracoes Existentes (Nao Alterar)

### 6.1 next.config.mjs

O arquivo de configuracao do Next.js ja contem:
- `reactCompiler: true` -- React Compiler habilitado
- Nenhuma alteracao necessaria para Sprint 1

### 6.2 ESLint

Configuracao existente (`eslint-config-next`) e suficiente. Nenhuma alteracao necessaria.

### 6.3 CSS

- `globals.css` -- Design tokens existentes (sera ESTENDIDO com ~40 novos tokens)
- `kanban.css` -- Estilos globais (sera ESTENDIDO com estilos de collapse)
- Novos componentes usarao CSS Modules (`.module.css`)
- Tokens em globals.css sao acessiveis em CSS Modules via `var(--token-name)`

---

## 7. Stack Consolidada (Sprint 1)

```
CAMADA            TECNOLOGIA              STATUS         NOTAS
-----------       ----------------------  ----------     ---------------------------
Framework         Next.js 16 (App Router) Existente      Nao alterar
UI                React 19                Existente      React Compiler habilitado
DnD               @dnd-kit (3 pacotes)    Existente      Core + Sortable + Utilities
Icones            lucide-react            Existente      Tree-shakeable
Backend/DB        Supabase (PostgreSQL)   NOVO           SDK @supabase/supabase-js
State             Zustand                 NOVO           2 stores (board, ui)
Validacao         Zod                     NOVO           Schemas para API e forms
Estilos           CSS Modules + tokens    Existente*     *Novos componentes em Modules
Linting           ESLint + eslint-next    Existente      Nao alterar
Compilacao        babel-plugin-react-compiler  Existente  Nao alterar
```

---

## 8. Checklist de Setup

Antes de iniciar a implementacao dos componentes, o Dex deve verificar:

- [ ] `npm install @supabase/supabase-js zustand zod` executado sem erros
- [ ] `.env.local` criado com as 3 variaveis Supabase preenchidas
- [ ] `.env.example` criado (template sem valores)
- [ ] `.gitignore` contem `.env.local` e `.env*.local`
- [ ] Projeto Supabase criado e acessivel
- [ ] Schema SQL executado (3 tabelas: boards, columns, tasks)
- [ ] Seed data inserido (1 board, 6 colunas, 4 tasks)
- [ ] `src/lib/supabase/client.js` criado e importavel
- [ ] `src/lib/supabase/server.js` criado e importavel
- [ ] `npm run dev` inicia sem erros
- [ ] Console do browser sem erros de conexao Supabase

---

> **Documento preparado por Pax (Product Owner Agent)**
> **Para uso do Dex (Dev Agent) -- Fevereiro 2026**
