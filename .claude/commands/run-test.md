# Test Command for Clurian Orchard Manager

## Usage
```
/run-test [test-type] [test-name]
```

## Test Command Execution

### Primary Test Command
- `/run-test` → Execute full test suite using Vitest

### Test Type Options
```bash
/run-test                    # Run all tests
/run-test unit              # Run unit tests (domain logic)
/run-test integration       # Run integration tests (API, database)
/run-test component         # Run component tests (React components)
/run-test <test-name>       # Run specific test file or pattern
```

### Test Command Implementation
```typescript
// Command execution logic:
1. Check if test framework is configured (Vitest)
2. Verify test files exist in tests/ directory
3. Execute appropriate npm script based on test type
4. Report test results and coverage if available
```

## Current Test Setup Status

### Package.json Test Scripts (Current)
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run"
  }
}
```

### Current Test Configuration
- ✅ Vitest configured in `vitest.config.ts`
- ✅ Test files exist in `tests/` directory
- ✅ React Testing Library for component tests
- ✅ jsdom environment for DOM testing
- ✅ dotenv for environment variables in tests

### Existing Tests
- `tests/domain.test.ts` - Domain logic tests (orchard, tree, activity mapping)
- `tests/integration.test.ts` - API route and database tests
- `tests/qr-redirect.test.ts` - QR code redirect feature tests
- `tests/setup.ts` - Global test setup with environment loading

## Test Execution Commands

### Run All Tests
```bash
npm test
# or
vitest run
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
# or
vitest
```

### Run Tests with Coverage
```bash
npm test -- --coverage
# or
vitest run --coverage
```

### Run Specific Test File
```bash
npm test tests/domain.test.ts
# or
vitest run tests/domain.test.ts
```

### Run Tests by Pattern
```bash
# Run integration tests only
npm test -- integration

# Run domain tests only
npm test -- domain
```

## Test Organization Structure

### Current Directory Layout
```
clurian/
├── tests/                        # All test files
│   ├── setup.ts                  # Global test setup
│   ├── domain.test.ts            # Domain logic tests
│   ├── integration.test.ts       # API/database tests
│   └── qr-redirect.test.ts       # Feature-specific tests
├── vitest.config.ts              # Vitest configuration
└── package.json                  # Test scripts
```

### Recommended Test File Locations
- **Domain Logic**: `tests/domain.test.ts`
- **API Routes**: `tests/integration.test.ts`
- **Server Actions**: `tests/integration.test.ts`
- **Components**: `tests/components.test.ts` (create if needed)
- **Features**: `tests/[feature-name].test.ts`

### Test File Naming Conventions
- `*.test.ts` - Unit/integration tests
- `*.test.tsx` - Component tests with JSX
- `setup.ts` - Global test configuration

## Test Examples

### Domain Logic Test
```typescript
// tests/domain.test.ts
import { describe, it, expect } from 'vitest'
import { mapTreeStatus, mapActivityLogType } from '@/lib/domain/mappers'

describe('Domain Mappers', () => {
  describe('mapTreeStatus', () => {
    test('maps HEALTHY to correct display text', () => {
      expect(mapTreeStatus('HEALTHY')).toBe('ปกติ')
    })

    test('maps SICK to correct display text', () => {
      expect(mapTreeStatus('SICK')).toBe('ป่วย')
    })

    test('handles unknown status', () => {
      expect(mapTreeStatus('UNKNOWN' as any)).toBe('ไม่ทราบสถานะ')
    })
  })

  describe('mapActivityLogType', () => {
    test('maps INDIVIDUAL to correct display text', () => {
      expect(mapActivityLogType('INDIVIDUAL')).toBe('รายต้น')
    })

    test('maps BATCH to correct display text', () => {
      expect(mapActivityLogType('BATCH')).toBe('ทั้งแปลง')
    })
  })
})
```

### Integration Test
```typescript
// tests/integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'

describe('Database Operations', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.activityLog.deleteMany()
    await prisma.tree.deleteMany()
    await prisma.orchard.deleteMany()
  })

  describe('Orchard Creation', () => {
    test('should create orchard with default zones', async () => {
      const orchard = await prisma.orchard.create({
        data: {
          ownerId: 'test-user-id',
          name: 'Test Orchard',
        },
      })

      expect(orchard).toBeDefined()
      expect(orchard.name).toBe('Test Orchard')
      expect(orchard.zones).toEqual([])
    })
  })

  describe('Tree Management', () => {
    test('should create tree with unique code in orchard', async () => {
      // Create orchard first
      const orchard = await prisma.orchard.create({
        data: {
          ownerId: 'test-user-id',
          name: 'Test Orchard',
        },
      })

      const tree = await prisma.tree.create({
        data: {
          orchardId: orchard.id,
          code: 'A01',
          zone: 'A',
          type: 'ทุเรียน',
          variety: 'หมอนทอง',
          status: 'HEALTHY',
        },
      })

      expect(tree).toBeDefined()
      expect(tree.code).toBe('A01')
      expect(tree.orchardId).toBe(orchard.id)
    })
  })
})
```

### Server Action Test
```typescript
// tests/server-actions.test.ts
import { describe, it, expect, vi } from 'vitest'
import { createTree } from '@/app/actions/createTree'
import { prisma } from '@/lib/prisma'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    tree: {
      create: vi.fn(),
    },
  },
}))

describe('createTree Server Action', () => {
  it('should create tree with valid data', async () => {
    const mockTree = {
      id: 'tree-id',
      code: 'A01',
      zone: 'A',
      type: 'ทุเรียน',
      variety: 'หมอนทอง',
      status: 'HEALTHY',
    }

    vi.mocked(prisma.tree.create).mockResolvedValue(mockTree as any)

    const result = await createTree({
      orchardId: 'orchard-id',
      code: 'A01',
      zone: 'A',
      type: 'ทุเรียน',
      variety: 'หมอนทอง',
    })

    expect(result.success).toBe(true)
    expect(result.tree).toEqual(mockTree)
  })

  it('should handle validation errors', async () => {
    vi.mocked(prisma.tree.create).mockRejectedValue(new Error('Validation error'))

    const result = await createTree({
      orchardId: '',
      code: '',
      zone: '',
      type: '',
      variety: '',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})
```

## Test Command Execution Flow

### When Running `/run-test`:
1. **Check Test Setup**:
   - Verify `vitest.config.ts` exists
   - Check for test files in `tests/` directory
   - Confirm test dependencies are installed

2. **Execute Tests**:
   - Run `npm test` to execute all tests
   - Capture and display results
   - Show coverage if `--coverage` flag used

3. **Report Results**:
   - Number of tests run
   - Pass/fail status
   - Test execution time
   - Any errors or failures

### When Running `/run-test <type>`:
1. **Validate Test Type**:
   - Check if test type is supported (unit, integration, component)
   - Verify corresponding test files exist

2. **Execute Specific Tests**:
   - Run targeted test command with pattern matching
   - Filter results by test type

3. **Report Results**:
   - Show results for specific test type
   - Indicate if no tests found for that type

## Testing Best Practices for Clurian

### 1. Test Structure
- **Arrange**: Set up test data (orchards, trees, activity logs)
- **Act**: Execute the code being tested
- **Assert**: Verify the expected outcome

### 2. Database Testing
- Use a separate test database or transactions
- Clean up data between tests
- Test domain-specific constraints (unique tree codes per orchard)

### 3. Server Actions Testing
- Mock external dependencies (Prisma, auth)
- Test success and error scenarios
- Validate input handling

### 4. Thai Language Support
- Test Thai text rendering and input
- Verify font loading (Kanit font)
- Check date formatting for Thai locale

### 5. Test Coverage Goals
- Aim for 80%+ code coverage
- Focus on critical business logic:
  - Tree status transitions
  - Activity logging (individual vs batch)
  - Dashboard statistics calculations
  - Authentication flows

## Current Status
- **Test Framework**: ✅ Vitest configured
- **Test Dependencies**: ✅ React Testing Library installed
- **Test Files**: ✅ 3 test files exist
- **Configuration**: ✅ Vitest setup with jsdom and dotenv
- **Ready for Testing**: ✅ All tests passing

## Test Categories for Clurian

### Domain Tests (`tests/domain.test.ts`)
- Tree status mapping (HEALTHY → 'ปกติ')
- Activity log type mapping
- Date formatting for Thai locale
- Zone management logic

### Integration Tests (`tests/integration.test.ts`)
- Prisma database operations
- Server actions execution
- API route handlers
- LINE Login integration

### Feature Tests
- QR code generation and redirect
- PDF generation for tree labels
- Batch activity logging
- Follow-up scheduling

## Next Steps for Testing
1. Add component tests for UI components
2. Increase test coverage for dashboard features
3. Add E2E tests with Playwright for critical user flows
4. Test mobile responsiveness
5. Add performance tests for large orchards