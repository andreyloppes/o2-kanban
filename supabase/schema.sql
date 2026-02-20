-- ============================================
-- O2 Kanban: Sprint 1 Schema
-- Apenas boards, columns, tasks
-- Auth/Users vem no Sprint 3
-- ============================================

-- ============================================
-- BOARDS
-- ============================================
CREATE TABLE boards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- COLUMNS
-- ============================================
CREATE TABLE columns (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id       UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title          VARCHAR(200) NOT NULL,
  color          VARCHAR(50),
  position       INT NOT NULL,
  wip_limit      INTEGER,
  is_done_column BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- TASKS
-- ============================================
CREATE TABLE tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id    UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  column_id   UUID NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  title       VARCHAR(500) NOT NULL,
  description TEXT,
  type        VARCHAR(50) DEFAULT 'task'
                CHECK (type IN ('task', 'user_story', 'bug', 'epic', 'spike')),
  priority    VARCHAR(20) DEFAULT 'medium'
                CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assignee    VARCHAR(100),
  position    DOUBLE PRECISION NOT NULL,
  due_date    DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_tasks_column_position ON tasks(column_id, position);
CREATE INDEX idx_tasks_board ON tasks(board_id);
CREATE INDEX idx_columns_board ON columns(board_id, position);

-- ============================================
-- TRIGGER: auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_boards_updated_at
  BEFORE UPDATE ON boards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- RLS: Acesso publico temporario (Sprint 1, sem auth)
-- Sera restrito no Sprint 3
-- ============================================
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sprint 1: acesso publico a boards"
  ON boards FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Sprint 1: acesso publico a columns"
  ON columns FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Sprint 1: acesso publico a tasks"
  ON tasks FOR ALL
  USING (true)
  WITH CHECK (true);
