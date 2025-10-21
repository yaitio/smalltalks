import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/stores/authStore';
import AuthGuard from './AuthGuard';

// Mock the auth store
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('AuthGuard', () => {
  const mockCheckAuth = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state while checking auth', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      checkAuth: mockCheckAuth,
      user: null,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
    });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      checkAuth: mockCheckAuth,
      user: { id: '1', email: 'test@example.com' },
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
    });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('calls checkAuth on mount', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      checkAuth: mockCheckAuth,
      user: null,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
    });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(mockCheckAuth).toHaveBeenCalledTimes(1);
  });

  it('returns null when not authenticated', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      checkAuth: mockCheckAuth,
      user: null,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
    });

    const { container } = render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(container.firstChild).toBeNull();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
