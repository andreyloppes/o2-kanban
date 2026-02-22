import { create } from 'zustand';
import { CURRENT_USER_KEY } from '@/lib/constants';

const isMock =
  typeof window !== 'undefined' &&
  (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('SEU-PROJETO'));

const useUserStore = create((set, get) => ({
  currentUser: null,
  allUsers: [],
  isLoaded: false,

  // Inicializar usuario — auth mode ou mock mode
  initialize: async () => {
    if (typeof window === 'undefined') return;

    if (isMock) {
      // Mock mode: carregar do localStorage
      try {
        const saved = localStorage.getItem(CURRENT_USER_KEY);
        if (saved) {
          set({ currentUser: JSON.parse(saved), isLoaded: true });
        } else {
          set({ isLoaded: true });
        }
      } catch {
        set({ isLoaded: true });
      }
      return;
    }

    // Auth mode: buscar perfil do usuario autenticado
    try {
      const res = await fetch('/api/users/me');
      if (res.ok) {
        const { user } = await res.json();
        set({ currentUser: user, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },

  // Manter para compatibilidade com mock mode
  loadCurrentUser: () => {
    get().initialize();
  },

  // Set and persist current user (mock mode)
  setCurrentUser: (user) => {
    if (typeof window !== 'undefined' && isMock) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }
    set({ currentUser: user });
  },

  // Sign out
  signOut: async () => {
    if (isMock) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
      set({ currentUser: null });
      return;
    }

    try {
      const { getSupabaseClient } = await import('@/lib/supabase/client');
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      set({ currentUser: null });
      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
    }
  },

  // Fetch all users from API
  fetchUsers: async () => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) return;
      const { users } = await res.json();
      set({ allUsers: users || [] });
    } catch {
      // silent fail
    }
  },

  // Update user profile
  updateUser: async (userId, updates) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) return null;
      const { user } = await res.json();

      // Update in allUsers
      set((state) => ({
        allUsers: state.allUsers.map((u) => (u.id === userId ? user : u)),
      }));

      // Update currentUser if same user
      const current = get().currentUser;
      if (current && current.id === userId) {
        const updated = { ...current, ...user };
        if (typeof window !== 'undefined' && isMock) {
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
        }
        set({ currentUser: updated });
      }

      return user;
    } catch {
      return null;
    }
  },
}));

export default useUserStore;
