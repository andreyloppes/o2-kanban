import { create } from 'zustand';

const useUIStore = create((set, get) => ({
  // === Sidebar ===
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // === Colunas colapsadas ===
  collapsedColumns: {},
  toggleColumn: (columnId) =>
    set((state) => ({
      collapsedColumns: {
        ...state.collapsedColumns,
        [columnId]: !state.collapsedColumns[columnId],
      },
    })),

  // === Modal de task ===
  activeTaskId: null,
  isCreateModalOpen: false,
  createModalColumnId: null,

  openTaskModal: (taskId) =>
    set({
      activeTaskId: taskId,
      isCreateModalOpen: false,
    }),

  closeTaskModal: () => set({ activeTaskId: null }),

  openCreateModal: (columnId) =>
    set({
      isCreateModalOpen: true,
      createModalColumnId: columnId,
      activeTaskId: null,
    }),

  closeCreateModal: () =>
    set({
      isCreateModalOpen: false,
      createModalColumnId: null,
    }),

  // === Confirm Dialog ===
  confirmDialog: null,
  showConfirmDialog: ({ title, message, onConfirm, confirmLabel }) =>
    set({
      confirmDialog: { title, message, onConfirm, confirmLabel },
    }),
  hideConfirmDialog: () => set({ confirmDialog: null }),

  // === Toasts ===
  toasts: [],
  addToast: (message, type = 'success') => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    const delay = type === 'error' ? 6000 : 4000;
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, delay);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export default useUIStore;
