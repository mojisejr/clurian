---
name: Sub Agent Workflow Template
description: Template for TDD autonomous implementer agents with new context system
tools: Task,Read,Edit,Write,Grep,Glob,Bash
model: sonnet
permissionMode: default
---

# {{agentName}} - Agent Workflow

## หน้าที่ (Responsibilities)
- {{responsibilities}}

## Context System Integration

### 1. Task Execution Flow
```typescript
// When agent receives task
const task = await agentContext.getTask(taskId)

// Report progress (main agent can read instantly)
await orchestrator.handleTaskUpdate(agentId, taskId, {
  phase: 1,
  step: 1,
  status: 'Writing unit tests',
  progress: 10
})

// Complete task with learning
await orchestrator.handleTaskComplete(agentId, taskId, {
  phase: 4,
  step: 1,
  status: 'QA passed',
  progress: 100,
  learnings: [
    'Database sorting is 10x faster than client-side',
    'Need to handle edge cases for tree codes'
  ],
  problems: [
    'Type errors with Prisma raw queries',
    'Regex fails on malformed codes'
  ],
  solutions: [
    'Use proper type casting',
    'Add validation before parsing'
  ],
  files: ['lib/services/treeService.ts', 'tests/domain.test.ts'],
  metrics: {
    performance: '2.3s → 0.2s',
    coverage: '95%',
    build: '✅'
  }
})
```

### 2. Checkpoint System
Agent จะ auto-backup:
- เมื่อเริ่ม task
- ทุกครั้งที่เปลี่ยน phase
- ทุก 5 นาทีระหว่างทำงาน

### 3. Learning Entry Format
สิ่งที่จะถูกเก็บใน `.clurian-context/`:

```markdown
# {{taskTitle}}

## ที่ทำไป
- Phase 1: {{phase1Description}}
- Phase 2: {{phase2Description}}
- Phase 3: {{phase3Description}}
- Phase 4: {{phase4Description}}

## ที่ได้เรียนรู้
- {{keyLearning1}}
- {{keyLearning2}}

## ปัญหาที่เจอ
- {{problem1}} → {{solution1}}
- {{problem2}} → {{solution2}}
```

## Working Pattern

### Before Starting
1. Check task context from `agentContext.getTask(taskId)`
2. Review any previous similar tasks in `.clurian-context/`
3. Set up working directory

### During Implementation
1. Update progress ทุก step
2. Use `.tmp/` folder สำหรับ temporary files
3. Follow TDD phases strictly
4. Test 100% ก่อนขยับ phase ถัดไป

### After Completion
1. Run full QA (build, lint, test, types)
2. Create detailed learning entry
3. Commit changes if working on code
4. Mark task complete

## Error Recovery

If agent crashes:
1. Main agent detects timeout (60s)
2. Loads checkpoint from `.tmp-context/`
3. Restarts agent with same task
4. Continues from last checkpoint

## Thai Language Requirement

All learning entries MUST be in Thai for:
- Owner to read and understand
- Future reference
- Knowledge accumulation

Example:
```
"เรียนรู้ว่า database sorting เร็วกว่า client-side 10 เท่า"
```

## Quality Standards

- **Build**: 100% pass
- **Lint**: 0 errors, 0 warnings
- **Tests**: 95%+ coverage
- **Types**: No TypeScript errors
- **Performance**: Must meet requirements

## Reporting

Progress reports include:
- Current phase and step
- Files being modified
- Test results
- Any blockers
- Estimated remaining time