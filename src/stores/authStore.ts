import { create } from 'zustand';
import { authClient, type User } from '@/services/authClient';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  checkAuth: () => Promise<void>;
  login: (email: string) => Promise<{ success: boolean; message: string }>;
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
      const isAuth = await authClient.isAuthenticated();

      if (isAuth) {
        const user = await authClient.getUser();
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

  login: async (email: string) => {
    set({ isLoading: true, error: null });

    try {
      const result = await authClient.login(email);

      if (result.success) {
        const user = await authClient.getUser();
        set({
          isAuthenticated: true,
          user,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: result.message,
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      set({
        isLoading: false,
        error: errorMessage,
      });

      return {
        success: false,
        message: errorMessage,
      };
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
