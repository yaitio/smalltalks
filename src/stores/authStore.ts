import { create } from 'zustand';
import { authClient, type User } from '@/services/authClient';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  checkAuth: async () => {
    set({ isLoading: true, error: null });

    try {
      const user = await authClient.getUser();

      if (user) {
        set({
          isAuthenticated: true,
          user,
          isLoading: false,
        });
      } else {
        set({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication check failed',
      });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });

    try {
      await authClient.logout();
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      });
    }
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },
}));
