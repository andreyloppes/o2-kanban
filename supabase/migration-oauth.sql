-- ============================================
-- O2 KANBAN — OAuth Migration
-- Adiciona suporte a Google/GitHub OAuth
-- Executar APOS migration-auth.sql
-- ============================================

-- Coluna avatar_url para foto do Google/GitHub
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Atualizar trigger para capturar metadata do OAuth (Google, GitHub, etc.)
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
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, users.name),
    email = COALESCE(EXCLUDED.email, users.email),
    avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
