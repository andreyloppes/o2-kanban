import { create } from 'zustand';
import { POSITION_GAP } from '@/lib/constants';
import useUIStore from '@/stores/useUIStore';

const useBoardStore = create((set, get) => ({
  // === State ===
  board: null,
  columns: [],
  tasks: [],
  members: [],
  isLoading: true,
  error: null,
  activeTimerTaskId: null,

  // === Comments Cache ===
  commentsCache: {},
  commentsLoading: {},

  // === Getters ===
  getTasksByColumn: (columnId) => {
    return get()
      .tasks.filter((t) => t.column_id === columnId)
      .sort((a, b) => a.position - b.position);
  },

  getFilteredTasksByColumn: (columnId) => {
    const { filters } = useUIStore.getState();
    let tasks = get().tasks.filter((t) => t.column_id === columnId);

    if (filters.type) {
      tasks = tasks.filter((t) => t.type === filters.type);
    }
    if (filters.priority) {
      tasks = tasks.filter((t) => t.priority === filters.priority);
    }
    if (filters.assignee) {
      if (filters.assignee === '__unassigned__') {
        tasks = tasks.filter((t) => !t.assignee);
      } else {
        tasks = tasks.filter((t) => t.assignee === filters.assignee);
      }
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(searchLower) ||
          (t.description && t.description.toLowerCase().includes(searchLower))
      );
    }

    return tasks.sort((a, b) => a.position - b.position);
  },

  getTaskById: (taskId) => {
    return get().tasks.find((t) => t.id === taskId);
  },

  getNextPosition: (columnId) => {
    const columnTasks = get().tasks.filter((t) => t.column_id === columnId);
    if (columnTasks.length === 0) return POSITION_GAP;
    const maxPos = Math.max(...columnTasks.map((t) => t.position));
    return maxPos + POSITION_GAP;
  },

  getMemberBySlug: (slug) => get().members.find((m) => m.user?.slug === slug),

  // === Actions: Hydration ===
  hydrate: (board, columns, tasks, members = []) => {
    set({ board, columns, tasks, members, isLoading: false, error: null });
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),

  // === Actions: Column CRUD ===

  addColumn: async (title, color = 'neutral', afterColumnId = null) => {
    const boardId = get().board?.id;
    if (!boardId) return null;

    const tempId = `temp-col-${Date.now()}`;
    const cols = get().columns.slice().sort((a, b) => a.position - b.position);

    let position;
    let insertIndex;

    if (afterColumnId === '__first__') {
      // Insert before the first column
      position = cols.length > 0 ? cols[0].position / 2 : POSITION_GAP;
      insertIndex = 0;
    } else if (afterColumnId && afterColumnId !== '__last__') {
      // Insert after a specific column
      const afterIdx = cols.findIndex((c) => c.id === afterColumnId);
      if (afterIdx === -1) {
        // Fallback to end
        const maxPos = cols.length > 0 ? Math.max(...cols.map((c) => c.position)) : 0;
        position = maxPos + POSITION_GAP;
        insertIndex = cols.length;
      } else if (afterIdx === cols.length - 1) {
        // After the last column
        position = cols[afterIdx].position + POSITION_GAP;
        insertIndex = cols.length;
      } else {
        // Between two columns
        position = (cols[afterIdx].position + cols[afterIdx + 1].position) / 2;
        insertIndex = afterIdx + 1;
      }
    } else {
      // Default: append at the end
      const maxPos = cols.length > 0 ? Math.max(...cols.map((c) => c.position)) : 0;
      position = maxPos + POSITION_GAP;
      insertIndex = cols.length;
    }

    const optimisticCol = {
      id: tempId,
      board_id: boardId,
      title,
      color,
      position,
      wip_limit: null,
      is_done_column: false,
      created_at: new Date().toISOString(),
    };

    set((state) => {
      const sorted = state.columns.slice().sort((a, b) => a.position - b.position);
      sorted.splice(insertIndex, 0, optimisticCol);
      return { columns: sorted };
    });

    try {
      const res = await fetch(`/api/boards/${boardId}/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, color, position }),
      });

      if (!res.ok) throw new Error('Falha ao criar coluna');

      const { column: savedCol } = await res.json();
      set((state) => ({
        columns: state.columns.map((c) => (c.id === tempId ? savedCol : c)),
      }));
      return savedCol;
    } catch (error) {
      set((state) => ({
        columns: state.columns.filter((c) => c.id !== tempId),
        error: error.message,
      }));
      useUIStore.getState().addToast('Erro ao criar coluna', 'error');
      return null;
    }
  },

  reorderColumns: async (activeColumnId, overColumnId) => {
    const boardId = get().board?.id;
    if (!boardId || activeColumnId === overColumnId) return;

    const cols = get().columns.slice().sort((a, b) => a.position - b.position);
    const oldIndex = cols.findIndex((c) => c.id === activeColumnId);
    const newIndex = cols.findIndex((c) => c.id === overColumnId);
    if (oldIndex === -1 || newIndex === -1) return;

    // Calculate new position
    let newPosition;
    const reordered = [...cols];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    if (newIndex === 0) {
      newPosition = reordered.length > 1 ? reordered[1].position / 2 : POSITION_GAP;
    } else if (newIndex === reordered.length - 1) {
      newPosition = reordered[newIndex - 1].position + POSITION_GAP;
    } else {
      newPosition = (reordered[newIndex - 1].position + reordered[newIndex + 1].position) / 2;
    }

    moved.position = newPosition;

    // Optimistic update
    set({ columns: reordered });

    try {
      const res = await fetch(`/api/boards/${boardId}/columns/${activeColumnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: newPosition }),
      });

      if (!res.ok) throw new Error('Falha ao reordenar coluna');
    } catch (error) {
      // Rollback
      set({ columns: cols });
      useUIStore.getState().addToast('Erro ao reordenar coluna', 'error');
    }
  },

  updateColumn: async (columnId, updates) => {
    const boardId = get().board?.id;
    if (!boardId) return false;

    const previousCol = get().columns.find((c) => c.id === columnId);
    if (!previousCol) return false;

    set((state) => ({
      columns: state.columns.map((c) =>
        c.id === columnId ? { ...c, ...updates } : c
      ),
    }));

    try {
      const res = await fetch(`/api/boards/${boardId}/columns/${columnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error('Falha ao atualizar coluna');

      const { column: savedCol } = await res.json();
      set((state) => ({
        columns: state.columns.map((c) => (c.id === columnId ? savedCol : c)),
      }));
      return true;
    } catch (error) {
      set((state) => ({
        columns: state.columns.map((c) => (c.id === columnId ? previousCol : c)),
        error: error.message,
      }));
      useUIStore.getState().addToast('Erro ao atualizar coluna', 'error');
      return false;
    }
  },

  deleteColumn: async (columnId) => {
    const boardId = get().board?.id;
    if (!boardId) return false;

    const previousCol = get().columns.find((c) => c.id === columnId);
    if (!previousCol) return false;

    // Verificar se tem tasks
    const tasksInCol = get().tasks.filter((t) => t.column_id === columnId);
    if (tasksInCol.length > 0) {
      useUIStore.getState().addToast('Mova ou delete as tarefas antes de remover a coluna', 'error');
      return false;
    }

    set((state) => ({
      columns: state.columns.filter((c) => c.id !== columnId),
    }));

    try {
      const res = await fetch(`/api/boards/${boardId}/columns/${columnId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Falha ao deletar coluna');
      }

      return true;
    } catch (error) {
      set((state) => ({
        columns: [...state.columns, previousCol].sort((a, b) => a.position - b.position),
        error: error.message,
      }));
      useUIStore.getState().addToast(error.message, 'error');
      return false;
    }
  },

  // === Actions: Task CRUD ===

  /**
   * Adiciona task ao state local (optimistic) e persiste via API.
   * @param {Object} taskData - Dados da task (sem id, sem position)
   * @returns {Promise<Object|null>} Task criada ou null em caso de erro
   */
  addTask: async (taskData) => {
    const tempId = `temp-${Date.now()}`;
    const position = get().getNextPosition(taskData.column_id);

    const optimisticTask = {
      id: tempId,
      board_id: get().board?.id,
      position,
      type: 'task',
      priority: 'medium',
      assignee: null,
      description: null,
      due_date: null,
      start_date: null,
      estimated_duration_min: null,
      column_entered_at: new Date().toISOString(),
      timer_elapsed_ms: 0,
      timer_running: false,
      timer_started_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...taskData,
    };

    // Optimistic update
    set((state) => ({ tasks: [...state.tasks, optimisticTask] }));

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board_id: get().board?.id,
          column_id: taskData.column_id,
          title: taskData.title,
          type: taskData.type || 'task',
          priority: taskData.priority || 'medium',
          description: taskData.description || null,
          assignee: taskData.assignee || null,
          due_date: taskData.due_date || null,
          start_date: taskData.start_date || null,
          estimated_duration_min: taskData.estimated_duration_min ?? null,
        }),
      });

      if (!res.ok) throw new Error('Falha ao criar tarefa');

      const { task: savedTask } = await res.json();

      // Substituir temp pelo real
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === tempId ? savedTask : t)),
      }));

      return savedTask;
    } catch (error) {
      // Rollback
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== tempId),
        error: error.message,
      }));
      return null;
    }
  },

  /**
   * Atualiza task (optimistic + persist).
   * @param {string} taskId - UUID da task
   * @param {Object} updates - Campos a atualizar
   * @returns {Promise<boolean>} Sucesso
   */
  updateTask: async (taskId, updates) => {
    const previousTask = get().getTaskById(taskId);
    if (!previousTask) return false;

    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, ...updates, updated_at: new Date().toISOString() }
          : t
      ),
    }));

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error('Falha ao atualizar tarefa');

      const { task: savedTask } = await res.json();
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? savedTask : t)),
      }));
      return true;
    } catch (error) {
      // Rollback
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? previousTask : t)),
        error: error.message,
      }));
      return false;
    }
  },

  /**
   * Deleta task (optimistic + persist).
   * @param {string} taskId - UUID
   * @returns {Promise<boolean>} Sucesso
   */
  deleteTask: async (taskId) => {
    const previousTask = get().getTaskById(taskId);
    if (!previousTask) return false;

    // Optimistic
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    }));

    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao deletar tarefa');

      // Limpar cache de comentarios da task deletada
      set((state) => {
        const { [taskId]: _, ...restCache } = state.commentsCache;
        return { commentsCache: restCache };
      });

      return true;
    } catch (error) {
      // Rollback
      set((state) => ({
        tasks: [...state.tasks, previousTask],
        error: error.message,
      }));
      return false;
    }
  },

  /**
   * Move task entre colunas e/ou reposiciona (optimistic + persist).
   * @param {string} taskId - UUID
   * @param {string} targetColumnId - UUID da coluna destino
   * @param {number} newPosition - Nova posicao (float)
   * @returns {Promise<boolean>} Sucesso
   */
  moveTask: async (taskId, targetColumnId, newPosition) => {
    const previousTask = get().getTaskById(taskId);
    if (!previousTask) return false;

    const isColumnChange = targetColumnId !== previousTask.column_id;
    const columnEnteredAt = isColumnChange ? new Date().toISOString() : previousTask.column_entered_at;

    // Optimistic
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              column_id: targetColumnId,
              position: newPosition,
              column_entered_at: columnEnteredAt,
              updated_at: new Date().toISOString(),
            }
          : t
      ),
    }));

    try {
      const res = await fetch(`/api/tasks/${taskId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          column_id: targetColumnId,
          position: newPosition,
          ...(isColumnChange && { column_entered_at: columnEnteredAt }),
        }),
      });

      if (!res.ok) throw new Error('Falha ao mover tarefa');

      // Auto-log execution when task moves to done column
      if (isColumnChange) {
        const targetColumn = get().columns.find((c) => c.id === targetColumnId);
        if (targetColumn?.is_done_column && previousTask.timer_elapsed_ms > 0) {
          fetch(`/api/tasks/${taskId}/execution-log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          }).catch(() => {});
        }
      }

      return true;
    } catch (error) {
      // Rollback
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId ? previousTask : t
        ),
        error: error.message,
      }));
      useUIStore.getState().addToast('Erro ao mover tarefa. Posicao restaurada.', 'error');
      return false;
    }
  },

  // === Actions: Task Timer ===

  /**
   * Inicia timer de uma task. Se outra task esta com timer, pausa ela primeiro.
   */
  startTaskTimer: (taskId) => {
    const { activeTimerTaskId } = get();

    // Pausar timer anterior se existir
    if (activeTimerTaskId && activeTimerTaskId !== taskId) {
      get().pauseTaskTimer(activeTimerTaskId);
    }

    const now = new Date().toISOString();
    set((state) => ({
      activeTimerTaskId: taskId,
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, timer_running: true, timer_started_at: now }
          : t
      ),
    }));
  },

  /**
   * Pausa timer de uma task, acumulando o elapsed.
   */
  pauseTaskTimer: (taskId) => {
    const task = get().getTaskById(taskId);
    if (!task || !task.timer_running) return;

    const elapsed = task.timer_started_at
      ? Date.now() - new Date(task.timer_started_at).getTime()
      : 0;
    const newElapsed = (task.timer_elapsed_ms || 0) + elapsed;

    set((state) => ({
      activeTimerTaskId: state.activeTimerTaskId === taskId ? null : state.activeTimerTaskId,
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, timer_running: false, timer_started_at: null, timer_elapsed_ms: newElapsed }
          : t
      ),
    }));

    // Persist silently
    fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timer_elapsed_ms: newElapsed, timer_running: false, timer_started_at: null }),
    }).catch(() => {});
  },

  /**
   * Reseta timer de uma task.
   */
  resetTaskTimer: (taskId) => {
    set((state) => ({
      activeTimerTaskId: state.activeTimerTaskId === taskId ? null : state.activeTimerTaskId,
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, timer_running: false, timer_started_at: null, timer_elapsed_ms: 0 }
          : t
      ),
    }));

    // Persist silently
    fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timer_elapsed_ms: 0, timer_running: false, timer_started_at: null }),
    }).catch(() => {});
  },

  // === Actions: Comments ===

  fetchComments: async (taskId, force = false) => {
    if (!force && get().commentsCache[taskId]) {
      return get().commentsCache[taskId];
    }

    set((state) => ({
      commentsLoading: { ...state.commentsLoading, [taskId]: true },
    }));

    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`);
      if (!res.ok) throw new Error('Falha ao carregar comentarios');

      const { comments } = await res.json();

      set((state) => ({
        commentsCache: { ...state.commentsCache, [taskId]: comments },
        commentsLoading: { ...state.commentsLoading, [taskId]: false },
      }));

      return comments;
    } catch (error) {
      set((state) => ({
        commentsLoading: { ...state.commentsLoading, [taskId]: false },
      }));
      useUIStore.getState().addToast('Erro ao carregar comentarios', 'error');
      return [];
    }
  },

  addComment: async (taskId, author, content) => {
    const tempId = `temp-comment-${Date.now()}`;
    const optimisticComment = {
      id: tempId,
      task_id: taskId,
      board_id: get().board?.id,
      author,
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    set((state) => ({
      commentsCache: {
        ...state.commentsCache,
        [taskId]: [...(state.commentsCache[taskId] || []), optimisticComment],
      },
    }));

    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, content }),
      });

      if (!res.ok) throw new Error('Falha ao adicionar comentario');

      const { comment: savedComment } = await res.json();

      set((state) => ({
        commentsCache: {
          ...state.commentsCache,
          [taskId]: (state.commentsCache[taskId] || []).map((c) =>
            c.id === tempId ? savedComment : c
          ),
        },
      }));

      return savedComment;
    } catch (error) {
      set((state) => ({
        commentsCache: {
          ...state.commentsCache,
          [taskId]: (state.commentsCache[taskId] || []).filter(
            (c) => c.id !== tempId
          ),
        },
      }));
      useUIStore.getState().addToast('Erro ao adicionar comentario', 'error');
      return null;
    }
  },

  deleteComment: async (taskId, commentId) => {
    const previousComments = get().commentsCache[taskId] || [];
    const commentToDelete = previousComments.find((c) => c.id === commentId);
    if (!commentToDelete) return false;

    set((state) => ({
      commentsCache: {
        ...state.commentsCache,
        [taskId]: previousComments.filter((c) => c.id !== commentId),
      },
    }));

    try {
      const res = await fetch(`/api/tasks/${taskId}/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Falha ao deletar comentario');
      return true;
    } catch (error) {
      set((state) => ({
        commentsCache: {
          ...state.commentsCache,
          [taskId]: previousComments,
        },
      }));
      useUIStore.getState().addToast('Erro ao deletar comentario', 'error');
      return false;
    }
  },
}));

export default useBoardStore;
