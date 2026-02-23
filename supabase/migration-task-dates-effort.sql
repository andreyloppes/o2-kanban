-- ============================================
-- O2 Kanban: Migration - Task Dates & Effort
-- Adiciona data de inicio, esforço previsto,
-- e log de execução para calculo de media
-- ============================================

-- Data de inicio da tarefa
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_date DATE;

-- Esforço previsto em minutos (editavel manualmente, auto-calculado por IA no futuro)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_duration_min INTEGER;

-- ============================================
-- LOG DE EXECUÇÃO (para calculo de media)
-- Quando o timer é pausado/parado, registra
-- o tempo real gasto. Usado pela IA para
-- calcular tempo medio de tarefas semelhantes.
-- ============================================
CREATE TABLE IF NOT EXISTS task_execution_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  board_id    UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title       VARCHAR(500) NOT NULL,
  type        VARCHAR(50),
  duration_ms INTEGER NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_task_exec_board_type ON task_execution_log(board_id, type);
CREATE INDEX idx_task_exec_title ON task_execution_log(board_id, title);

-- RLS
ALTER TABLE task_execution_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage task_execution_log"
  ON task_execution_log
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
