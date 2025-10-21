import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Footer from './Footer';

describe('Footer', () => {
  it('renders About link', () => {
    render(<Footer />);
    const aboutLink = screen.getByRole('link', { name: /about/i });
    expect(aboutLink).toBeInTheDocument();
    expect(aboutLink).toHaveAttribute('href', '/');
  });

  it('renders Support link', () => {
    render(<Footer />);
    const supportLink = screen.getByRole('link', { name: /support/i });
    expect(supportLink).toBeInTheDocument();
    expect(supportLink).toHaveAttribute('href', 'mailto:example@example.com');
  });

  it('has proper navigation landmark', () => {
    render(<Footer />);
    const nav = screen.getByRole('navigation', { name: /footer navigation/i });
    expect(nav).toBeInTheDocument();
  });
});
