-- ============================================
-- O2 Kanban: Sprint 2 Migration
-- Nova tabela: task_comments
-- Novos indices para filtros
-- ============================================

-- === Nova tabela: task_comments ===

CREATE TABLE task_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  board_id    UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  author      VARCHAR(100) NOT NULL,
  content     TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 5000),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indice principal: listar comentarios de uma task ordenados por data
CREATE INDEX idx_comments_task_created ON task_comments(task_id, created_at ASC);

-- Indice secundario: buscar comentarios por board
CREATE INDEX idx_comments_board ON task_comments(board_id);

-- Trigger: auto-update updated_at
CREATE TRIGGER trg_comments_updated_at
  BEFORE UPDATE ON task_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: Acesso publico temporario (Sprint 2, sem auth)
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sprint 2: acesso publico a comments"
  ON task_comments FOR ALL
  USING (true)
  WITH CHECK (true);

-- === Novos indices para filtros (futuro server-side) ===

CREATE INDEX idx_tasks_type ON tasks(board_id, type);
CREATE INDEX idx_tasks_priority ON tasks(board_id, priority);
CREATE INDEX idx_tasks_assignee ON tasks(board_id, assignee);
CREATE INDEX idx_tasks_due_date ON tasks(board_id, due_date)
  WHERE due_date IS NOT NULL;
