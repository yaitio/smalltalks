import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer', () => {
  it('renders About link', () => {
    render(<Footer />);
    const aboutLink = screen.getByRole('link', { name: /about/i });
    expect(aboutLink).toBeInTheDocument();
    expect(aboutLink).toHaveAttribute('href', '/about');
  });

  it('renders Support link', () => {
    render(<Footer />);
    const supportLink = screen.getByRole('link', { name: /support/i });
    expect(supportLink).toBeInTheDocument();
    expect(supportLink).toHaveAttribute('href', '/support');
  });

  it('has proper navigation landmark', () => {
    render(<Footer />);
    const nav = screen.getByRole('navigation', { name: /footer navigation/i });
    expect(nav).toBeInTheDocument();
  });
});
