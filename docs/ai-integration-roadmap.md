# O2 Kanban - Roadmap de Integracao com IA

## Visao Geral

Agente de IA integrado ao sistema kanban que opera respeitando as permissoes do usuario.
O agente entende o contexto do board, historico de tarefas e padroes de execucao para
auxiliar na gestao de projetos.

## Fase 1: Estimativa Automatica de Esforco (Atual)

### Infraestrutura Pronta
- [x] Campos `start_date` e `estimated_duration_min` na tabela tasks
- [x] Tabela `task_execution_log` para registrar tempo real de execucao
- [x] API `GET /api/tasks/{id}/execution-log` para buscar media de duracao
- [x] API `POST /api/tasks/{id}/execution-log` para registrar execucao
- [x] Campo editavel "Esforco previsto" (hh:mm) no modal de tarefa

### Proximo Passo
- [ ] Ao criar tarefa, consultar automaticamente a media de tarefas semelhantes
- [ ] Usar titulo + tipo como criterio de similaridade
- [ ] Sugerir estimativa baseada no historico (usuario pode aceitar ou ajustar)
- [ ] Ao mover tarefa para coluna "done" com timer ativo, registrar no execution_log

## Fase 2: Agente de IA no Board

### Modelo de Permissoes
O agente herda EXATAMENTE as permissoes do usuario que o invoca:

| Permissao do Usuario | Capacidade do Agente |
|----------------------|---------------------|
| Visitante (nao-membro) | Apenas visualizar + responder perguntas |
| Membro | Visualizar + sugerir (nao executa sem comando) |
| Admin/Owner | Criar, editar, mover tarefas por comando |

### Comandos do Agente (via chat no board)
```
@ai resumo          → Resumo do estado atual do board
@ai sugerir         → Sugestoes baseadas no backlog
@ai estimar [task]  → Estimar esforco de uma tarefa
@ai criar [titulo]  → Criar tarefa (somente admin, por comando)
@ai mover [task] [coluna] → Mover tarefa entre colunas
@ai relatorio       → Gerar relatorio de sprint/semana
@ai priorizar       → Sugerir reordenacao de prioridades
```

### Principios
1. **Nunca age sem comando**: O agente sugere, o usuario decide
2. **Transparente**: Toda acao mostra o que vai fazer antes de executar
3. **Auditavel**: Log de todas as acoes do agente com timestamp
4. **Reversivel**: Toda acao do agente pode ser desfeita

## Fase 3: Analise e Insights

### Metricas Automaticas
- Lead time medio por tipo de tarefa
- Cycle time por coluna
- Throughput semanal/mensal
- Burndown/burnup automatico
- Deteccao de gargalos (tarefas paradas > X dias)

### Alertas Inteligentes
- Tarefa parada na mesma coluna por muito tempo
- Sprint com risco de nao entregar (baseado no velocity)
- Membro sobrecarregado (muitas tarefas em progresso)
- Tarefa sem estimativa ou responsavel

## Fase 4: Integracao Profunda

### Contexto Expandido
- Analise de descricoes para categorizar automaticamente
- Deteccao de dependencias entre tarefas
- Sugestao de quebra de tarefas grandes (epics → stories → tasks)
- Deteccao de duplicatas

### Automacoes
- Auto-mover tarefa para "done" quando PR e mergeado (via webhook)
- Criar tarefa automaticamente a partir de bug report
- Gerar release notes a partir das tarefas concluidas
- Retrospectiva automatica ao final do sprint

## Stack Tecnica Planejada

| Componente | Tecnologia |
|------------|-----------|
| LLM | Claude API (Anthropic) |
| Embeddings | Para similaridade de tarefas |
| Chat UI | Componente lateral no board |
| Auth | Reusa auth existente (Supabase) |
| Logs | Tabela `ai_actions_log` no Supabase |
| Rate limiting | Por usuario, por board |

## Tabelas Futuras (Supabase)

```sql
-- Log de acoes do agente
CREATE TABLE ai_actions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES boards(id),
  user_id UUID REFERENCES users(id),
  action_type TEXT NOT NULL,
  input_text TEXT,
  output_text TEXT,
  task_id UUID REFERENCES tasks(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Configuracao do agente por board
CREATE TABLE ai_board_config (
  board_id UUID PRIMARY KEY REFERENCES boards(id),
  enabled BOOLEAN DEFAULT false,
  auto_estimate BOOLEAN DEFAULT true,
  auto_alerts BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'pt-BR'
);
```

## Cronograma Estimado

| Fase | Escopo | Status |
|------|--------|--------|
| 1 | Estimativa de esforco | Em andamento |
| 2 | Agente com comandos | Planejado |
| 3 | Analise e insights | Futuro |
| 4 | Integracao profunda | Futuro |
