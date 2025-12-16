## ❌ Error: {{ERROR_TYPE}}

### 📍 เกิดอะไรขึ้น
- **ไฟล์**: `{{FILE_PATH}}:{{LINE_NUMBER}}`
- **Function**: {{FUNCTION_NAME}}
- **Severity**: {{SEVERITY_LEVEL}} (สูง/กลาง/ต่ำ)

### 🔍 ข้อความ error
```bash
{{ERROR_COMMAND}}
```

```
{{ERROR_MESSAGE}}
```

### 💥 กระทบอะไรบ้าง
- **Feature**: {{AFFECTED_FEATURES}}
- **User**: {{USER_IMPACT}}
- **Data**: {{DATA_IMPACT}}

### 🔧 แก้ยังไง
**Root cause**: {{ROOT_CAUSE}}

**Solution**: {{SOLUTION_DESCRIPTION}}

**Files ที่ต้องแก้**:
{{#if FILES_MODIFIED}}
{{#each FILES_MODIFIED}}
- `{{this}}`
{{/each}}
{{/if}}

### ✅ Check แล้ว
- [x] Build: `npm run build`
- [x] Lint: `npm run lint`
- [x] Test: `npm test`
- [x] TypeScript: `npx tsc --noEmit`

{{#if ROLLBACK_AVAILABLE}}
### 🔙 ถ้าแก้ไม่ได้
```bash
{{ROLLBACK_COMMANDS}}
```
{{/if}}

### 🛡️ ป้องกันให้ไม่เกิดอีก
{{#if PREVENTION_STEPS}}
- {{PREVENTION_STEPS}}
{{/if}}

### 📝 ข้อสังเกต
{{#if ADDITIONAL_CONTEXT}}
{{ADDITIONAL_CONTEXT}}
{{/if}}

### 🎯 ต่อไปทำอะไร
1. **ทันที**: {{IMMEDIATE_NEXT_STEPS}}
2. **ถ้ามีเวลา**: {{SHORT_TERM_ACTIONS}}

---
**Fixed!** ✅ พร้อมใช้งานแล้ว