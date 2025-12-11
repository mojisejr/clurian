# TDD Planning Command

## Usage
```
/plan [task description] [issue-number]
/plan [issue-number]
```

## Overview
The `/plan` command creates a comprehensive TDD implementation plan with detailed phases, success criteria, and quality gates. It focuses on planning BEFORE implementation, ensuring all requirements are understood and testable.

## 🎯 Purpose

### Primary Goals:
1. **Thorough Requirement Analysis** - Break down requirements into testable components
2. **TDD Test Strategy** - Plan ALL tests before writing any code
3. **Quality Gate Definition** - Set explicit success criteria for each phase
4. **Risk Identification** - Identify potential blockers and dependencies
5. **Implementation Roadmap** - Create step-by-step implementation plan

### When to Use:
- **Before** starting any new feature implementation
- **Before** fixing complex bugs
- **When requirements are unclear or complex**
- **For PRD review and test planning**
- **To estimate implementation effort**

---

## 📋 Phase-by-Phase TDD Planning Framework

### 🔍 Phase 0: Discovery & Analysis
**Objective**: Complete understanding of requirements and constraints

#### Planning Steps:
1. **Requirement Deconstruction**
   - [ ] Break requirement into smallest testable units
   - [ ] Identify all user stories/use cases
   - [ ] List all acceptance criteria
   - [ ] Define expected behaviors and edge cases
   - [ ] Document any assumptions or clarifications needed

2. **Codebase Impact Analysis**
   - [ ] Identify existing code that will be modified
   - [ ] Find related components/services/models
   - [ ] Check for breaking changes
   - [ ] Verify database schema changes needed
   - [ ] Identify new dependencies required

3. **Domain Modeling**
   - [ ] Define new data structures/types
   - [ ] Map domain entities and relationships
   - [ ] Plan database schema changes
   - [ ] Identify business logic rules

**Success Criteria**:
- ✓ All requirements are broken into testable units
- ✓ Impact on existing code is fully documented
- ✓ Domain model is clearly defined
- ✓ All assumptions are documented and validated

#### Deliverables:
- Requirement breakdown document
- Impact analysis report
- Domain model diagrams
- List of questions/clarifications needed

---

### 🧪 Phase 1: Test Strategy & Planning
**Objective**: Create comprehensive test plan covering all scenarios

#### Test Categories to Plan:

1. **Unit Tests (Domain Logic)**
   - [ ] Pure functions and business logic
   - [ ] Data transformations and validations
   - [ ] Utility functions
   - [ ] Service layer methods
   - Location: `tests/domain.test.ts`

2. **Integration Tests**
   - [ ] API endpoints (app/api/*/route.ts)
   - [ ] Database operations
   - [ ] Third-party integrations (LINE Login, etc.)
   - [ ] Server Actions
   - Location: `tests/integration.test.ts`

3. **Component Tests**
   - [ ] React components (UI, forms, modals)
   - [ ] User interactions
   - [ ] State management
   - [ ] Accessibility features
   - Location: `tests/components/*.test.tsx`

4. **E2E Scenarios** (Future)
   - [ ] Complete user workflows
   - [ ] Critical path testing
   - [ ] Cross-browser compatibility

#### Test Case Planning Template:
```typescript
// Example test case structure
describe('[Feature Name]', () => {
  describe('Happy Path', () => {
    it('should [expected behavior] when [condition]', () => {})
    it('should [expected behavior] with [valid input]', () => {})
  })

  describe('Edge Cases', () => {
    it('should handle [boundary condition]', () => {})
    it('should handle [empty/null/undefined]', () => {})
  })

  describe('Error Cases', () => {
    it('should return [error] when [invalid condition]', () => {})
    it('should validate [input constraints]', () => {})
  })
})
```

**Success Criteria**:
- ✓ 100% of requirements have corresponding test cases
- ✓ All edge cases and error scenarios are covered
- ✓ Test file structure is planned
- ✓ Test data and mocks are planned

#### Temporary Storage:
- Test case matrix stored in `.tmp/test-matrix.md`
- Mock requirements listed in `.tmp/mocks.md`
- Test data prepared in `.tmp/test-data.json`
- **CRITICAL**: All `.tmp` files deleted after issue creation

---

### 🟢 Phase 2: Implementation Strategy
**Objective**: Plan the order and approach for implementation

#### Implementation Planning:

1. **Priority Ordering**
   - [ ] Critical path features first
   - [ ] Dependencies and prerequisites
   - [ ] Database changes (migrations)
   - [ ] Core business logic
   - [ ] UI components
   - [ ] Integration points

2. **Red-Green-Refactor Schedule**
   ```
   Day 1:
     - Morning: Write ALL failing tests (RED)
     - Afternoon: Start GREEN phase implementation

   Day 2:
     - Morning: Complete GREEN phase (all tests pass)
     - Afternoon: Begin REFACTOR phase

   Day 3:
     - Complete REFACTOR and QA
   ```

3. **Development Approach**
   - [ ] Test-Driven Development (strict TDD)
   - [ ] Small, incremental commits
   - [ ] Continuous test running
   - [ ] Immediate regression testing

**Success Criteria**:
- ✓ Implementation order is logical and dependency-aware
- ✓ Daily goals are achievable
- ✓ Risk mitigation strategies are in place

#### Deliverables:
- Implementation timeline
- Dependency graph
- Risk register with mitigation plans
- Daily goal breakdown

---

### 🔒 Phase 3: Quality Gates & Success Criteria
**Objective**: Define non-negotiable quality standards

#### Quality Gates Checklist:

1. **Build Gates** (Must Pass 100%)
   - [ ] `npm run build` completes without errors
   - [ ] No TypeScript compilation errors
   - [ ] All assets optimized correctly
   - [ ] Production bundle size within limits

2. **Linting Gates** (Must Pass 100%)
   - [ ] `npm run lint` completes with zero warnings
   - [ ] `npx tsc --noEmit` passes without errors
   - [ ] Code follows all ESLint rules
   - [ ] No console errors in browser

3. **Testing Gates** (Must Pass 100%)
   - [ ] ALL new tests pass
   - [ ] ALL existing tests still pass (no regressions)
   - [ ] Test coverage ≥ 90% for new code
   - [ ] No ignored or pending tests

4. **Performance Gates**
   - [ ] Page load times < 3 seconds
   - [ ] No memory leaks
   - [ ] Efficient database queries
   - [ ] Responsive on mobile devices

5. **Security Gates**
   - [ ] No hardcoded secrets
   - [ ] Proper input validation
   - [ ] SQL injection prevention
   - [ ] XSS prevention
   - [ ] Authentication/authorization checks

#### Success Metrics:
- **Code Quality**: 0 warnings, 0 errors
- **Test Coverage**: 90%+ for new code
- **Performance**: All pages load < 3s
- **Security**: Passes all security checks
- **Documentation**: 100% API documentation

---

### 📦 Phase 4: Deliverables & Documentation
**Objective**: Plan all documentation and delivery artifacts

#### Documentation Planning:
1. **Technical Documentation**
   - [ ] API documentation updates
   - [ ] Database schema changes
   - [ ] Component library updates
   - [ ] Setup/deployment instructions

2. **User Documentation**
   - [ ] Feature walkthrough
   - [ ] Updated user guide
   - [ ] Release notes
   - [ ] Training materials (if needed)

3. **Developer Documentation**
   - [ ] Code comments for complex logic
   - [ ] Architecture decisions record (ADR)
   - [ ] Testing guidelines
   - [ ] Troubleshooting guide

#### Deliverable Checklist:
- [ ] Source code with 100% test coverage
- [ ] Updated documentation
- [ ] Migration scripts (if needed)
- [ ] Test data seeds
- [ ] Performance benchmarks
- [ ] Security audit report
- [ ] Release notes

---

## 🚀 Execution Flow for /plan Command

### Step 1: Initial Setup
```bash
# Verify current branch
git branch --show-current

# Ensure on staging branch
git checkout staging

# Pull latest changes
git pull origin staging
```

### Step 2: Requirement Gathering
1. Parse the task description/issue
2. Ask clarifying questions if needed
3. Document all requirements and constraints

### Step 3: Prepare Planning Content
```bash
# MANDATORY: Use .tmp folder only
mkdir -p .tmp

# Create temporary planning file
touch .tmp/plan-temp.md
```

### Step 4: Generate TDD Plan
1. **Phase 0**: Complete requirement analysis
2. **Phase 1**: Design comprehensive test strategy
3. **Phase 2**: Plan implementation approach
4. **Phase 3**: Define quality gates
5. **Phase 4**: List deliverables

### Step 5: Review & Validate
1. Review plan completeness
2. Validate test coverage strategy
3. Check for missing edge cases
4. Verify quality gates are realistic

### Step 6: Create GitHub Issue (NOT .md file)
```bash
# MANDATORY: Use .tmp folder only
mkdir -p .tmp

# Create temporary plan content
cat > .tmp/plan-content.md << 'EOF'
<!-- TDD Implementation Plan Content -->
EOF

# Create GitHub issue with the plan
gh issue create \
  --title "📋 TDD Plan: [Feature Name]" \
  --body "$(cat .tmp/plan-content.md)" \
  --label "planning,tdd" \
  --assignee @me

# CRITICAL: Clean up .tmp folder immediately
rm -f .tmp/plan-content.md

# OPTIONAL: Create branch if ready to implement
git checkout -b feature/[feature-name]
```

### Step 7: Verify Issue Creation
```bash
# List recently created issues to verify
gh issue list --limit 1 --state open

# Store issue URL for reference
echo "Plan created in GitHub issue - check URL above"
```

---

## 📋 GitHub Issue Template for TDD Plan

```markdown
<!-- This template will be used when creating GitHub issue -->

# 📋 TDD Implementation Plan: [Feature Name]

## 🎯 Requirements
- [ ] User story/requirement 1
- [ ] User story/requirement 2
- [ ] ...

## 🧪 Test Strategy

### Unit Tests (tests/domain.test.ts)
- [ ] Test case 1
- [ ] Test case 2
- [ ] Edge case handling
- [ ] Error validation

### Integration Tests (tests/integration.test.ts)
- [ ] API endpoint test 1
- [ ] Database operation test 1
- [ ] Authentication flow
- [ ] Error responses

### Component Tests (tests/components/*.test.tsx)
- [ ] Component render test 1
- [ ] User interaction test 1
- [ ] Form validation
- [ ] Accessibility tests

## 🏗️ Implementation Order
1. **Database Changes** (if needed)
   - [ ] Schema modifications
   - [ ] Migration scripts
2. **Domain Logic** (lib/domain/)
   - [ ] Business rules
   - [ ] Data transformations
3. **API Endpoints** (app/api/)
   - [ ] Server Actions
   - [ ] Route handlers
4. **UI Components** (components/)
   - [ ] Page components
   - [ ] Form components
5. **Integration**
   - [ ] Connect components to API
   - [ ] End-to-end flows

## 🔒 Quality Gates (MUST PASS 100%)
- [ ] Build: `npm run build` ✅
- [ ] Lint: `npm run lint` ✅
- [ ] TypeScript: `npx tsc --noEmit` ✅
- [ ] Tests: `npm test` ✅
- [ ] Coverage: ≥ 90% for new code ✅

## 📦 Deliverables
- [ ] Source code with tests
- [ ] API documentation
- [ ] Component documentation
- [ ] Migration scripts (if needed)

## ⏱️ Timeline
- **Day 1**: RED phase (write failing tests) + GREEN phase (make them pass)
- **Day 2**: REFACTOR phase (improve code quality)
- **Day 3**: QA phase (all quality gates) + Documentation

## 🚨 Notes & Assumptions
- List any assumptions made
- Identify potential risks
- Note any dependencies on other features

---
*Created via `/plan` command with TDD methodology*
```

---

## 🎯 Success Criteria for /plan

### Plan Quality:
- ✓ All requirements are testable
- ✓ Test coverage is comprehensive
- ✓ Quality gates are non-negotiable
- ✓ Implementation order is logical
- ✓ Risks are identified and mitigated

### Process Compliance:
- ✓ Branch is staging (not main)
- ✓ Plan is saved as GitHub issue (NOT .md file)
- ✓ .tmp folder is cleaned up immediately
- ✓ Issue URL is provided for reference
- ✓ Implementation ready to start

---

## ⚠️ Critical Rules

### NEVER SKIP:
- Requirements analysis
- Test case planning
- Quality gate definition
- Risk assessment
- Documentation planning

### ALWAYS INCLUDE:
- Edge cases and error handling
- Performance considerations
- Security requirements
- Accessibility standards
- Mobile responsiveness

### MANDATORY SECTIONS:
- Clear success criteria
- Comprehensive test plan
- Non-negotiable quality gates
- Complete deliverable list
- Realistic timeline

### 🚨 FILE HANDLING RULES:
- ❌ **NEVER** save plans as .md files in project
- ✅ **ALWAYS** create GitHub issue using `gh` command
- ✅ **ALWAYS** use `.tmp/` folder for temporary content
- ✅ **ALWAYS** clean up `.tmp/` immediately after issue creation
- ✅ **NEVER** commit plan files to git repository

---

## 🔄 Next Steps After Planning

Once the plan is complete and approved:

1. **Check the GitHub issue** for the complete plan
2. **Execute /impl command** with the same task
3. **Follow the TDD phases** exactly as planned in the issue
4. **Meet ALL quality gates** - no exceptions
5. **Update the GitHub issue** with progress/comments
6. **Close the issue** when implementation is complete

Remember: **A good plan leads to good code. No plan leads to problems.**

## 📝 Example Command Execution

```bash
# User runs:
/plan Add tree health monitoring feature

# System executes:
1. Creates .tmp/plan-temp.md with analysis
2. Generates comprehensive TDD plan
3. Creates GitHub issue:
   gh issue create \
     --title "📋 TDD Plan: Add tree health monitoring" \
     --body "$(cat .tmp/plan-temp.md)" \
     --label "planning,tdd" \
     --assignee @me
4. Cleans up: rm -rf .tmp/*
5. Returns: "Plan created: https://github.com/mojisejr/clurian/issues/123"
```

---

*This planning command ensures that every implementation follows strict TDD principles with comprehensive testing and quality standards.*