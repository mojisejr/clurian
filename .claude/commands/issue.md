# Issue Creation Command

## Usage
```
/issue [title] [description]
/issue
```

## Description
Creates GitHub issues with proper temporary file management using the project's .tmp folder exclusively.

## Implementation Workflow

### 🔍 Phase 1: Environment Setup (.tmp Folder Enforcement)

#### MANDATORY .tmp Folder Setup
```bash
# Step 1: Create .tmp folder if it doesn't exist
mkdir -p .tmp

# Step 2: Ensure .tmp/ is in .gitignore
if ! grep -q "^\.tmp/$" .gitignore 2>/dev/null; then
    echo ".tmp/" >> .gitignore
fi

# Step 3: Verify .tmp folder is ready
ls -la .tmp/
```

#### FORBIDDEN ACTIONS (NEVER ALLOWED)
- ❌ **NEVER use `/tmp/`** or any system temp directory
- ❌ **NEVER create temp files in project root**
- ❌ **NEVER use `$TEMP` or `$TMPDIR` environment variables**
- ❌ **NEVER leave temporary files after command completion**

### 📋 Phase 2: TDD Planning Strategy (Page-Based)

#### Determine Planning Approach
1. **Page-Based Features** - Use Page-based TDD Planning
   - New pages or major page updates (dashboard trees, batch, followups)
   - Complex UI components with user interactions (TreeCard, ActivityLog)
   - Features requiring routing or navigation

2. **Non-Page Features** - Skip Page-based TDD Planning
   - API endpoints only (activity logging, authentication)
   - Utility functions (domain mappers, validators)
   - Database schema changes (Prisma migrations)
   - Minor UI tweaks (status badges, filters)

#### Page-Based TDD Planning Workflow
```bash
# Create TDD plan file in .tmp folder
cat > .tmp/tdd-plan.md << 'EOF'
## Page-Based TDD Plan

### 1. User Stories & Acceptance Criteria
- **As a** farmer, **I want** to view tree health status **so that** I can identify sick trees quickly
- **Acceptance Criteria**:
  - Given I'm on the dashboard, when I view the trees tab, then I see tree health indicators
  - Given a tree is sick, when I view its card, then I see a red health indicator
  - Given I filter by sick trees, when I apply the filter, then only sick trees are shown

### 2. Page Structure & Components
```tsx
// Page route: app/dashboard/trees/page.tsx
export default function TreesPage() {
  return (
    <main>
      <TreeFilter />
      <TreeGrid />
      <Pagination />
    </main>
  )
}
```

### 3. Test Strategy (🔴🟢🔵 TDD Cycle)

#### 🔴 RED Phase - Failing Tests
- [ ] Component rendering tests
- [ ] User interaction tests (filter, pagination)
- [ ] API integration tests (tree data fetching)
- [ ] Accessibility tests (Thai language support)

#### 🟢 GREEN Phase - Minimal Implementation
- [ ] Create page structure
- [ ] Implement basic components
- [ ] Connect to Prisma via Server Actions
- [ ] Make tests pass

#### 🔵 REFACTOR Phase - Code Quality
- [ ] Extract reusable components (TreeCard, StatusBadge)
- [ ] Optimize performance (pagination, filtering)
- [ ] Improve code readability
- [ ] Ensure all tests pass

### 4. Page Components Breakdown
- **Main Component**: TreesPage
- **Sub Components**: TreeFilter, TreeGrid, TreeCard, Pagination
- **Custom Hooks**: useTreeFilter, useTreePagination
- **Server Actions**: getTrees, updateTreeStatus

### 5. File Structure
```
app/dashboard/trees/
├── page.tsx              # Main page component
├── loading.tsx           # Loading state
├── error.tsx             # Error boundary
├── components/           # Page-specific components
│   ├── TreeFilter.tsx
│   ├── TreeGrid.tsx
│   └── TreeCard.tsx
└── __tests__/            # Page-level tests
    └── page.test.tsx
```
EOF
```

### 🔍 Phase 3: Issue Content Creation

#### Issue Title and Description
1. **Parse Command Arguments**
   - Extract title from first argument or prompt user
   - Extract description from remaining arguments or prompt user

2. **Determine if Page-Based Feature**
   ```bash
   # Check if issue is page-related
   if [[ "$title" =~ (page|dashboard|component|UI|interface|view|screen|tab) ]] || [[ "$description" =~ (new page|add.*page|create.*page|page.*feature|dashboard.*tab) ]]; then
       USE_PAGE_TEMPLATE=true
   else
       USE_PAGE_TEMPLATE=false
   fi
   ```

3. **Create Issue Content File**
   ```bash
   # ALWAYS use .tmp folder
   if [ "$USE_PAGE_TEMPLATE" = true ]; then
       # Use Page-Based Feature Template
       cat > .tmp/issue-content.md << 'EOF'
   ## [Feature Name] Implementation

   ### 📋 User Story
   **As a** farmer/orchard manager, **I want** [feature] **so that** [benefit]

   ### 🎯 Acceptance Criteria
   - [ ] Given [context], when [action], then [expected outcome]
   - [ ] Given [context], when [action], then [expected outcome]
   - [ ] Given [context], when [action], then [expected outcome]

   ### 🏗️ Technical Implementation Plan

   #### Page Structure
   - **Route**: `app/[route]/page.tsx`
   - **Main Component**: [ComponentName]
   - **Key Features**:
     - [Feature 1 - e.g., Filter trees by health status]
     - [Feature 2 - e.g., Batch activity logging]
     - [Feature 3 - e.g., QR code generation]

   #### 🔴🟢🔵 TDD Implementation Strategy

   **Phase 1 - RED (Tests First)**
   - [ ] Create test file: `tests/[feature].test.ts`
   - [ ] Write failing tests for:
     - Page renders correctly with Thai language
     - User interactions work as expected
     - Prisma database operations (if applicable)
     - Error states and loading states

   **Phase 2 - GREEN (Minimal Implementation)**
   - [ ] Create page file: `app/[route]/page.tsx`
   - [ ] Implement minimal code to make tests pass
   - [ ] Add Server Actions for data operations
   - [ ] No additional features beyond test requirements

   **Phase 3 - REFACTOR (Code Quality)**
   - [ ] Extract reusable components
   - [ ] Implement proper TypeScript types using Prisma
   - [ ] Add accessibility features for Thai users
   - [ ] Optimize performance for mobile devices

   #### File Structure to Create
   ```
   app/[route]/
   ├── page.tsx              # Main page component
   ├── loading.tsx           # Loading skeleton
   ├── error.tsx             # Error boundary
   ├── components/           # Page-specific components
   │   ├── ComponentName.tsx
   │   └── __tests__/
   │       └── ComponentName.test.tsx
   └── __tests__/            # Page-level tests
       └── page.test.tsx
   ```

   #### Dependencies
   - **New npm packages**: [List if any]
   - **Server Actions needed**: [List if any]
   - **Database changes**: Prisma migration files
   - **LINE Login integration**: [If authentication needed]

   ### 🔗 Related Issues
   - [ ] #issue_number - [Related issue title]

   ### 📝 Notes
   - [Any additional notes about the implementation]
   - [Mobile-first design considerations]
   - [Thai language support requirements]

   ---

   ### Additional Information

   - **Command**: `/issue [arguments]`
   - **Created**: $(date)
   - **Branch**: $(git branch --show-current)
   - **Estimated Complexity**: [Low/Medium/High]
   - **Priority**: [High/Medium/Low]
   EOF
   else
       # Use Regular Issue Template
       cat > .tmp/issue-content.md << EOF
   ## $title

   **Description**: $description

   ### Steps to Reproduce (if applicable)
   1. [Step 1]
   2. [Step 2]
   3. [Step 3]

   ### Expected Behavior
   [What should happen]

   ### Actual Behavior
   [What actually happens (if bug)]

   ### Environment
   - **Branch**: $(git branch --show-current)
   - **Node.js**: $(node --version)
   - **OS**: $(uname -s)

   ---

   ### Additional Information

   - **Command**: `/issue [arguments]`
   - **Created**: $(date)
   - **Priority**: [High/Medium/Low]
   EOF
   fi
   ```

4. **Validate Content**
   - Ensure file is created in `.tmp/` folder ONLY
   - Verify content is not empty
   - Check for proper markdown formatting
   - Confirm TDD plan section is included for page-based features

### 🔍 Phase 4: GitHub Issue Creation

#### Create Issue Using GitHub CLI
```bash
# Use --body-file with .tmp folder
if [ "$USE_PAGE_TEMPLATE" = true ]; then
    # Add page-specific labels for page-based features
    gh issue create \
        --title "$title" \
        --body-file .tmp/issue-content.md \
        --label "enhancement" \
        --label "page-feature" \
        --label "tdd" \
        --label "orchard-management" \
        --assignee @me
else
    # Standard labels for non-page features
    gh issue create \
        --title "$title" \
        --body-file .tmp/issue-content.md \
        --label "enhancement" \
        --label "orchard-management" \
        --assignee @me
fi
```

#### Interactive Mode (if no arguments)
```bash
# Prompt for title and description
read -p "Issue title: " title
read -p "Issue description: " description

# Create temporary file with user input
cat > .tmp/issue-content.md << EOF
## $title

$description

---
### Additional Information

- **Command**: `/issue` (interactive mode)
- **Created**: $(date)
- **Branch**: $(git branch --show-current)
EOF

# Create issue with temporary file
gh issue create \
    --title "$title" \
    --body-file .tmp/issue-content.md \
    --label "enhancement" \
    --label "orchard-management" \
    --assignee @me
```

### 🔍 Phase 5: Cleanup (MANDATORY)

#### Temporary File Cleanup
```bash
# ALWAYS clean up .tmp folder after use
rm -f .tmp/issue-content.md
rm -f .tmp/tdd-plan.md

# Verify cleanup success
if [ -f .tmp/issue-content.md ] || [ -f .tmp/tdd-plan.md ]; then
    echo "❌ WARNING: Temporary file cleanup failed"
    echo "📁 Manual cleanup required:"
    echo "   rm .tmp/issue-content.md"
    echo "   rm .tmp/tdd-plan.md"
else
    echo "✅ Temporary file cleanup successful"
fi
```

## Command Execution Examples

### Example 1: Page-Based Feature
```bash
/issue "Add tree health monitoring dashboard" "Create a dashboard page to monitor tree health status with filters for sick trees"
```

**Execution Flow:**
1. Setup `.tmp/` folder
2. Detect page-related keywords ("dashboard", "page")
3. Use Page-Based Feature Template
4. Create `.tmp/issue-content.md` with TDD plan
5. Run `gh issue create --label page-feature --label tdd --body-file .tmp/issue-content.md`
6. Clean up `.tmp/issue-content.md`

### Example 2: Non-Page Feature
```bash
/issue "Add Prisma migration for tree health tracking" "Add healthCheckDate field to Tree model and create migration"
```

**Execution Flow:**
1. Setup `.tmp/` folder
2. No page-related keywords detected
3. Use Regular Issue Template
4. Create `.tmp/issue-content.md` with standard format
5. Run `gh issue create --body-file .tmp/issue-content.md`
6. Clean up `.tmp/issue-content.md`

### Example 3: Interactive Mode
```bash
/issue
```

**Execution Flow:**
1. Setup `.tmp/` folder
2. Prompt user for title and description
3. Analyze input for page-related keywords
4. Select appropriate template based on analysis
5. Create `.tmp/issue-content.md` with selected template
6. Run `gh issue create --body-file .tmp/issue-content.md`
7. Clean up `.tmp/issue-content.md`

### Example 4: Component Feature
```bash
/issue "Create batch activity logging form" "New form component for logging activities across multiple trees or zones"
```

**Execution Flow:**
1. Setup `.tmp/` folder
2. Detect component-related keywords ("component", "form")
3. Use Page-Based Feature Template
4. Create `.tmp/issue-content.md` with TDD plan and component structure
5. Run `gh issue create --label page-feature --label tdd --label component --body-file .tmp/issue-content.md`
6. Clean up `.tmp/issue-content.md`

## Error Handling

### .tmp Folder Errors
- If `.tmp/` cannot be created: **STOP EXECUTION**
- If `.tmp/` cannot be added to `.gitignore`: **STOP EXECUTION**
- If temporary file cannot be created: **STOP EXECUTION**

### GitHub CLI Errors
- If `gh` is not installed: Prompt user to install GitHub CLI
- If not authenticated: Run `gh auth login`
- If issue creation fails: Preserve `.tmp/issue-content.md` for debugging

### Cleanup Errors
- If cleanup fails: Display manual cleanup instructions
- Never leave temporary files without explicit warning

## Template Files

### Issue Content Template (Non-Page Features)
```markdown
## Issue Title

**Description**: [Detailed description of the issue]

### Steps to Reproduce (if bug)
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Environment
- **Branch**: $(git branch --show-current)
- **Node.js**: $(node --version)
- **OS**: $(uname -s)

---

### Additional Information

- **Command**: `/issue [arguments]`
- **Created**: $(date)
- **Priority**: [High/Medium/Low]
```

### Issue Content Template (Page-Based Features)
```markdown
## [Page Name] Feature Implementation

### 📋 User Story
**As a** farmer/orchard manager, **I want** [feature] **so that** [benefit]

### 🎯 Acceptance Criteria
- [ ] Given [context], when [action], then [expected outcome]
- [ ] Given [context], when [action], then [expected outcome]
- [ ] Given [context], when [action], then [expected outcome]

### 🏗️ Technical Implementation Plan

#### Page Structure
- **Route**: `app/[route]/page.tsx`
- **Main Component**: [ComponentName]
- **Key Features**:
  - [Feature 1]
  - [Feature 2]
  - [Feature 3]

#### 🔴🟢🔵 TDD Implementation Strategy

**Phase 1 - RED (Tests First)**
- [ ] Create test file: `tests/[feature].test.ts`
- [ ] Write failing tests for:
  - Page renders correctly
  - User interactions work as expected
  - API integration (if applicable)
  - Error states and loading states

**Phase 2 - GREEN (Minimal Implementation)**
- [ ] Create page file: `app/[route]/page.tsx`
- [ ] Implement minimal code to make tests pass
- [ ] No additional features beyond test requirements

**Phase 3 - REFACTOR (Code Quality)**
- [ ] Extract reusable components
- [ ] Implement proper TypeScript types
- [ ] Add accessibility features
- [ ] Optimize performance

#### File Structure to Create
```
app/[route]/
├── page.tsx              # Main page component
├── layout.tsx            # Page-specific layout (if needed)
├── loading.tsx           # Loading skeleton
├── error.tsx             # Error boundary
├── components/           # Page-specific components
│   ├── ComponentName.tsx
│   └── __tests__/
│       └── ComponentName.test.tsx
└── __tests__/            # Page-level tests
    └── page.test.tsx
```

#### Dependencies
- **New npm packages**: [List if any]
- **Server Actions needed**: [List if any]
- **Database changes**: [Prisma migration files]
- **LINE Login integration**: [If authentication needed]

### 🔗 Related Issues
- [ ] #issue_number - [Related issue title]

### 📝 Notes
- [Any additional notes about the implementation]
- [Mobile-first design considerations]
- [Thai language support requirements]

---

### Additional Information

- **Command**: `/issue [arguments]`
- **Created**: $(date)
- **Branch**: $(git branch --show-current)
- **Estimated Complexity**: [Low/Medium/High]
- **Priority**: [High/Medium/Low]
```

## Benefits of .tmp Folder Enforcement

### 🔒 Security
- No temporary files in system directories
- Project-scoped temporary file management
- Automatic .gitignore prevents accidental commits

### 🧹 Cleanliness
- Zero temporary file pollution
- Automatic cleanup after each operation
- Project folder remains organized

### 🔍 Debugging
- Temporary files are project-local for inspection
- Easy to debug failed operations
- Clear file naming convention

## Critical Rules (NEVER VIOLATE)

- **STRICT .tmp FOLDER USAGE**: ALWAYS use `.tmp/` folder for temporary files
- **NO SYSTEM TEMP**: NEVER use `/tmp/`, `$TEMP`, or other system temp directories
- **IMMEDIATE CLEANUP**: ALWAYS clean up temporary files after use
- **GITIGNORE PROTECTION**: ALWAYS ensure `.tmp/` is in `.gitignore`
- **VERIFICATION**: ALWAYS verify cleanup success before completion
- **ERROR HANDLING**: ALWAYS preserve temporary files for debugging if cleanup fails
- **ORCHARD CONTEXT**: Always consider orchard management domain when creating issues

## Success Criteria

- Issue created successfully with GitHub CLI
- Temporary files created ONLY in `.tmp/` folder
- Temporary files cleaned up successfully
- `.tmp/` folder added to `.gitignore` if not present
- User receives clear feedback on operation status
- Proper error handling with helpful messages
- Issues include relevant orchard management context