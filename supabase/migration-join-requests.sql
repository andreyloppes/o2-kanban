-- Migration: join_requests table
-- Solicitações de acesso a boards

CREATE TABLE join_requests (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id   UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (board_id, user_id)
);

-- Indices para queries comuns
CREATE INDEX idx_join_requests_board_status ON join_requests(board_id, status);
CREATE INDEX idx_join_requests_user_status ON join_requests(user_id, status);

-- Reutiliza trigger update_updated_at() de schema.sql
CREATE TRIGGER set_join_requests_updated_at
  BEFORE UPDATE ON join_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS: authenticated pode tudo (controle no API, mesmo padrao de board_members)
ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage join_requests"
  ON join_requests
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
