import { create } from 'zustand';
import { CURRENT_USER_KEY } from '@/lib/constants';

const useUserStore = create((set, get) => ({
  currentUser: null,
  allUsers: [],
  isLoaded: false,

  // Load current user from localStorage
  loadCurrentUser: () => {
    if (typeof window === 'undefined') return;
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
  },

  // Set and persist current user
  setCurrentUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }
    set({ currentUser: user });
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
        if (typeof window !== 'undefined') {
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
