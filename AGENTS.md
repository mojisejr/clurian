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

---

## 🎯 Agent-Specific Guidelines

### For Code Generation Agents

1. **Next.js App Router Patterns**:
   - Use `app/` directory structure
   - API routes: `app/api/*/route.ts`
   - Pages: `app/*/page.tsx`
   - Layouts: `app/*/layout.tsx`
   - Server Actions: `app/actions/` or component-level

2. **TypeScript Requirements**:
   - Strict mode enabled
   - Leverage Prisma generated types
   - Use proper typing for server actions
   - Import domain types from `@/types` or generate from Prisma

3. **React Best Practices**:
   - Server Components by default
   - Client Components with `'use client'` directive
   - Use Radix UI primitives for accessibility
   - Follow Tailwind CSS v4 patterns

### For Database/Backend Agents

1. **PostgreSQL with Prisma**:
   - Always use Prisma Client for database operations
   - Generate Prisma client after schema changes: `npx prisma generate`
   - Run migrations: `npx prisma migrate dev`
   - Use transactions for multi-step operations

2. **Better Auth Integration**:
   - Auth configuration in `lib/auth.ts`
   - LINE Login provider setup
   - Session management via Better Auth
   - Protected routes with middleware

3. **Server Actions**:
   - Export async functions from `'use server'` modules
   - Validate inputs with Zod or similar
   - Return proper error messages
   - Use revalidation for cache updates

### For Frontend/UI Agents

1. **Component Structure**:
   - Reusable UI components in `components/ui/`
   - Feature components in appropriate subdirectories
   - Use Lucide React for icons
   - Follow existing naming conventions

2. **Styling**:
   - Tailwind CSS v4 with CSS-in-JS
   - Mobile-first responsive design
   - Thai language support (Kanit font)
   - Consistent color scheme (green/orange theme)

3. **State Management**:
   - React built-in state
   - Server state via Server Actions
   - Form state with React hooks
   - URL params for filtering/pagination

### For Testing Agents

1. **Vitest Framework**:
   - Unit tests in `tests/` directory
   - Integration tests for API routes
   - Component tests with React Testing Library
   - Mock external dependencies

2. **Test Organization**:
   - Domain logic tests: `tests/domain.test.ts`
   - Integration tests: `tests/integration.test.ts`
   - Feature-specific tests as needed
   - Setup file: `tests/setup.ts`

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

## 📊 Agent Communication Standards

### Response Quality

1. **Be Precise**: Reference actual file names and code locations
2. **Show Context**: Explain why specific approaches are chosen
3. **Provide Examples**: Include code snippets when helpful
4. **Security First**: Always consider security implications
5. **Agricultural Domain Awareness**: Understand orchard management concepts

### Code Reviews

1. **Check TypeScript Types**: Ensure all code is properly typed
2. **Validate Next.js Patterns**: Ensure App Router best practices
3. **Verify Prisma Usage**: Check for proper database operations
4. **Test Coverage**: Ensure adequate test coverage
5. **UI/UX Consistency**: Follow existing design patterns

### Task Completion

1. **Full Implementation**: Complete all requested features
2. **Database Migrations**: Include Prisma migrations if needed
3. **Testing Included**: Provide tests for new code
4. **Documentation**: Update relevant documentation
5. **Verification**: Ensure build/lint/tests pass

---

## 🏗️ Project Context for Agents

### Current Tech Stack
- **Frontend**: Next.js 16 + React 19 + TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth with LINE Login
- **UI Components**: Radix UI + Lucide React
- **Testing**: Vitest + React Testing Library
- **PDF Generation**: @react-pdf/renderer
- **QR Code**: qrcode library
- **Deployment**: Vercel (recommended)

### Project Status
- ✅ Core authentication system implemented
- ✅ Orchard and tree management features complete
- ✅ Activity logging system (individual and batch)
- ✅ Dashboard with statistics and filtering
- ✅ Follow-up tracking for sick trees
- ✅ QR code generation for trees
- ✅ PDF generation capabilities
- ✅ Mobile-responsive design
- ✅ Thai language interface

### Key Files to Understand
- `prisma/schema.prisma` - Complete database schema
- `docs/feature.md` - Detailed feature specifications (Thai)
- `docs/database.md` - Database design documentation
- `README.md` - Project overview and setup
- `package.json` - Current dependencies and scripts
- `lib/auth.ts` - Authentication configuration
- `app/dashboard/page.tsx` - Main dashboard implementation

### Domain Models
```typescript
// Core entities managed by the system
User - Orchard owners with LINE Login
Orchard - Fruit orchards with zones
Tree - Individual trees with health tracking
ActivityLog - Individual and batch activity records
```

---

## 🚀 Agent Task Examples

### When Asked to "Add New Feature":

```typescript
// Expected pattern for Server Actions
'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const CreateTreeSchema = z.object({
  orchardId: z.string().uuid(),
  code: z.string().min(1),
  zone: z.string(),
  type: z.string(),
  variety: z.string(),
})

export async function createTree(data: z.infer<typeof CreateTreeSchema>) {
  try {
    const validated = CreateTreeSchema.parse(data)
    const tree = await prisma.tree.create({
      data: validated,
    })
    return { success: true, tree }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### When Asked to "Create Component":

```tsx
// Expected pattern for components
interface TreeCardProps {
  tree: Tree & { orchard: Orchard }
  onStatusChange?: (treeId: string, status: TreeStatus) => void
}

export default function TreeCard({ tree, onStatusChange }: TreeCardProps) {
  return (
    <div className="tree-card">
      {/* Tree information display */}
      {/* Status indicator */}
      {/* Action buttons */}
    </div>
  )
}
```

### When Asked to "Update Database":

```bash
# Always use Prisma migrations
npx prisma migrate dev --name add_new_feature
npx prisma generate  # Update client types
```

---

## 📋 Quick Reference for Agents

### Common Imports
```typescript
// Next.js
import { NextRequest, NextResponse } from 'next/server'
import { headers, cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Database
import { prisma } from '@/lib/prisma'
import { TreeStatus, LogType } from '@prisma/client'

// Authentication
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

// UI Components
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'

// Utilities
import { clsx } from 'clsx'
import { toast } from 'react-hot-toast'

// Testing
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
```

### Environment Variables
```bash
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
LINE_CHANNEL_ID=...
LINE_CHANNEL_SECRET=...
```

### Package Scripts
```json
{
  "dev": "next dev",
  "build": "prisma generate && next build",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest run"
}
```

---

## Git Operations for Agents

### ✅ ALLOWED Actions
- **Commit to staging**: After successful implementation and QA
- **Push to staging**: To save progress and collaborate
- **Create PRs**: To staging branch for code review

### Standard Workflow
```bash
# After implementation is complete
git add .
git commit -m "feat(scope): description

- What was changed
- Why it was changed
- Database migrations if any
- Tests added/updated
- QA results: ✓build ✓lint ✓test ✓types"

# Push to staging
git push origin staging

# Optional: Create PR
gh pr create --base staging
```

### Task Completion
1. **Full Implementation**: Complete all requested features
2. **Database Changes**: Include Prisma migrations
3. **Testing Included**: Provide tests for new code
4. **QA Verified**: Ensure build/lint/tests pass
5. **Committed**: Push changes to staging branch
6. **Optional PR**: Create PR if requested or for complex changes

---

_This document provides essential context for AI agents to work effectively on the Clurian orchard management system._