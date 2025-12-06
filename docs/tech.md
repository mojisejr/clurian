# Tech Stack Documentation

## Overview
Clurian is built as a modern web application using the Next.js framework, prioritizing performance, type safety, and developer experience.

## Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: 
  - Headless UI: [Radix UI](https://www.radix-ui.com/)
  - Icons: [Lucide React](https://lucide.dev/)
  - Utils: `clsx`, `tailwind-merge`, `class-variance-authority` (for constructing reusable component variants)

## Backend & Authentication
- **Authentication**: [Better Auth](https://better-auth.com/)
  - **Provider**: LINE Login
  - **Strategy**: Session management via Better Auth
- **API**: Next.js Server Actions & API Routes

## Database & ORM
- **Database**: PostgreSQL
  - **Development**: Docker Container via Docker Compose
- **ORM**: [Prisma](https://www.prisma.io/)
  - Schema management and migrations
  - Type-safe database queries

## Infrastructure & DevOps
- **Containerization**: Docker (for local database)
- **Package Manager**: npm (inferred from usage)

## Development Requirements
- **Node.js**: LTS version recommended
- **Docker Desktop**: Required for running the local database instance

## Implementation Plan (Phase 1)
1.  **Database Setup**: 
    - Create `docker-compose.yml` for PostgreSQL.
    - Initialize Prisma.
2.  **Authentication**:
    - Install and configure Better Auth.
    - Setup LINE Developers console credentials.
    - Create User schema in Prisma compatible with Better Auth.
