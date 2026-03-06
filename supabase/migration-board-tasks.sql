-- ============================================
-- Board Tasks (tarefas pessoais por board)
-- ============================================

CREATE TABLE IF NOT EXISTS board_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT false,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  position DOUBLE PRECISION NOT NULL DEFAULT 0,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indices
CREATE INDEX idx_board_tasks_board_user ON board_tasks(board_id, user_id);
CREATE INDEX idx_board_tasks_card ON board_tasks(card_id);
CREATE INDEX idx_board_tasks_position ON board_tasks(board_id, user_id, position);

-- RLS
ALTER TABLE board_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "board_tasks_select" ON board_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "board_tasks_insert" ON board_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "board_tasks_update" ON board_tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "board_tasks_delete" ON board_tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger updated_at
CREATE TRIGGER set_board_tasks_updated_at
  BEFORE UPDATE ON board_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
