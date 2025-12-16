# /rollback Command - Safe Rollback

## Description
ย้อนกลับการเปลี่ยนแปลงจาก issue ที่ระบุ หรือ commit ล่าสุด อย่างปลอดภัย

## Usage
```bash
/rollback                          # Rollback last commit
/rollback issue <number>           # Rollback all changes from specific issue
/rollback commit <hash>            # Rollback to specific commit
/rollback dry-run                  # Show what would be rolled back (no changes)
```

## What It Does

### Safety Checks Before Rollback
1. **Check branch** - ไม่ rollback บน main branch
2. **Backup current state** - Create backup branch automatically
3. **Verify no uncommitted changes** - Warn if changes will be lost
4. **Confirm operation** - Ask for confirmation before executing

### Rollback Process
```bash
# 1. Create backup branch
git checkout -b backup/rollback-$(date +%Y%m%d-%H%M%S)

# 2. Store rollback info
echo "Rollback: $(git rev-parse HEAD)" > .tmp/rollback-info.log

# 3. Execute rollback
git reset --hard HEAD~1  # For last commit
# OR
git revert <commit-hash> # For safe revert with new commit

# 4. Clean temporary files
rm -rf .tmp/impl-*
```

### Rollback Scenarios

#### Scenario 1: Last Implementation
```bash
/rollback
```
- Rolls back last commit from `/impl` workflow
- Preserves git history with revert commit
- Clean temporary files

#### Scenario 2: Full Issue Rollback
```bash
/rollback issue 123
```
- Finds all commits related to issue #123
- Creates revert commit for each
- Preserves issue history in GitHub

#### Scenario 3: Emergency Rollback
```bash
/rollback commit abc123
```
- Fast rollback to specific commit
- Use for broken deployments
- **WARNING**: Destructive operation

## Safety Features

### Dry Run Mode
```bash
/rollback dry-run
```
Shows what will be rolled back without making changes:
```
🔍 **Dry Run Mode - No changes will be made**

Will rollback:
- 1 commit: abc123 (feat: add qr generator)
- 12 files changed
- 245 lines added, 89 removed

Backup branch will be created: backup/rollback-20231216-143022

Proceed with actual rollback? (y/N)
```

### Confirmation Prompt
```bash
⚠️  **WARNING**: This will permanently revert changes!

Rolling back:
- Issue #123: QR Code Generator
- 1 commit (abc123)
- Files: 12 modified

Backup branch: backup/rollback-20231216-143022

Type 'rollback' to confirm:
```

### Branch Protection
```bash
❌ **ERROR**: Cannot rollback on main branch!

Switch to staging branch first:
git checkout staging

Then run rollback again.
```

## Examples

### Basic Rollback
```bash
/rollback
```
Output:
```
🔄 **Rolling back last commit**

Backup branch created: backup/rollback-20231216-143022
Reverted: abc123 (feat: add qr generator)

✅ Rollback complete!
Status: Clean
Staged files: None
```

### Issue Rollback
```bash
/rollback issue 123
```
Output:
```
🔄 **Rolling back issue #123**

Found 3 commits to revert:
- abc123 (feat: add qr generator)
- def456 (refactor: optimize qr service)
- ghi789 (fix: resolve qr encoding issue)

Reverting commits...
✅ Revert commit ghi789
✅ Revert commit def456
✅ Revert commit abc123

✅ Issue #123 rollback complete!
```

## Error Recovery

### If Rollback Fails
1. **Check git status** for conflicts
2. **Resolve conflicts** manually
3. **Continue rollback** with `git revert --continue`

### If Branch is Dirty
```bash
⚠️  **WARNING**: You have uncommitted changes!

These changes will be lost:
- app/api/qr/route.ts (modified)
- tests/qr.test.ts (new)

Options:
1. Commit changes first: git add . && git commit -m "WIP"
2. Stash changes: git stash
3. Discard changes: git reset --hard HEAD

Choose option [1/2/3]:
```

## Integration with Workflow

### After /impl full
If implementation has issues:
1. Check `/report` for details
2. Run `/rollback` to revert
3. Fix issues manually
4. Run `/impl` again

### Before Merge
Always run checks before rollback:
- Check current branch
- Verify no one else has pushed
- Create backup branch

## Safety Rules
- **NEVER rollback on main branch**
- **ALWAYS create backup branch**
- **ALWAYS confirm before destructive operations**
- **NEVER rollback if someone else has pushed**
- **ALWAYS document rollback reason**

## Output Template
Uses: `.claude/templates/rollback-report.md` (auto-generated)