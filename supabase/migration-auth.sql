-- ============================================
-- O2 KANBAN — Auth Migration
-- Tabelas: users, board_members, trigger auto-create
-- Executar APOS schema.sql e migration-sprint2.sql
-- ============================================

-- Tabela users (perfil publico, referencia auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT,
  avatar_url TEXT,
  avatar_color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela board_members (relacao N:N entre boards e users)
CREATE TABLE IF NOT EXISTS board_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (board_id, user_id)
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_board_members_board ON board_members(board_id);
CREATE INDEX IF NOT EXISTS idx_board_members_user ON board_members(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- Trigger: auto-criar user em public.users no signup
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, avatar_url, avatar_color)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      NEW.raw_user_meta_data ->> 'user_name',
      ''
    ),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NULL),
    '#3b82f6'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dropar trigger se existir (para idempotencia)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- RLS Policies
-- ============================================

-- Users: authenticated pode ler todos, update so no proprio
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users: leitura publica" ON users
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users: update proprio perfil" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Board Members: authenticated pode ler todos, insert/delete com restricoes
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Board Members: leitura publica" ON board_members
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Board Members: insert" ON board_members
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Board Members: delete" ON board_members
  FOR DELETE TO authenticated
  USING (true);
