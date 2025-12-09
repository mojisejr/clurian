# /commit Command - Simple Comprehensive Git Commit

## Description
Creates comprehensive commit messages with detailed change tracking for easy rollback and progress monitoring.

## Usage
```bash
/commit [optional-custom-message]
```

## Command Execution Flow

### Phase 1: Analysis
1. **Check Branch Safety**
   - Verify NOT on main branch
   - Confirm on staging or feature branch

2. **Analyze Changes**
   ```bash
   # Get git status
   git status --porcelain

   # Show diff summary
   git diff --stat --cached
   git diff --stat
   ```

3. **Quality Checks**
   ```bash
   npm run build && npm run lint && npm test && npx tsc --noEmit
   ```

### Phase 2: Generate Commit Message

1. **Categorize Changes**
   - 🎨 **UI**: Components, styles, layouts
   - 🔧 **API**: Routes, server actions, database
   - ⚙️ **Config**: Dependencies, config files
   - 📚 **Docs**: README, documentation
   - 🌳 **Domain**: Orchard, tree, activity log features

2. **Create Comprehensive Message**
   ```bash
   # Example commit message structure:
   #
   # feat(orchard): add tree health monitoring dashboard
   #
   # 📁 Changed Files:
   # - app/dashboard/trees/page.tsx: Add health status filters
   # - components/dashboard/TreeHealthCard.tsx: New component for health display
   # - lib/domain/tree-mappers.ts: Add health status mapping logic
   # - prisma/schema.prisma: Add healthCheckDate field to Tree model
   #
   # 🔄 Rollback: git reset --hard HEAD~1
   #
   # 🧪 Tests: Build ✅ Lint ✅ Types ✅ Tests ✅
   #
   # Co-Authored-By: Claude <noreply@anthropic.com>
   ```

### Phase 3: Execute Commit
```bash
git add .
git commit -m "$GENERATED_MESSAGE"
```

## Commit Message Template

The commit message includes:
1. **Conventional Type**: feat/fix/refactor/docs/etc
2. **Scope**: ui/api/domain/config/docs
3. **Brief Description**: What changed
4. **File List**: All modified files with descriptions
5. **Rollback Command**: Easy rollback instruction
6. **Quality Status**: Build/lint/type/test check results

## Usage Examples

### Auto-Generated Message
```bash
/commit
```

### With Custom Message
```bash
/commit "fix(api): resolve activity log creation error"
```

## Sample Output

```
🔍 Analyzing changes...
📊 4 files changed (🌳 Domain: 2, 🎨 UI: 1, 📚 Docs: 1)
✅ Quality checks passed

📝 Generated commit message:
feat(orchard): add batch activity logging with zone targeting

📁 Changed Files:
- app/dashboard/batch/page.tsx: Add batch activity form
- components/forms/BatchActivityForm.tsx: New form component
- app/actions/createBatchLog.ts: Server action for batch logs
- README.md: Update feature documentation

🔄 Rollback: git reset --hard HEAD~1
🧪 Tests: Build ✅ Lint ✅ Types ✅ Tests ✅

Commit this message? (Y/n)
```

## Benefits

- **Easy Tracking**: Detailed file changes in commit message
- **Simple Rollback**: Clear rollback command included
- **Progress Monitoring**: Quality status visible in git log
- **Searchable**: Easy to find specific changes
- **No Extra Files**: No scripts or temporary files needed
- **Domain Context**: Orchard management specific categorization

---

_Simplified commit command focusing on comprehensive messages for tracking and rollback._