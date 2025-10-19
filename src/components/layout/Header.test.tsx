import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HeaderClient from './HeaderClient';

describe('Header', () => {
  it('renders the logo link', () => {
    render(<HeaderClient />);
    const logo = screen.getByRole('link', { name: /smalltalks home/i });
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('href', '/');
  });

  it('displays logo text', () => {
    render(<HeaderClient />);
    expect(screen.getByText('smalltalks')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<HeaderClient />);
    const logo = screen.getByRole('link', { name: /smalltalks home/i });
    expect(logo).toHaveAttribute('aria-label', 'Smalltalks Home');
  });
});
