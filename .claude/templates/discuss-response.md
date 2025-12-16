## {{TOPIC}}

### 🗂️ ไปดูที่ไหนมา
- **Files**:
{{#if FILES_CHECKED}}
{{#each FILES_CHECKED}}
  - `{{this}}`
{{/each}}
{{else}}
  - `{{COMPONENT_NAME}}` และ related files
{{/if}}
- **Focus**: {{FOCUS_AREA}}
- **เวลา**: {{ANALYSIS_TIME}}

### 🧠 ได้เรื่องว่า...
{{#if MATCHES_QUESTION}}
✅ **ตรงตามที่ถามมา**: {{MATCH_DESCRIPTION}}
{{else}}
⚠️ **ไม่ตรง**: ตั้งใจไปดู {{ORIGINAL_INTENT}} แต่เจอ {{ACTUAL_FINDING}}
{{/if}}

**ปัญหาที่เจอ**:
- {{PROBLEM_1}}
- {{#if PROBLEM_2}}- {{PROBLEM_2}}{{/if}}
- {{#if PROBLEM_3}}- {{PROBLEM_3}}{{/if}}

**Root cause**: {{ROOT_CAUSE}}

{{#if ARCHITECTURE_ANALYSIS}}
#### Architecture Analysis
{{ARCHITECTURE_ANALYSIS}}
{{/if}}

{{#if CODE_PATTERN_ANALYSIS}}
#### Code Pattern Review
{{CODE_PATTERN_ANALYSIS}}
{{/if}}

{{#if PERFORMANCE_ANALYSIS}}
#### Performance Issues
{{PERFORMANCE_ANALYSIS}}
{{/if}}

### 🔧 จะแก้ยังไง
{{#if REQUIRES_TDD}}
**ต้องใช้ TDD เพราะ**:
- {{REASON_1}}
- {{#if REASON_2}}- {{REASON_2}}{{/if}}

**Step TDD**:
1. **Red**: เขียน test ก่อนที่ {{TEST_TYPE}}
2. **Green**: implement {{IMPLEMENTATION_FOCUS}}
3. **Refactor**: ทำให้ {{REFACTOR_TARGET}}

{{else}}
**แก้ได้เลย** - ไม่ต้อง TDD
{{/if}}

**Step การแก้**:
1. {{STEP_1}} - *ทำไม*: {{REASON_STEP_1}}
{{#if STEP_2}}2. {{STEP_2}} - *ทำไม*: {{REASON_STEP_2}}{{/if}}
{{#if STEP_3}}3. {{STEP_3}} - *ทำไม*: {{REASON_STEP_3}}{{/if}}

**ทำไมต้องทำงั้น**: {{APPROACH_REASON}}

### 💥 Breaking Changes

| ส่วนที่กระทบ | รายละเอียด | ความเสี่ยง |
|----------------|------------|------------|
{{#if IMPACT_1_AREA}}| {{IMPACT_1_AREA}} | {{IMPACT_1_DETAIL}} | {{IMPACT_1_RISK}} |{{/if}}
{{#if IMPACT_2_AREA}}| {{IMPACT_2_AREA}} | {{IMPACT_2_DETAIL}} | {{IMPACT_2_RISK}} |{{/if}}
{{#if IMPACT_3_AREA}}| {{IMPACT_3_AREA}} | {{IMPACT_3_DETAIL}} | {{IMPACT_3_RISK}} |{{/if}}

{{#if MIGRATION_STEPS}}
**Migration**: {{MIGRATION_STEPS}}
{{/if}}

### 🤔 ที่ยังไม่ได้คิด/ไม่แน่ใจ
{{#if UNCERTAINTY_1}}
- {{UNCERTAINTY_1}}
{{/if}}
{{#if UNCERTAINTY_2}}
- {{UNCERTAINTY_2}}
{{/if}}

**ข้อสังเกต**: {{ADDITIONAL_NOTES}}

{{#if OPTIONS_AVAILABLE}}
### 📊 Options Comparison
| Option | Pros | Cons | Effort | Impact |
|--------|------|------|--------|--------|
{{OPTIONS_TABLE}}
{{/if}}

---
**Verdict**: {{FINAL_VERDICT}}

{{#if CLARIFICATION_QUESTIONS}}
### ถ้าจะให้ชัดเจนขึ้น:
{{#each CLARIFICATION_QUESTIONS}}
- {{this}}
{{/each}}
{{/if}}

**พร้อม implement?** ใช้ `/impl [task description]` เลย