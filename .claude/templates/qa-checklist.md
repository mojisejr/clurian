## ✅ QA Checklist - {{TASK_TITLE}}

### 🔧 Basic Checks
- [ ] **Build**: `npm run build` ✅
- [ ] **Lint**: `npm run lint` ✅
- [ ] **Test**: `npm test` ✅
- [ ] **TypeScript**: `npx tsc --noEmit` ✅

### 📊 Test Results
- **Total**: {{TOTAL_TESTS}} tests
- **Coverage**: {{CODE_COVERAGE}}%
- **Time**: {{TEST_EXECUTION_TIME}}ms
- **Issues**: 0 blockers

### 🚀 พร้อม deploy หรือยัง
{{#if READY_TO_DEPLOY}}
✅ **พร้อม deploy** - ผ่านทุก check
{{else}}
❌ **ยังไม่พร้อม** - ต้องแก้:
- {{PENDING_ITEMS}}
{{/if}}

---
**QA complete!** ✨ สามารถ deploy ได้เลย