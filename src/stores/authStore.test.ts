import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as authClientModule from '@/services/authClient';
import { useAuthStore } from './authStore';

// Mock authClient
vi.mock('@/services/authClient', () => ({
  authClient: {
    isAuthenticated: vi.fn(),
    getUser: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
    });

    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('checkAuth', () => {
    it('sets authenticated state when user is authenticated', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      vi.mocked(authClientModule.authClient.isAuthenticated).mockResolvedValue(true);
      vi.mocked(authClientModule.authClient.getUser).mockResolvedValue(mockUser);

      await useAuthStore.getState().checkAuth();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('sets unauthenticated state when user is not authenticated', async () => {
      vi.mocked(authClientModule.authClient.isAuthenticated).mockResolvedValue(false);

      await useAuthStore.getState().checkAuth();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBe(null);
      expect(state.isLoading).toBe(false);
    });

    it('handles errors gracefully', async () => {
      vi.mocked(authClientModule.authClient.isAuthenticated).mockRejectedValue(
        new Error('Network error')
      );

      await useAuthStore.getState().checkAuth();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBe(null);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Network error');
    });
  });

  describe('login', () => {
    it('sets authenticated state on successful login', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      vi.mocked(authClientModule.authClient.login).mockResolvedValue({
        success: true,
        message: 'Success',
      });
      vi.mocked(authClientModule.authClient.getUser).mockResolvedValue(mockUser);

      const result = await useAuthStore.getState().login('test@example.com');

      expect(result.success).toBe(true);
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.isLoading).toBe(false);
    });

    it('handles login failure', async () => {
      vi.mocked(authClientModule.authClient.login).mockRejectedValue(new Error('Login failed'));

      const result = await useAuthStore.getState().login('test@example.com');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Login failed');
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe('Login failed');
    });
  });

  describe('logout', () => {
    it('clears user state on logout', async () => {
      // Set initial authenticated state
      useAuthStore.setState({
        user: { id: '1', email: 'test@example.com' },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      vi.mocked(authClientModule.authClient.logout).mockResolvedValue();

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBe(null);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setUser', () => {
    it('sets user and authenticated state', () => {
      const mockUser = { id: '1', email: 'test@example.com' };

      useAuthStore.getState().setUser(mockUser);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('clears user and sets unauthenticated when user is null', () => {
      useAuthStore.getState().setUser(null);

      const state = useAuthStore.getState();
      expect(state.user).toBe(null);
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
