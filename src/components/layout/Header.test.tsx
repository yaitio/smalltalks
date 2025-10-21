import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/stores/authStore';
import HeaderClient from './HeaderClient';

describe('Header', () => {
  beforeEach(() => {
    // Set up authenticated user for tests
    useAuthStore.setState({
      user: {
        user_name: 'Test User',
        user_email: 'test@example.com',
        email: 'test@example.com',
      },
      isAuthenticated: true,
    });
  });

  it('renders user menu when authenticated', () => {
    render(<HeaderClient />);
    const userButton = screen.getByRole('button', { name: /test user/i });
    expect(userButton).toBeInTheDocument();
  });

  it('displays user name', () => {
    render(<HeaderClient />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('has proper accessibility attributes on user button', () => {
    render(<HeaderClient />);
    const userButton = screen.getByRole('button');
    expect(userButton).toHaveAttribute('aria-expanded', 'false');
    expect(userButton).toHaveAttribute('aria-haspopup', 'true');
  });
});
