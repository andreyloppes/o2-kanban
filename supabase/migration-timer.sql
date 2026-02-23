-- ============================================
-- O2 Kanban: Migration - Timer & Column Age
-- Adiciona colunas para Pomodoro timer e
-- tracking de tempo na coluna
-- ============================================

-- Tracking de quando a task entrou na coluna atual
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS column_entered_at TIMESTAMPTZ;

-- Pomodoro timer fields
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS timer_elapsed_ms INTEGER DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS timer_running BOOLEAN DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS timer_started_at TIMESTAMPTZ;
