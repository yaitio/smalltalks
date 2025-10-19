# Smalltalks

AI-powered voice conversation platform for language learning. Practice speaking with natural, real-time conversations using OpenAI's Realtime API.

[![CI](https://github.com/your-org/smalltalks/workflows/CI/badge.svg)](https://github.com/your-org/smalltalks/actions)

## Prerequisites

- **Node.js**: v20 or higher
- **pnpm**: v10 or higher (recommended package manager)
- **Modern browser**: Chrome, Firefox, Safari, or Edge with WebRTC support

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/smalltalks.git
cd smalltalks

# Install dependencies
pnpm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# API Configuration
PUBLIC_API_URL=http://localhost:3000

# Development: Bypass authentication
PUBLIC_AUTH_BYPASS=true

# Environment
NODE_ENV=development
```

See `.env.example` for all available configuration options.

### Development

```bash
# Start development server
pnpm dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser.

## Commands

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Start development server at `localhost:4321` |
| `pnpm build` | Build production site to `./dist/` |
| `pnpm preview` | Preview production build locally |
| `pnpm lint` | Run Biome linter |
| `pnpm lint:fix` | Fix linting issues automatically |
| `pnpm test` | Run unit tests with Vitest |
| `pnpm test:e2e` | Run end-to-end tests with Playwright |
| `pnpm astro check` | Type-check TypeScript files |

## Project Structure

```text
smalltalks/
├── src/
│   ├── components/          # React components
│   │   ├── layout/          # Header, Footer
│   │   ├── atoms/           # Small reusable components
│   │   ├── molecules/       # Composed components
│   │   └── organisms/       # Complex UI sections
│   ├── hooks/               # Custom React hooks
│   ├── layouts/             # Astro layouts
│   ├── pages/               # Astro pages (routes)
│   ├── services/            # API clients
│   ├── stores/              # Zustand state stores
│   ├── styles/              # Global styles & tokens
│   │   ├── tokens/          # Design system tokens
│   │   └── utils/           # Utility classes
│   ├── types/               # TypeScript types
│   └── utils/               # Utility functions
├── public/                  # Static assets
├── docs/                    # Documentation
└── test/                    # Test utilities
```

## Tech Stack

- **Framework**: [Astro](https://astro.build/) v5.x - Static site generation with island architecture
- **UI Library**: [React](https://react.dev/) v19.x - Interactive components
- **TypeScript**: Type-safe development
- **State Management**: [Zustand](https://zustand.docs.pmnd.rs/) - Lightweight state management
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) - Form handling with validation
- **Styling**: CSS Modules + Design Tokens - Component-scoped styles
- **Linting**: [Biome](https://biomejs.dev/) - Fast linter and formatter
- **Testing**: [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/) - Unit and E2E testing
- **CI/CD**: GitHub Actions - Automated testing and deployment

## Development Workflow

### Running Tests

```bash
# Unit tests (watch mode)
pnpm test

# Unit tests (single run with coverage)
pnpm test run --coverage

# E2E tests
pnpm test:e2e
```

### Code Quality

```bash
# Run linter
pnpm lint

# Auto-fix linting issues
pnpm lint:fix

# Type checking
pnpm astro check
```

### Building for Production

```bash
# Create production build
pnpm build

# Preview production build
pnpm preview
```

## Authentication

In development mode, authentication is bypassed by default (`PUBLIC_AUTH_BYPASS=true`). This allows you to access protected routes without logging in.

For production, the app uses a magic link authentication flow with httpOnly cookies.

## WebRTC Integration

The app uses OpenAI's Realtime API via WebRTC data channels. Backend proxy endpoints handle:
- Token generation: `GET /api/v1/rtc/token`
- SDP exchange: `POST /api/v1/rtc/session`

See [BACKEND_API_REQUIREMENTS.md](docs/BACKEND_API_REQUIREMENTS.md) for complete API specification.

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run tests and linting
4. Submit a pull request

All PRs must pass CI checks before merging.

## Documentation

- [Prototype Analysis](docs/PROTOTYPE_ANALYSIS.md) - Analysis of original prototype
- [Backend API Requirements](docs/BACKEND_API_REQUIREMENTS.md) - API specification for backend team
- [Tech Stack Decision](docs/TECH_STACK_DECISION.md) - Technology choices and rationale
- [UI Plan](docs/ui-plan.md) - Complete UI implementation plan
- [Task Breakdown](docs/tasks/) - Week-by-week implementation tasks

## License

MIT
