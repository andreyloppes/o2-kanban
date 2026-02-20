import { create } from 'zustand';
import { DEFAULT_BOARD_ID, POSITION_GAP } from '@/lib/constants';
import useUIStore from '@/stores/useUIStore';

const useBoardStore = create((set, get) => ({
  // === State ===
  board: null,
  columns: [],
  tasks: [],
  isLoading: true,
  error: null,

  // === Getters ===
  getTasksByColumn: (columnId) => {
    return get()
      .tasks.filter((t) => t.column_id === columnId)
      .sort((a, b) => a.position - b.position);
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

  // === Actions: Hydration ===
  hydrate: (board, columns, tasks) => {
    set({ board, columns, tasks, isLoading: false, error: null });
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),

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
      board_id: DEFAULT_BOARD_ID,
      position,
      type: 'task',
      priority: 'medium',
      assignee: null,
      description: null,
      due_date: null,
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
          column_id: taskData.column_id,
          title: taskData.title,
          type: taskData.type || 'task',
          priority: taskData.priority || 'medium',
          description: taskData.description || null,
          assignee: taskData.assignee || null,
          due_date: taskData.due_date || null,
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

    // Optimistic
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              column_id: targetColumnId,
              position: newPosition,
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
        }),
      });

      if (!res.ok) throw new Error('Falha ao mover tarefa');
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
}));

export default useBoardStore;
