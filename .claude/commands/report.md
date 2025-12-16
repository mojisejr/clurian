# /report Command - View Final Report

## Description
ดูผลลัพธ์สุดท้ายจากการทำงานแบบ autonomous implementation พร้อม retrospective report

## Usage
```bash
/report
/report issue <number>      # Report for specific issue
/report retrospective       # Show full retrospective only
/report metrics            # Show quality metrics only
```

## What It Does

### When Used After /impl full
1. **Load final report** จาก GitHub issue
2. **Display summary** ของสิ่งที่ implement
3. **Show retrospective** แบบเต็ม
4. **Present options** สำหรับการตัดสินใจ:
   - `/approve-merge` - พร้อม merge
   - `/rollback` - ย้อนกลับ
   - `/fix-issue [description]` - แก้ไขปัญหา

### Report Sections
```markdown
🎉 **Autonomous Implementation Report**

## 📊 Summary
- Issue: #123 - Feature Name
- Total time: XX minutes
- Phases: 4/4 completed

## 📁 Deliverables
- Database schema updates ✅
- API endpoints ✅
- UI components ✅
- Tests (95% coverage) ✅

## 🎭 Retrospective Highlights
### What Went Well
- TDD flow worked smoothly
- Auto-fixed 15 minor issues
- Performance targets met

### Challenges
- Complex query optimization took extra time
- Had to refactor component structure

### Self-Reflection
- Strengths: Debugging efficiency
- To improve: Initial architecture planning

## 🧪 Quality Metrics
- Build: ✅ Passed in 12s
- Lint: ✅ 0 issues
- Types: ✅ 0 errors
- Tests: ✅ All passing
```

## Examples

### Basic Report
```bash
/report
```
Shows the most recent implementation report.

### Specific Issue Report
```bash
/report issue 123
```
Shows report for GitHub issue #123.

### Retrospective Only
```bash
/report retrospective
```
Shows only the retrospective section with learning insights.

## Integration
- Works with `/impl full` workflow
- Uses data from GitHub issues
- Reads from `.claude/templates/final-report.md`
- Provides actionable next steps

## Output Template
Uses: `.claude/templates/final-report.md`