-- ============================================
-- O2 KANBAN — Migration: is_done_column fix
-- Marca colunas "Concluido"/"Concluído" como is_done_column = true
-- ============================================

-- 1. Atualizar todas as colunas existentes com titulo "Concluido" ou "Concluído"
UPDATE columns
SET is_done_column = true
WHERE lower(title) IN ('concluido', 'concluído');

-- 2. Criar trigger para marcar automaticamente futuras colunas
--    com titulo "Concluido" ou "Concluído"
CREATE OR REPLACE FUNCTION auto_set_is_done_column()
RETURNS TRIGGER AS $$
BEGIN
  IF lower(NEW.title) IN ('concluido', 'concluído') THEN
    NEW.is_done_column := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_is_done_column ON columns;

CREATE TRIGGER trg_auto_is_done_column
  BEFORE INSERT OR UPDATE ON columns
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_is_done_column();
