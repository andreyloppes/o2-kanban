-- Migration: personal_todos
-- Cria tabela de to-dos pessoais para a Central de Tarefas

CREATE TABLE IF NOT EXISTS personal_todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_slug TEXT NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo','in_progress','done')),
  due_date DATE,
  board_id UUID REFERENCES boards(id) ON DELETE SET NULL,
  position DOUBLE PRECISION DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_todos_user ON personal_todos(user_slug);
CREATE INDEX IF NOT EXISTS idx_todos_status ON personal_todos(user_slug, status);

-- Trigger para updated_at automatico
CREATE OR REPLACE FUNCTION update_todos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS todos_updated_at ON personal_todos;
CREATE TRIGGER todos_updated_at
  BEFORE UPDATE ON personal_todos
  FOR EACH ROW EXECUTE FUNCTION update_todos_updated_at();

-- RLS: apenas o proprio usuario acessa seus todos
ALTER TABLE personal_todos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios acessam proprios todos" ON personal_todos;
CREATE POLICY "Usuarios acessam proprios todos"
  ON personal_todos
  FOR ALL
  USING (
    user_slug = (
      SELECT slug FROM users
      WHERE id = auth.uid()
      LIMIT 1
    )
  );
