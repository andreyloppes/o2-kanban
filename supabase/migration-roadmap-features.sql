-- ============================================
-- O2 KANBAN — Mega Migration: Roadmap Features
-- Covers: Labels, Subtasks, Dependencies, Activity Log,
--         Notifications, Saved Views, Sprints/Cycles,
--         GitHub Integration
-- Run in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. LABELS SYSTEM (colorful tags)
-- ============================================

CREATE TABLE IF NOT EXISTS labels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(20) NOT NULL DEFAULT '#6b7280',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_labels_board ON labels(board_id);

-- Junction table: tasks <-> labels (many-to-many)
CREATE TABLE IF NOT EXISTS task_labels (
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, label_id)
);

CREATE INDEX idx_task_labels_task ON task_labels(task_id);
CREATE INDEX idx_task_labels_label ON task_labels(label_id);

-- RLS
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Labels: membros podem ler" ON labels FOR SELECT
  USING (board_id IN (
    SELECT board_id FROM board_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Labels: editores podem criar" ON labels FOR INSERT
  WITH CHECK (board_id IN (
    SELECT board_id FROM board_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
  ));

CREATE POLICY "Labels: editores podem atualizar" ON labels FOR UPDATE
  USING (board_id IN (
    SELECT board_id FROM board_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
  ));

CREATE POLICY "Labels: editores podem deletar" ON labels FOR DELETE
  USING (board_id IN (
    SELECT board_id FROM board_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
  ));

CREATE POLICY "Task labels: membros podem ler" ON task_labels FOR SELECT
  USING (task_id IN (SELECT id FROM tasks WHERE board_id IN (
    SELECT board_id FROM board_members WHERE user_id = auth.uid()
  )));

CREATE POLICY "Task labels: editores podem gerenciar" ON task_labels FOR INSERT
  WITH CHECK (task_id IN (SELECT id FROM tasks WHERE board_id IN (
    SELECT board_id FROM board_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
  )));

CREATE POLICY "Task labels: editores podem remover" ON task_labels FOR DELETE
  USING (task_id IN (SELECT id FROM tasks WHERE board_id IN (
    SELECT board_id FROM board_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
  )));

-- ============================================
-- 2. SUBTASKS (parent_task_id on tasks)
-- ============================================

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_parent ON tasks(parent_task_id);

-- ============================================
-- 3. TASK DEPENDENCIES (blocks / blocked by)
-- ============================================

CREATE TABLE IF NOT EXISTS task_dependencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  blocked_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(blocker_task_id, blocked_task_id),
  CHECK (blocker_task_id != blocked_task_id)
);

CREATE INDEX idx_deps_blocker ON task_dependencies(blocker_task_id);
CREATE INDEX idx_deps_blocked ON task_dependencies(blocked_task_id);

ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dependencies: membros podem ler" ON task_dependencies FOR SELECT
  USING (blocker_task_id IN (SELECT id FROM tasks WHERE board_id IN (
    SELECT board_id FROM board_members WHERE user_id = auth.uid()
  )));

CREATE POLICY "Dependencies: editores podem criar" ON task_dependencies FOR INSERT
  WITH CHECK (blocker_task_id IN (SELECT id FROM tasks WHERE board_id IN (
    SELECT board_id FROM board_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
  )));

CREATE POLICY "Dependencies: editores podem remover" ON task_dependencies FOR DELETE
  USING (blocker_task_id IN (SELECT id FROM tasks WHERE board_id IN (
    SELECT board_id FROM board_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
  )));

-- ============================================
-- 4. ACTIVITY LOG (history of all changes)
-- ============================================

CREATE TABLE IF NOT EXISTS activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL, -- 'task_created', 'task_updated', 'task_moved', 'comment_added', etc.
  field_name VARCHAR(50),      -- which field changed (e.g., 'priority', 'assignee')
  old_value TEXT,
  new_value TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_activity_board ON activity_log(board_id, created_at DESC);
CREATE INDEX idx_activity_task ON activity_log(task_id, created_at DESC);
CREATE INDEX idx_activity_user ON activity_log(user_id);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activity: membros podem ler" ON activity_log FOR SELECT
  USING (board_id IN (
    SELECT board_id FROM board_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Activity: membros podem inserir" ON activity_log FOR INSERT
  WITH CHECK (board_id IN (
    SELECT board_id FROM board_members WHERE user_id = auth.uid()
  ));

-- ============================================
-- 5. NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'assigned', 'mentioned', 'due_soon', 'comment', 'moved'
  title VARCHAR(200) NOT NULL,
  body TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_board ON notifications(board_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notifications: usuario ve as proprias" ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Notifications: sistema pode criar" ON notifications FOR INSERT
  WITH CHECK (true); -- API server-side creates notifications

CREATE POLICY "Notifications: usuario pode marcar lida" ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Notifications: usuario pode deletar" ON notifications FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- 6. SAVED VIEWS (board_views)
-- ============================================

CREATE TABLE IF NOT EXISTS board_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  view_type VARCHAR(20) DEFAULT 'kanban', -- kanban, list, table, calendar, gantt
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_board_views_board ON board_views(board_id, user_id);

ALTER TABLE board_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Views: membros podem ler" ON board_views FOR SELECT
  USING (board_id IN (
    SELECT board_id FROM board_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Views: dono pode gerenciar" ON board_views FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Views: dono pode atualizar" ON board_views FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Views: dono pode deletar" ON board_views FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- 7. SPRINTS / CYCLES
-- ============================================

CREATE TABLE IF NOT EXISTS sprints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  goal TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'planned', -- planned, active, completed
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (end_date > start_date)
);

CREATE INDEX idx_sprints_board ON sprints(board_id, status);

-- Link tasks to sprints
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_sprint ON tasks(sprint_id);

ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sprints: membros podem ler" ON sprints FOR SELECT
  USING (board_id IN (
    SELECT board_id FROM board_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Sprints: editores podem criar" ON sprints FOR INSERT
  WITH CHECK (board_id IN (
    SELECT board_id FROM board_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
  ));

CREATE POLICY "Sprints: editores podem atualizar" ON sprints FOR UPDATE
  USING (board_id IN (
    SELECT board_id FROM board_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
  ));

CREATE POLICY "Sprints: owner pode deletar" ON sprints FOR DELETE
  USING (board_id IN (
    SELECT board_id FROM board_members WHERE user_id = auth.uid() AND role = 'owner'
  ));

-- ============================================
-- 8. STORY POINTS / ESTIMATION
-- ============================================

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS story_points SMALLINT CHECK (story_points >= 0 AND story_points <= 100);

-- ============================================
-- VERIFICATION QUERIES (run separately)
-- ============================================
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tasks' ORDER BY ordinal_position;
