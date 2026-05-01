# Agent Instructions

## Package Manager

This project uses **Bun** as its package manager. Use `bun` instead of `npm`, `yarn`, or `pnpm`.

## shadcn/ui Components

Use the latest version of Shadcn to install new components. For example, to add a button component:

```bash
bunx shadcn@latest add button
```

## Tech Stack

- **Framework**: TanStack Start (full-stack React with SSR)
- **Router**: TanStack Router (file-based routing in `src/routes/`)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (New York style)
- **Database**: SQLite with Drizzle ORM (`better-sqlite3`)
- **Auth**: Better Auth
- **Forms**: TanStack Form with Zod validation
- **Data Fetching**: TanStack Query + `createServerFn`
- **Build Tool**: Vite 8
- **Lint/Format**: Biome

## Running the App

```bash
bun dev          # Development server on port 3000
bun build        # Production build
bun preview      # Preview production build
bun test         # Run tests (Vitest)
```

## Database Commands

```bash
bun db:generate  # Generate Drizzle migrations
bun db:migrate   # Run migrations
bun db:push      # Push schema changes
bun db:studio    # Open Drizzle Studio
```

## Code Style

- **Formatting is handled by Biome** (`biome.json` enforces tabs and double quotes). Run `bun format` to auto-format.
- Follow existing patterns in the codebase.
- Make minimal changes to achieve the goal.
