## ✅ QA Checklist

### Build Validation
- [ ] Build passes
- [ ] **Build passes**: `npm run build`
  - No build errors
  - All assets generated correctly
  - Bundle size acceptable
  - Production optimizations applied

- [ ] **Environment variables** configured correctly
- [ ] **Dependencies** properly installed and compatible
- [ ] **Static assets** accessible and optimized

### Code Quality
- [ ] Lint passes
- [ ] **Lint passes**: `npm run lint`
  - Zero warnings
  - Zero errors
  - Code style consistent with project standards
  - No unused imports or variables

- [ ] TypeScript passes
- [ ] **TypeScript compilation**: `npx tsc --noEmit`
  - No type errors
  - Strict mode compliance
  - Proper type annotations
  - No implicit any

### Testing
- [ ] Tests pass
- [ ] **All tests pass**: `npm test`
  - Unit tests: {{UNIT_TESTS_PASSED}}/{{UNIT_TESTS_TOTAL}}
  - Integration tests: {{INTEGRATION_TESTS_PASSED}}/{{INTEGRATION_TESTS_TOTAL}}
  - Component tests: {{COMPONENT_TESTS_PASSED}}/{{COMPONENT_TESTS_TOTAL}}

- [ ] **Test coverage** meets requirements
  - Overall coverage: {{COVERAGE_PERCENTAGE}}%
  - Critical paths covered
  - Edge cases tested
  - Error scenarios covered

- [ ] **Test reliability**
  - No flaky tests
  - Deterministic results
  - Proper test isolation
  - Clean test setup/teardown

### Database & API
- [ ] **Database operations** tested
  - Prisma queries work correctly
  - Migrations applied successfully
  - Data integrity maintained
  - Connection handling proper

- [ ] **API endpoints** functional
  - Request/response formats correct
  - Error handling implemented
  - Authentication/authorization working
  - Rate limiting appropriate

### Security
- [ ] **Input validation** implemented
  - Server-side validation complete
  - SQL injection protection active
  - XSS prevention measures
  - CSRF protection enabled

- [ ] **Authentication & Authorization**
  - LINE Login integration working
  - Session management secure
  - Role-based access control
  - Token handling secure

### Performance
- [ ] **Load times acceptable**
  - Initial load: {{INITIAL_LOAD_TIME}}ms
  - Route transitions: {{ROUTE_TRANSITION_TIME}}ms
  - API responses: {{API_RESPONSE_TIME}}ms

- [ ] **Memory usage** optimized
  - No memory leaks detected
  - Reasonable heap usage
  - Proper cleanup implemented
  - Bundle size optimized

### Mobile & Accessibility
- [ ] **Responsive design** verified
  - Mobile layouts correct
  - Touch interactions work
  - Viewport handling proper
  - Performance on mobile acceptable

- [ ] **Accessibility standards** met
  - Screen reader compatibility
  - Keyboard navigation works
  - ARIA labels appropriate
  - Color contrast compliant

### Documentation
- [ ] **Code documentation** complete
  - Complex functions documented
  - API endpoints documented
  - Database schema documented
  - Environment setup documented

- [ ] **User documentation** updated
  - Feature documentation current
  - Setup instructions accurate
  - Troubleshooting guide helpful
  - Examples provided

### Deployment Readiness
- [ ] **Environment configuration** verified
  - Production variables set
  - Secrets properly configured
  - Domain settings correct
  - SSL certificates valid

- [ ] **Monitoring setup** complete
  - Error tracking configured
  - Performance monitoring active
  - Log aggregation working
  - Health checks implemented

### 🎯 Final Approval
- [ ] **Feature requirements** fully implemented
- [ ] **Stakeholder review** completed
- [ ] **Risk assessment** acceptable
- [ ] **Rollback plan** documented
- [ ] **Deployment schedule** confirmed

### 📊 QA Metrics
- **Total test count**: {{TOTAL_TESTS}}
- **Test execution time**: {{TEST_EXECUTION_TIME}}ms
- **Code coverage**: {{CODE_COVERAGE}}%
- **Issues found**: {{ISSUES_FOUND}}
- **Issues resolved**: {{ISSUES_RESOLVED}}

### 🚨 Blockers
{{#if BLOCKERS}}
- {{BLOCKERS}}
{{else}}
- No blockers identified
{{/if}}

### ✅ Sign-off
- [ ] **Developer**: Reviewed and approved
- [ ] **QA Team**: Tested and verified
- [ ] **Tech Lead**: Architecture reviewed
- [ ] **Product Owner**: Requirements validated

---

*QA Checklist completed using Clurian Template System*
*ภาษาไทย support enabled*