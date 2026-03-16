import { create } from 'zustand';

const useUserStore = create((set, get) => ({
  currentUser: null,
  allUsers: [],
  isLoaded: false,

  // Inicializar usuario — buscar perfil do usuario autenticado
  initialize: async () => {
    if (typeof window === 'undefined') return;

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

  // Set current user
  setCurrentUser: (user) => {
    set({ currentUser: user });
  },

  // Sign out
  signOut: async () => {
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
        set({ currentUser: { ...current, ...user } });
      }

      return user;
    } catch {
      return null;
    }
  },
}));

export default useUserStore;
