/**
 * Shared auth utilities for API routes
 */

/**
 * Get the authenticated user from Supabase auth.
 * @returns {{ user: object } | { user: null, response: NextResponse }}
 */
export async function getAuthUser(supabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user || null;
}

/**
 * Get the role of a user in a board.
 * @returns {'owner' | 'admin' | 'member' | null}
 */
export async function getUserBoardRole(supabase, boardId, userId) {
  const { data } = await supabase
    .from('board_members')
    .select('role')
    .eq('board_id', boardId)
    .eq('user_id', userId)
    .single();
  return data?.role || null;
}

/**
 * Check if user is a member of a board.
 * @returns {boolean}
 */
export async function checkMembership(supabase, boardId, userId) {
  const { data } = await supabase
    .from('board_members')
    .select('id')
    .eq('board_id', boardId)
    .eq('user_id', userId)
    .limit(1);
  return data && data.length > 0;
}

/**
 * Verify that a task belongs to a board where the user is a member.
 * @returns {{ task: object, role: string } | null}
 */
export async function checkTaskPermission(supabase, taskId, userId) {
  const { data: task } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();
  if (!task) return null;

  const role = await getUserBoardRole(supabase, task.board_id, userId);
  if (!role) return null;

  return { task, role };
}
