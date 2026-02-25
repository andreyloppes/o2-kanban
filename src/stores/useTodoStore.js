import { create } from 'zustand';
import useUIStore from '@/stores/useUIStore';

const useTodoStore = create((set, get) => ({
  todos: [],
  myTasks: [],
  teamTasks: [],
  teamMembers: [],
  boards: [],
  isLoading: false,
  error: null,

  // === Fetch Actions ===

  fetchMyTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/tasks/my');
      if (!res.ok) throw new Error('Erro ao buscar tarefas');
      const { tasks, boards } = await res.json();
      set({ myTasks: tasks || [], boards: boards || [], isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchTodos: async () => {
    try {
      const res = await fetch('/api/todos');
      if (!res.ok) throw new Error('Erro ao buscar todos');
      const { todos } = await res.json();
      set({ todos: todos || [] });
    } catch (err) {
      set({ error: err.message });
    }
  },

  fetchTeamTasks: async () => {
    try {
      const res = await fetch('/api/tasks/my?all=true');
      if (!res.ok) throw new Error('Erro ao buscar tarefas do time');
      const { tasks, members } = await res.json();
      set({ teamTasks: tasks || [], teamMembers: members || [] });
    } catch (err) {
      set({ error: err.message });
    }
  },

  // === Todo CRUD ===

  addTodo: async (data) => {
    // Optimistic
    const tempId = `temp-${Date.now()}`;
    const tempTodo = { id: tempId, ...data, status: 'todo', created_at: new Date().toISOString() };
    set((state) => ({ todos: [tempTodo, ...state.todos] }));

    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao criar todo');
      }
      const { todo } = await res.json();
      set((state) => ({
        todos: state.todos.map((t) => (t.id === tempId ? todo : t)),
      }));
      useUIStore.getState().addToast('Tarefa criada!', 'success');
      return todo;
    } catch (err) {
      set((state) => ({ todos: state.todos.filter((t) => t.id !== tempId) }));
      useUIStore.getState().addToast(err.message, 'error');
      return null;
    }
  },

  updateTodo: async (id, data) => {
    const prev = get().todos.find((t) => t.id === id);
    // Optimistic
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? { ...t, ...data } : t)),
    }));

    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao atualizar todo');
      }
      const { todo } = await res.json();
      set((state) => ({
        todos: state.todos.map((t) => (t.id === id ? todo : t)),
      }));
    } catch (err) {
      // Reverter
      set((state) => ({
        todos: state.todos.map((t) => (t.id === id ? prev : t)),
      }));
      useUIStore.getState().addToast(err.message, 'error');
    }
  },

  deleteTodo: async (id) => {
    const prev = get().todos;
    set((state) => ({ todos: state.todos.filter((t) => t.id !== id) }));

    try {
      const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao deletar todo');
      useUIStore.getState().addToast('Tarefa removida', 'success');
    } catch (err) {
      set({ todos: prev });
      useUIStore.getState().addToast(err.message, 'error');
    }
  },

  toggleTodoDone: async (id) => {
    const todo = get().todos.find((t) => t.id === id);
    if (!todo) return;
    const newStatus = todo.status === 'done' ? 'todo' : 'done';
    await get().updateTodo(id, { status: newStatus });
  },
}));

export default useTodoStore;
