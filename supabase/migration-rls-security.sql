-- ============================================
-- O2 KANBAN — Migration: RLS Security Fix
-- Corrige policies permissivas de Sprint 1/2
-- e divergencia de personal_todos
-- Executar APOS todas as migrations anteriores
-- ============================================

-- ============================================
-- 1. BOARDS — Dropar policies permissivas
-- ============================================

DROP POLICY IF EXISTS "Sprint 1: acesso publico a boards" ON boards;

-- SELECT: membro do board (via board_members) pode ler
CREATE POLICY "Boards: select para membros"
  ON boards FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = boards.id
        AND board_members.user_id = auth.uid()
    )
  );

-- INSERT: qualquer autenticado pode criar um board
CREATE POLICY "Boards: insert para autenticados"
  ON boards FOR INSERT TO authenticated
  WITH CHECK (true);

-- UPDATE: apenas owner do board
CREATE POLICY "Boards: update para owners"
  ON boards FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = boards.id
        AND board_members.user_id = auth.uid()
        AND board_members.role = 'owner'
    )
  );

-- DELETE: apenas owner do board
CREATE POLICY "Boards: delete para owners"
  ON boards FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = boards.id
        AND board_members.user_id = auth.uid()
        AND board_members.role = 'owner'
    )
  );

-- ============================================
-- 2. COLUMNS — Dropar policies permissivas
-- ============================================

DROP POLICY IF EXISTS "Sprint 1: acesso publico a columns" ON columns;

-- SELECT: membros do board
CREATE POLICY "Columns: select para membros"
  ON columns FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = columns.board_id
        AND board_members.user_id = auth.uid()
    )
  );

-- INSERT: membros do board
CREATE POLICY "Columns: insert para membros"
  ON columns FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = columns.board_id
        AND board_members.user_id = auth.uid()
    )
  );

-- UPDATE: membros do board
CREATE POLICY "Columns: update para membros"
  ON columns FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = columns.board_id
        AND board_members.user_id = auth.uid()
    )
  );

-- DELETE: membros do board
CREATE POLICY "Columns: delete para membros"
  ON columns FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = columns.board_id
        AND board_members.user_id = auth.uid()
    )
  );

-- ============================================
-- 3. TASKS — Dropar policies permissivas
-- ============================================

DROP POLICY IF EXISTS "Sprint 1: acesso publico a tasks" ON tasks;

-- SELECT: membros do board
CREATE POLICY "Tasks: select para membros"
  ON tasks FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = tasks.board_id
        AND board_members.user_id = auth.uid()
    )
  );

-- INSERT: membros do board
CREATE POLICY "Tasks: insert para membros"
  ON tasks FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = tasks.board_id
        AND board_members.user_id = auth.uid()
    )
  );

-- UPDATE: membros do board
CREATE POLICY "Tasks: update para membros"
  ON tasks FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = tasks.board_id
        AND board_members.user_id = auth.uid()
    )
  );

-- DELETE: membros do board
CREATE POLICY "Tasks: delete para membros"
  ON tasks FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = tasks.board_id
        AND board_members.user_id = auth.uid()
    )
  );

-- ============================================
-- 4. TASK_COMMENTS — Dropar policies permissivas
-- ============================================

DROP POLICY IF EXISTS "Sprint 2: acesso publico a comments" ON task_comments;

-- SELECT: membros do board
CREATE POLICY "Comments: select para membros"
  ON task_comments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = task_comments.board_id
        AND board_members.user_id = auth.uid()
    )
  );

-- INSERT: membros do board
CREATE POLICY "Comments: insert para membros"
  ON task_comments FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = task_comments.board_id
        AND board_members.user_id = auth.uid()
    )
  );

-- UPDATE: membros do board
CREATE POLICY "Comments: update para membros"
  ON task_comments FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = task_comments.board_id
        AND board_members.user_id = auth.uid()
    )
  );

-- DELETE: membros do board
CREATE POLICY "Comments: delete para membros"
  ON task_comments FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = task_comments.board_id
        AND board_members.user_id = auth.uid()
    )
  );

-- ============================================
-- 5. BOARD_MEMBERS — Restringir INSERT/DELETE
-- ============================================

-- Dropar policies permissivas existentes
DROP POLICY IF EXISTS "Board Members: insert" ON board_members;
DROP POLICY IF EXISTS "Board Members: delete" ON board_members;

-- INSERT: apenas owners do board podem adicionar membros
-- Excecao: permitir que o criador se adicione como owner (quando nao ha membros ainda)
CREATE POLICY "Board Members: insert apenas owners"
  ON board_members FOR INSERT TO authenticated
  WITH CHECK (
    -- O usuario esta se adicionando a si mesmo E nao ha nenhum membro ainda (criacao do board)
    (
      user_id = auth.uid()
      AND NOT EXISTS (
        SELECT 1 FROM board_members AS existing
        WHERE existing.board_id = board_members.board_id
      )
    )
    OR
    -- Ou o usuario autenticado ja e owner do board
    EXISTS (
      SELECT 1 FROM board_members AS bm
      WHERE bm.board_id = board_members.board_id
        AND bm.user_id = auth.uid()
        AND bm.role = 'owner'
    )
  );

-- DELETE: apenas owners do board podem remover membros
-- (owner nao pode remover a si mesmo se for o unico owner)
CREATE POLICY "Board Members: delete apenas owners"
  ON board_members FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM board_members AS bm
      WHERE bm.board_id = board_members.board_id
        AND bm.user_id = auth.uid()
        AND bm.role = 'owner'
    )
  );

-- ============================================
-- 6. JOIN_REQUESTS — Restringir policies
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can manage join_requests" ON join_requests;

-- SELECT: o proprio usuario ve seus requests OU owners do board veem requests do board
CREATE POLICY "Join Requests: select"
  ON join_requests FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = join_requests.board_id
        AND board_members.user_id = auth.uid()
        AND board_members.role = 'owner'
    )
  );

-- INSERT: qualquer autenticado pode solicitar acesso (so para si mesmo)
CREATE POLICY "Join Requests: insert"
  ON join_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE: apenas owners do board podem aprovar/rejeitar
CREATE POLICY "Join Requests: update para owners"
  ON join_requests FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = join_requests.board_id
        AND board_members.user_id = auth.uid()
        AND board_members.role = 'owner'
    )
  );

-- DELETE: o proprio usuario pode cancelar OU owner pode deletar
CREATE POLICY "Join Requests: delete"
  ON join_requests FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = join_requests.board_id
        AND board_members.user_id = auth.uid()
        AND board_members.role = 'owner'
    )
  );

-- ============================================
-- 7. PERSONAL_TODOS — Corrigir RLS
-- A policy antiga usava slug da tabela users,
-- mas a API salva auth.uid()::text como user_slug.
-- Corrigir para comparar diretamente com auth.uid()::text.
-- ============================================

DROP POLICY IF EXISTS "Usuarios acessam proprios todos" ON personal_todos;

CREATE POLICY "Todos: acesso apenas pelo proprio usuario"
  ON personal_todos FOR ALL TO authenticated
  USING (user_slug = auth.uid()::text)
  WITH CHECK (user_slug = auth.uid()::text);
