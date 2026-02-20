-- ============================================
-- SEED: Board "Oxy" com 6 colunas padrao
-- Reflete o estado atual do prototipo
-- ============================================

-- Board principal
INSERT INTO boards (id, title, description) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Oxy', 'Board principal da equipe O2');

-- 6 colunas na ordem do prototipo atual
INSERT INTO columns (id, board_id, title, position, color) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'A Fazer',       1, 'info'),
  ('c0000001-0000-0000-0000-000000000002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Priorizado',    2, 'danger'),
  ('c0000001-0000-0000-0000-000000000003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Em Progresso',  3, 'progress'),
  ('c0000001-0000-0000-0000-000000000004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Revisao',       4, 'review'),
  ('c0000001-0000-0000-0000-000000000005', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Concluido',     5, 'done'),
  ('c0000001-0000-0000-0000-000000000006', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Backlog',       6, 'neutral');

-- Tasks iniciais (migradas do mock hardcoded)
INSERT INTO tasks (id, column_id, board_id, title, type, priority, position, assignee) VALUES
  (
    't0000001-0000-0000-0000-000000000001',
    'c0000001-0000-0000-0000-000000000001',  -- A Fazer
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Corrigir mapeamento de categorias com mesmo nome',
    'task', 'medium', 1000.0, 'Andrey'
  ),
  (
    't0000001-0000-0000-0000-000000000002',
    'c0000001-0000-0000-0000-000000000001',  -- A Fazer
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'US-014: Criacao de mapeamento avulso (Frontend)',
    'user_story', 'medium', 2000.0, 'Felipe'
  ),
  (
    't0000001-0000-0000-0000-000000000003',
    'c0000001-0000-0000-0000-000000000002',  -- Priorizado
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Analise Vertical',
    'bug', 'urgent', 1000.0, 'Caio'
  ),
  (
    't0000001-0000-0000-0000-000000000004',
    'c0000001-0000-0000-0000-000000000003',  -- Em Progresso
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Gerenciamento de Centros de Custo e Projetos',
    'epic', 'medium', 1000.0, 'Matheus'
  );
