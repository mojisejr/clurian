## Project Overview

**Project Name**: Clurian - Orchard Manager

**Repository**: https://github.com/mojisejr/clurian

**Author**: mojisejr

**Description**: A modern web application for managing fruit orchards, tracking tree health, and maintaining activity logs. Built with Next.js 16, TypeScript, and PostgreSQL, featuring LINE Login authentication and comprehensive orchard management capabilities.

---

## ⚠️ CRITICAL SAFETY RULES

### 🚨 FORBIDDEN ACTIONS (NEVER ALLOWED)

- ❌ **NEVER merge PRs yourself** - Provide PR link and wait for user instructions
- ✅ **ALLOWED to commit and push to staging branch** - For iterative development
- ✅ **ALLOWED to create PRs to staging** - After successful implementation and QA
- ❌ **NEVER work on main branch** - Always use staging or feature branches
- ❌ **NEVER delete critical files** (.env, .git/, node_modules/, package.json, next.config.ts, prisma/schema.prisma)
- ❌ **NEVER commit sensitive data** (API keys, passwords, secrets) - Use environment variables
- ❌ **NEVER skip 100% validation** (build, lint, test) - Must pass completely
- ❌ **NEVER use git push --force** - Only use --force-with-lease when absolutely necessary
- ❌ **NEVER implement without proper testing** - Follow TDD/TDD-lite cycle

### 📁 MANDATORY TEMPORARY FILE MANAGEMENT (CRITICAL)

#### 🚨 STRICT .TMP FOLDER POLICY (NO EXCEPTIONS)

- ❌ **NEVER use system temp directories** (`/tmp/`, `$TEMP`, etc.)
- ❌ **NEVER create temporary files in project root or other folders**
- ✅ **ALWAYS create temporary files in `.tmp/` folder ONLY**
- ✅ **ALWAYS clean up `.tmp/` folder after each operation**
- ✅ **ALWAYS ensure `.tmp/` folder is in `.gitignore`**

#### 🎯 ENFORCED TEMPORARY FILE WORKFLOW

**1. Pre-Operation Setup**:
```bash
# ALWAYS create .tmp folder if it doesn't exist
mkdir -p .tmp
# ALWAYS ensure .tmp/ is in .gitignore
echo ".tmp/" >> .gitignore
```

**2. Temporary File Creation**:
```bash
# ALWAYS use project .tmp folder
echo "content" > .tmp/temp-file.md
# NEVER use system temp
# echo "content" > /tmp/temp-file.md  ❌ FORBIDDEN
```

**3. Post-Operation Cleanup**:
```bash
# ALWAYS clean up .tmp folder after operation
rm -rf .tmp/*
# or for specific files
rm .tmp/temp-file.md
```

#### 🔍 AUTOMATIC VERIFICATION

All operations MUST:
1. Check `.tmp/` folder exists before operation
2. Create temporary files ONLY in `.tmp/` folder
3. Clean up `.tmp/` folder immediately after use
4. Verify cleanup success before completion

### 📋 MANDATORY WORKFLOW RULES

- ✅ **ALWAYS** sync staging branch before any implementation: `git checkout staging && git pull origin staging`
- ✅ **ALWAYS** create feature branch for new work: `git checkout -b feature/[description]`
- ✅ **ALWAYS** ensure 100% build success before commit: `npm run build`
- ✅ **ALWAYS** ensure 100% lint pass before commit: `npm run lint`
- ✅ **ALWAYS** ensure TypeScript compilation: `npx tsc --noEmit`
- ✅ **ALWAYS** run tests before commit: `npm test`
- ✅ **ALWAYS** use `.tmp/` folder for temporary files and clean up immediately after use

---

## 📊 Response Quality Standards (MANDATORY)

### 1. **On-Point**
- Answer only what was asked
- No out-of-scope information
- Cut unnecessary details

### 2. **Good Context Ordering**
- Simple to complex progression
- Start with robust answer first
- Gradually increase complexity
- Order information for easy comprehension

### 3. **Exact Details**
- Provide accurate and specific information
- Reference actual file, function, variable names
- No hallucinating about code or structure
- Verify assumptions before answering

### 4. **Security-First Focus**
- Always consider security implications
- Recommend secure approach first
- Warn about potential risks
- Explain why approach is secure

### 5. **Senior Developer Mindset**
- Provide unbiased feedback
- Answer directly and straightforwardly
- Demonstrate expertise in domain
- Use best practices for technology stack

---

## 🌐 Response Language Policy

### Thai-Only Responses (MANDATORY)

- **ALL responses MUST be in Thai language** - ไม่ว่าผู้ใช้จะถามเป็นภาษาใด
- **User asks in English** → Respond in Thai
- **User asks in Thai** → Respond in Thai
- **User asks in any language** → Respond in Thai
- **Technical terms** → Keep English terms in parentheses (Next.js, TypeScript, Prisma, etc.)

### ตัวอย่าง / Examples

**User (English)**: "How do I add a new tree to the orchard?"
**Agent (Thai)**: "การเพิ่มต้นไม้ใหม่ในสวน สามารถทำได้ผ่านฟอร์ม AddTree ใน `components/forms/AddTree.tsx` โดย..."

**User (Thai)**: "จะเพิ่มต้นไม้ใหม่ยังไง?"
**Agent (Thai)**: "การเพิ่มต้นไม้ใหม่ในสวน สามารถทำได้ผ่านฟอร์ม AddTree ใน `components/forms/AddTree.tsx` โดย..."

---

## 🏗️ Technical Architecture

### Core Stack
**Language**: TypeScript • **Framework**: Next.js 16 (App Router) • **Database**: PostgreSQL + Prisma ORM • **Authentication**: Better Auth with LINE Login • **UI**: Radix UI + Tailwind CSS v4 • **Testing**: Vitest + React Testing Library • **Deployment**: Vercel

### Project Structure

```
clurian/
├── README.md                      # Project overview and setup
├── AGENTS.md                      # Agent-specific guidelines
├── CLAUDE.md                      # This file - Claude-specific instructions
├── docs/                          # Documentation
│   ├── feature.md                 # Feature specifications (Thai)
│   ├── database.md                # Database design documentation
│   ├── tech.md                    # Technology stack details
│   └── api.md                     # API documentation
├── app/                           # Next.js App Router
│   ├── api/                       # API routes
│   │   └── auth/[...better-auth]/ # Better Auth endpoints
│   ├── dashboard/                 # Main dashboard pages
│   │   ├── page.tsx              # Dashboard with tabs
│   │   ├── trees/page.tsx        # Tree management tab
│   │   ├── batch/page.tsx        # Batch activities tab
│   │   └── followups/page.tsx    # Follow-up tracking tab
│   ├── login/                     # Login page
│   ├── actions/                   # Server actions
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/                    # React components
│   ├── dashboard/                # Dashboard-specific components
│   ├── forms/                    # Form components (AddTree, AddLog)
│   ├── modals/                   # Modal components
│   ├── pdf/                      # PDF generation components
│   ├── ui/                       # Reusable UI primitives
│   └── providers/                # Context providers
├── lib/                          # Utilities and configurations
│   ├── auth.ts                   # Better Auth configuration
│   ├── prisma.ts                 # Prisma client
│   ├── domain/                   # Business logic mappers
│   ├── errors/                   # Error definitions
│   └── services/                 # Service layer
├── prisma/                       # Database schema and migrations
│   └── schema.prisma             # Complete database schema
├── tests/                        # Test files
│   ├── setup.ts                  # Test setup
│   ├── domain.test.ts            # Domain logic tests
│   ├── integration.test.ts       # Integration tests
│   └── qr-redirect.test.ts       # QR code redirect tests
├── public/                       # Static assets
└── .env                          # Environment variables (git-ignored)
```

### Database Schema (Simplified)

```sql
-- Authentication (Better Auth)
User, Session, Account, Verification

-- Domain Models
Orchard {
  id, ownerId, name, zones (JSON), createdAt
}

Tree {
  id, orchardId, code, zone, type, variety,
  plantedDate, status (HEALTHY|SICK|DEAD|ARCHIVED),
  replacement tracking
}

ActivityLog {
  id, orchardId, logType (INDIVIDUAL|BATCH),
  treeId (for individual), targetZone (for batch),
  action, note, performDate, status, followUpDate
}
```

### Git Branch Strategy

```
main              ←─ DEVELOPER (manual merge)
  │                └─ Production-ready code
staging ←───────   ←─ FEATURE BRANCHES (PRs)
  │                └─ Integration testing
feature/*         ←─ Development work
```

### Key Features Implemented

- **Authentication**: LINE Login integration with Better Auth
- **Orchard Management**: Multi-orchard support with zone management
- **Tree Management**: Complete CRUD with status tracking and replanting
- **Activity Logging**: Individual and batch activity logging
- **Dashboard**: Statistics, filtering, search, pagination
- **Follow-up Tracking**: Health monitoring with scheduled follow-ups
- **QR Code Generation**: Tree identification with PDF export
- **Mobile-First UI**: Responsive design with Thai language support

### Development Commands

```bash
npm run dev           # Development server (http://localhost:3000)
npm run build         # Production build (includes prisma generate)
npm run start         # Start production server
npm run lint          # ESLint checks
npx tsc --noEmit      # TypeScript type checking
npm test              # Run tests (Vitest)
npx prisma generate   # Generate Prisma client
npx prisma migrate dev # Run database migrations
npx prisma studio     # Open database GUI
```

### Environment Setup

```bash
# Required environment variables
DATABASE_URL=postgresql://user:password@localhost:5432/clurian
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
LINE_CHANNEL_ID=your-line-channel-id
LINE_CHANNEL_SECRET=your-line-channel-secret
```

---

## 🧪 Testing System

### Vitest Framework

- **Unit Tests**: Domain logic, utilities, pure functions
- **Integration Tests**: API routes, database operations
- **Component Tests**: React components with Testing Library
- **E2E Tests**: (Future) Playwright for full user flows

### Test Structure

```
tests/
├── setup.ts              # Global test setup
├── domain.test.ts        # Business logic tests
├── integration.test.ts   # API/database tests
└── qr-redirect.test.ts   # Feature-specific tests
```

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

---

## 🎯 Quality Standards

### Code Quality Requirements

- **TypeScript**: Strict mode enabled
- **ESLint**: Zero warnings (enforced)
- **Build**: 100% success rate before commit
- **Tests**: Unit tests for critical paths
- **React**: Follow Next.js App Router best practices

### Database Standards

- **Prisma**: Type-safe database operations
- **Migrations**: Version-controlled schema changes
- **Transactions**: For multi-step operations
- **Indexing**: Optimized queries for performance

### Security Standards

- **Authentication**: Better Auth with LINE Login
- **Session Management**: Secure token-based sessions
- **Input Validation**: Zod schemas for server actions
- **Environment Variables**: No hardcoded secrets
- **SQL Injection Prevention**: Prisma ORM protection

---

## 📋 Available Commands

### Implementation Commands

```bash
/impl [task description]        # Implementation workflow with testing
/run-test [type]               # Run specific test types
```

### Command Execution Flow

**When using /impl:**
1. Check current branch (must be staging)
2. Create feature branch
3. Phase 0: Analysis & Planning
4. Phase 1: Write tests
5. Phase 2: Implement feature
6. Phase 3: Refactor & optimize
7. Phase 4: QA (build, lint, test, types)
8. Commit with conventional format

**When using /run-test:**
1. Check testing framework status
2. Execute appropriate test command
3. Report results and coverage

---

## Git Operations Policy

### ✅ ALLOWED Actions
- **Commit to staging branch**: For iterative development
- **Push to staging branch**: To save progress
- **Create PRs to staging**: For code review and tracking

### ❌ FORBIDDEN Actions
- **Push to main branch**: Direct pushes not allowed
- **Merge PRs to main**: Requires user approval
- **Force push**: Only use `--force-with-lease` when absolutely necessary

### Standard Git Workflow
```bash
# After completing implementation and QA
git add .
git commit -m "feat(scope): description

- Changes made
- Database migrations if any
- Tests added/updated
- QA checks passed (build, lint, test, types)

Closes #123"

# Push to staging
git push origin staging

# Optional: Create PR for review
gh pr create --base staging --title "Feature Title" --body "Description of changes"
```

---

## 📚 Key Documentation

- **README**: Project overview and setup instructions
- **PRD**: `docs/feature.md` - Complete feature specifications (Thai)
- **Database Design**: `docs/database.md` - Schema and relationships
- **API Documentation**: `docs/api.md` - Endpoint documentation
- **Tech Stack**: `docs/tech.md` - Technology details

---

## 🚨 Important Notes for Claude

### Domain Knowledge
- This is an **orchard management system**, NOT a tarot reading app
- Focus on agricultural domain: trees, orchards, activities, health tracking
- Understand Thai language requirements for UI
- Mobile-first design is crucial for field use

### Technical Constraints
- Always use Prisma for database operations
- Server Actions are preferred over API routes for form submissions
- LINE Login is the primary authentication method
- All UI must support Thai language (Kanit font)

### Common Pitfalls to Avoid
- Don't reference AI/ML features (they don't exist)
- Don't mention Vercel Workflows or AI Gateway
- Don't assume tarot-related functionality
- Always check actual file structure before referencing files

---

_This document focuses on Claude-specific instructions for efficient development of the Clurian orchard management system._