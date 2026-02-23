-- Migration: AI tables
-- Configuracao e historico de chat do agente IA

CREATE TABLE ai_board_config (
  board_id   UUID PRIMARY KEY REFERENCES boards(id) ON DELETE CASCADE,
  enabled    BOOLEAN DEFAULT false,
  auto_estimate BOOLEAN DEFAULT true,
  auto_alerts   BOOLEAN DEFAULT true,
  language   TEXT DEFAULT 'pt-BR',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ai_chat_history (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id   UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ai_chat_board ON ai_chat_history(board_id, created_at);

-- RLS: authenticated pode tudo (controle no API, mesmo padrao de join_requests)
ALTER TABLE ai_board_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage ai_board_config"
  ON ai_board_config
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage ai_chat_history"
  ON ai_chat_history
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
