import { create } from 'zustand';
import useUIStore from '@/stores/useUIStore';
import { POSITION_GAP } from '@/lib/constants';

const useBoardTaskStore = create((set, get) => ({
  boardTasks: [],
  isLoading: false,

  // === Getters ===

  getGroupedTasks: () => {
    const tasks = get().boardTasks;
    const groups = {};
    const unlinked = [];

    tasks.forEach((t) => {
      if (t.card_id) {
        if (!groups[t.card_id]) {
          groups[t.card_id] = {
            card_id: t.card_id,
            card_title: t.card_title || 'Card sem titulo',
            tasks: [],
          };
        }
        groups[t.card_id].tasks.push(t);
      } else {
        unlinked.push(t);
      }
    });

    return { unlinked, groups: Object.values(groups) };
  },

  getTasksByCard: (cardId) => {
    return get().boardTasks.filter((t) => t.card_id === cardId);
  },

  getNextPosition: () => {
    const tasks = get().boardTasks;
    if (tasks.length === 0) return POSITION_GAP;
    const maxPos = Math.max(...tasks.map((t) => t.position));
    return maxPos + POSITION_GAP;
  },

  // === Actions ===

  fetchBoardTasks: async (boardId) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/boards/${boardId}/board-tasks`);
      if (!res.ok) throw new Error('Falha ao carregar tarefas');
      const { boardTasks } = await res.json();
      set({ boardTasks: boardTasks || [], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addBoardTask: async (boardId, taskData) => {
    const tempId = `temp-bt-${Date.now()}`;
    const position = get().getNextPosition();

    const optimistic = {
      id: tempId,
      board_id: boardId,
      card_id: taskData.card_id || null,
      card_title: taskData.card_title || null,
      title: taskData.title,
      description: taskData.description || null,
      is_completed: false,
      priority: taskData.priority || 'medium',
      due_date: taskData.due_date || null,
      position,
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    set((state) => ({ boardTasks: [...state.boardTasks, optimistic] }));

    try {
      const res = await fetch(`/api/boards/${boardId}/board-tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskData.title,
          card_id: taskData.card_id || null,
          description: taskData.description || null,
          priority: taskData.priority || 'medium',
          due_date: taskData.due_date || null,
        }),
      });

      if (!res.ok) throw new Error('Falha ao criar tarefa');

      const { boardTask } = await res.json();
      set((state) => ({
        boardTasks: state.boardTasks.map((t) =>
          t.id === tempId ? { ...boardTask, card_title: optimistic.card_title } : t
        ),
      }));
      return boardTask;
    } catch {
      set((state) => ({
        boardTasks: state.boardTasks.filter((t) => t.id !== tempId),
      }));
      useUIStore.getState().addToast('Erro ao criar tarefa', 'error');
      return null;
    }
  },

  updateBoardTask: async (boardId, taskId, updates) => {
    const prev = get().boardTasks.find((t) => t.id === taskId);
    if (!prev) return false;

    set((state) => ({
      boardTasks: state.boardTasks.map((t) =>
        t.id === taskId ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
      ),
    }));

    try {
      const res = await fetch(`/api/boards/${boardId}/board-tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error('Falha ao atualizar');

      const { boardTask } = await res.json();
      set((state) => ({
        boardTasks: state.boardTasks.map((t) =>
          t.id === taskId ? { ...boardTask, card_title: t.card_title } : t
        ),
      }));
      return true;
    } catch {
      set((state) => ({
        boardTasks: state.boardTasks.map((t) => (t.id === taskId ? prev : t)),
      }));
      useUIStore.getState().addToast('Erro ao atualizar tarefa', 'error');
      return false;
    }
  },

  deleteBoardTask: async (boardId, taskId) => {
    const prev = get().boardTasks.find((t) => t.id === taskId);
    if (!prev) return false;

    set((state) => ({
      boardTasks: state.boardTasks.filter((t) => t.id !== taskId),
    }));

    try {
      const res = await fetch(`/api/boards/${boardId}/board-tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Falha ao deletar');
      return true;
    } catch {
      set((state) => ({
        boardTasks: [...state.boardTasks, prev],
      }));
      useUIStore.getState().addToast('Erro ao deletar tarefa', 'error');
      return false;
    }
  },

  toggleComplete: async (boardId, taskId) => {
    const task = get().boardTasks.find((t) => t.id === taskId);
    if (!task) return;

    const newCompleted = !task.is_completed;
    return get().updateBoardTask(boardId, taskId, { is_completed: newCompleted });
  },

  clear: () => set({ boardTasks: [], isLoading: false }),
}));

export default useBoardTaskStore;
