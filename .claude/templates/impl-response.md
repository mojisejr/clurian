## ✅ {{TASK_TITLE}} - เสร็จแล้ว

### 📊 สรุปเลย
- **สิ่งที่ทำ**: {{SUMMARY_OF_CHANGES}}
- **เวลาที่ใช้**: {{DURATION}}
- **Branch**: `{{BRANCH_NAME}}`
- **สถานะ**: ✅ ผ่าน QA ทุกขั้นตอน

### 🔍 ทำอะไรบ้าง
{{#if TEST_FILES_CREATED}}
**Tests ก่อน (Red Phase)**:
- เขียนไป: {{TEST_FILES_CREATED}} ไฟล์
- Cover: {{TEST_COVERAGE}}%
{{/if}}

**Implementation (Green Phase)**:
- Files: {{FILES_MODIFIED}}
- LOC: {{LOC_COUNT}}
- สิ่งสำคัญที่ implement:
{{#each KEY_COMPONENTS}}
  - {{this}}
{{/each}}

{{#if REFACTOR_DONE}}
**Refactor (Blue Phase)**:
- Optimize: {{OPTIMIZATIONS_COUNT}}
- Performance up: {{PERFORMANCE_GAIN}}
{{/if}}

### ✅ QA Results
| Check | Status | Details |
|-------|--------|---------|
| Build | ✅ PASS | - |
| Lint | ✅ PASS | {{LINT_ERRORS}} errors |
| Test | ✅ PASS | {{TEST_PASSED}}/{{TEST_TOTAL}} |
| TypeScript | ✅ PASS | - |

### 💥 Breaking Changes?
{{#if HAS_BREAKING_CHANGES}}
**มี breaking changes**:
{{#each BREAKING_CHANGES}}
- {{this}}
{{/each}}
**ต้อง migrate**: {{MIGRATION_NOTE}}
{{else}}
❌ ไม่มี breaking changes
{{/if}}

### 📁 Files ที่เปลี่ยน
<details>
<summary>Click to expand</summary>

{{FILES_MODIFIED_LIST}}
</details>

### 🎯 ต่อไปทำอะไร
1. {{NEXT_STEP_1}}
2. {{NEXT_STEP_2}}
{{#if PR_URL}}
3. Review PR: {{PR_URL}}
{{/if}}

### 🤔 ที่น่าสังเกต
- {{NOTE_1}}
- {{#if NOTE_2}}- {{NOTE_2}}{{/if}}

---
**All done!** ✨ พร้อมใช้งานแล้ว