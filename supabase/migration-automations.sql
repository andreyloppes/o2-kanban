-- Migration: Board Automations
-- Regras de automacao por board

CREATE TABLE IF NOT EXISTS board_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('task_moved_to_column', 'task_created', 'task_overdue', 'timer_completed')),
  trigger_config JSONB DEFAULT '{}',
  action_type TEXT NOT NULL CHECK (action_type IN ('set_priority', 'assign_member', 'log_execution', 'move_to_column', 'add_comment')),
  action_config JSONB DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_automations_board ON board_automations(board_id, enabled);

-- RLS
ALTER TABLE board_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Membros podem ver automacoes do board"
  ON board_automations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = board_automations.board_id
        AND board_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners podem criar automacoes"
  ON board_automations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = board_automations.board_id
        AND board_members.user_id = auth.uid()
        AND board_members.role = 'owner'
    )
  );

CREATE POLICY "Owners podem atualizar automacoes"
  ON board_automations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = board_automations.board_id
        AND board_members.user_id = auth.uid()
        AND board_members.role = 'owner'
    )
  );

CREATE POLICY "Owners podem deletar automacoes"
  ON board_automations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = board_automations.board_id
        AND board_members.user_id = auth.uid()
        AND board_members.role = 'owner'
    )
  );

-- Trigger updated_at (reutiliza funcao existente)
CREATE TRIGGER set_updated_at_board_automations
  BEFORE UPDATE ON board_automations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
