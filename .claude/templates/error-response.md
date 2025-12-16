## ❌ Error Report

### Error Type: {{ERROR_TYPE}}
- **Severity**: {{SEVERITY_LEVEL}} (High/Medium/Low)
- **Category**: {{ERROR_CATEGORY}}
- **Timestamp**: {{ERROR_TIMESTAMP}}

### 📍 File Location
- **File**: `{{FILE_PATH}}:{{LINE_NUMBER}}`
- **Function**: {{FUNCTION_NAME}}
- **Component**: {{COMPONENT_NAME}}

### 🔍 Error Analysis
```bash
{{ERROR_COMMAND}}
```

**Error Message:**
```
{{ERROR_MESSAGE}}
```

### 🔧 Solution Applied
{{#if ROOT_CAUSE}}
#### Root Cause
{{ROOT_CAUSE}}
{{/if}}

#### Fix Implementation
{{SOLUTION_DESCRIPTION}}

**Files Modified:**
{{#if FILES_MODIFIED}}
- `{{FILES_MODIFIED}}`
{{/if}}

### ✅ Verification
- [ ] Build passes: `npm run build`
- [ ] Lint passes: `npm run lint`
- [ ] Tests pass: `npm test`
- [ ] TypeScript passes: `npx tsc --noEmit`
- [ ] Manual testing completed

### 🔄 Rollback Plan
{{#if ROLLBACK_AVAILABLE}}
**Rollback Commands:**
```bash
{{ROLLBACK_COMMANDS}}
```
{{/if}}

### 📊 Impact Assessment
- **Affected Features**: {{AFFECTED_FEATURES}}
- **User Impact**: {{USER_IMPACT}}
- **Data Impact**: {{DATA_IMPACT}}
- **Performance Impact**: {{PERFORMANCE_IMPACT}}

### 🚨 Prevention Measures
{{#if PREVENTION_STEPS}}
#### Steps to Prevent Recurrence
{{PREVENTION_STEPS}}
{{/if}}

{{#if MONITORING_NEEDED}}
#### Monitoring Required
- **Metrics to watch**: {{MONITORING_METRICS}}
- **Alert thresholds**: {{ALERT_THRESHOLDS}}
{{/if}}

### 📋 Additional Context
{{#if ADDITIONAL_CONTEXT}}
{{ADDITIONAL_CONTEXT}}
{{/if}}

### 🎯 Next Steps
1. **Immediate**: {{IMMEDIATE_NEXT_STEPS}}
2. **Short-term**: {{SHORT_TERM_ACTIONS}}
3. **Long-term**: {{LONG_TERM_IMPROVEMENTS}}

### 📚 Related Issues
{{#if RELATED_ISSUES}}
- Related issue: #{{RELATED_ISSUES}}
- Duplicate of: #{{DUPLICATE_ISSUES}}
{{/if}}

---

*Error report generated using Clurian Error Template*
*ภาษาไทย support enabled*