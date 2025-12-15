# TDD Plan: Critical React Query Migration Issues

## 📋 Overview
สร้าง TDD plan สำหรับแก้ไขปัญหาทั้ง 3 ข้อจาก GitHub Issue #41 ด้วยวิธี Test-Driven Development

**Total Test Cases:** 42 tests
**Estimated Time:** 1 ชั่วโมง (implement + test)
**Success Criteria:** 100% test pass rate, build ผ่าน, ไม่มี regressions

---

## 🔴 Phase 1: Fix Tree History Empty List (15 test cases)

### **Problem:** Case mismatch ระหว่าง Database (UPPERCASE) และ Service Layer (lowercase)

### **RED Phase: Write Failing Tests**

#### Test File: `tests/fixes/tree-history-case-mismatch.test.tsx`

```typescript
describe('Phase 1: Tree History Case Mismatch Tests', () => {

  describe('1.1 Service Layer Data Transformation', () => {
    it('should preserve original enum case from database', async () => {
      // Test that activity-service.ts preserves UPPERCASE enums
    });

    it('should not convert logType to lowercase', async () => {
      // Test INDIVIDUAL, BATCH remain uppercase
    });

    it('should not convert status to lowercase', async () => {
      // Test COMPLETED, IN_PROGRESS remain uppercase
    });
  });

  describe('1.2 useTreeHistory Hook Filtering', () => {
    it('should filter INDIVIDUAL logs correctly', async () => {
      // Test UPPERCASE comparison works
    });

    it('should filter BATCH logs correctly', async () => {
      // Test UPPERCASE comparison works
    });

    it('should filter by zone correctly for BATCH logs', async () => {
      // Test zone matching with UPPERCASE logType
    });

    it('should handle COMPLETED status filtering', async () => {
      // Test status filtering works with UPPERCASE
    });

    it('should handle IN_PROGRESS status filtering', async () => {
      // Test status filtering works with UPPERCASE
    });
  });

  describe('1.3 TreeHistorySection Component', () => {
    it('should show individual logs in "ทั้งหมด" tab', async () => {
      // Test display of INDIVIDUAL logs
    });

    it('should show batch logs in "งานเหมา" tab', async () => {
      // Test display of BATCH logs
    });

    it('should show follow-up logs in "ติดตาม/นัดหมาย" tab', async () => {
      // Test display of IN_PROGRESS logs
    });

    it('should show badge for IN_PROGRESS logs', async () => {
      // Test red badge appears correctly
    });

    it('should show red indicator on follow-up tab when logs exist', async () => {
      // Test red dot indicator
    });

    it('should handle search functionality correctly', async () => {
      // Test search with UPPERCASE data
    });

    it('should handle sort functionality correctly', async () => {
      // Test sorting with UPPERCASE data
    });

    it('should not show empty state when logs exist', async () => {
      // Test no "ไม่พบประวัติการดูแล" when data exists
    });
  });
});
```

### **GREEN Phase: Implementation**

**Target Files:**
1. `/app/actions/orchards.ts` (บรรทัด 77, 83)
2. `/hooks/useTreeHistory.ts` (บรรทัด 54-58)
3. `/components/dashboard/detail/tree-history-section.tsx` (บรรทัด 44-48, 153, 200-204)

**Implementation Steps:**
```typescript
// Step 1: Fix service layer
// app/actions/orchards.ts
logType: log.logType as Log['logType']  // Remove .toLowerCase()
status: log.status as Log['status']    // Remove .toLowerCase()

// Step 2: Verify hook filtering works
// hooks/useTreeHistory.ts (should already work with UPPERCASE)

// Step 3: Verify component filtering works
// TreeHistorySection.tsx (should already work with UPPERCASE)
```

### **REFACTOR Phase: Optimization**
- Add type safety for enum comparisons
- Add unit tests for service layer transformation
- Add integration tests for end-to-end flow

---

## 🟡 Phase 2: Fix Refresh Button Behavior (12 test cases)

### **Problem:** Refresh buttons trigger orchard-wide cache invalidation

### **RED Phase: Write Failing Tests**

#### Test File: `tests/fixes/refresh-button-isolation.test.tsx`

```typescript
describe('Phase 2: Refresh Button Isolation Tests', () => {

  describe('2.1 Dashboard View Refresh', () => {
    it('should refresh trees without triggering orchard overlay', async () => {
      // Test that refresh only affects trees data
    });

    it('should not show OrchardSwitchingOverlay during refresh', async () => {
      // Test no overlay appears
    });

    it('should maintain current filter state during refresh', async () => {
      // Test filters persist after refresh
    });

    it('should not refetch orchard metadata during refresh', async () => {
      // Test only trees query refetches
    });
  });

  describe('2.2 Batch Activities Refresh', () => {
    it('should refresh batch activities without orchard overlay', async () => {
      // Test only batch logs refetch
    });

    it('should not affect trees data during batch refresh', async () => {
      // Test trees data remains unchanged
    });

    it('should not affect scheduled activities during batch refresh', async () => {
      // Test scheduled activities remain unchanged
    });

    it('should preserve batch filter during refresh', async () => {
      // Test zone filter persists
    });
  });

  describe('2.3 Scheduled Activities Refresh', () => {
    it('should refresh scheduled activities without orchard overlay', async () => {
      // Test only IN_PROGRESS logs refetch
    });

    it('should not affect trees during scheduled refresh', async () => {
      // Test trees data remains unchanged
    });

    it('should not affect batch activities during scheduled refresh', async () => {
      // Test batch activities remain unchanged
    });

    it('should preserve filter during refresh', async () => {
      // Test filter state persists
    });
  });
});
```

### **GREEN Phase: Implementation**

**Target Files:**
1. `/lib/hooks/use-orchard-queries.ts` (เพิ่ม `useSpecificCacheInvalidation`)
2. `/components/dashboard/views/dashboard-view.tsx` (บรรทัด 53-54)
3. `/components/dashboard/views/batch-activities-view.tsx` (บรรทัด 33-35)
4. `/components/dashboard/views/scheduled-activities-view.tsx` (บรรทัด 60-62)

**Implementation Steps:**
```typescript
// Step 1: Create specific cache invalidation
// lib/hooks/use-orchard-queries.ts
export function useSpecificCacheInvalidation() {
  return {
    invalidateSpecificActivityLogs: (orchardId, filters) => {
      // Only invalidate activity logs, not orchardData
    },
    invalidateSpecificTrees: (orchardId, filters) => {
      // Only invalidate trees, not orchardData
    }
  };
}

// Step 2: Update dashboard views
// Replace invalidateActivityLogs with invalidateSpecificActivityLogs
// Replace invalidateTrees with invalidateSpecificTrees
```

### **REFACTOR Phase: Optimization**
- Add performance monitoring for cache invalidation
- Add unit tests for cache invalidation logic
- Add integration tests for concurrent refreshes

---

## 🟠 Phase 3: Fix TreeId Parameter Persistence (15 test cases)

### **Problem:** TreeId persists when switching orchards

### **RED Phase: Write Failing Tests**

#### Test File: `tests/fixes/treeId-persistence-cleanup.test.tsx`

```typescript
describe('Phase 3: TreeId Parameter Cleanup Tests', () => {

  describe('3.1 Orchard Switching from Tree Detail', () => {
    it('should clear treeId when switching orchards from tree detail', async () => {
      // Test treeId removed from URL
    });

    it('should navigate to dashboard without treeId', async () => {
      // Test URL becomes /dashboard only
    });

    it('should not show tree not found error after orchard switch', async () => {
      // Test no error state
    });

    it('should load new orchard data correctly', async () => {
      // Test new orchard loads properly
    });

    it('should reset view state to dashboard', async () => {
      // Test view returns to dashboard
    });
  });

  describe('3.2 URL Parameter Management', () => {
    it('should preserve other URL params during orchard switch', async () => {
      // Test other params not affected
    });

    it('should handle empty searchParams gracefully', async () => {
      // Test no errors with clean URL
    });

    it('should work with multiple rapid orchard switches', async () => {
      // Test rapid switching
    });

    it('should maintain correct history navigation', async () => {
      // Test browser back/forward works
    });
  });

  describe('3.3 Navigation State Consistency', () => {
    it('should update useDashboardDeepLinking state correctly', async () => {
      // Test hook state updates
    });

    it('should clear selectedTreeId in context', async () => {
      // Test context state cleared
    });

    it('should reset loading states appropriately', async () => {
      // Test loading state management
    });

    it('should handle edge case of same orchard selection', async () => {
      // Test no unnecessary changes
    });

    it('should work with orchard switching overlay timing', async () => {
      // Test timing with loading states
    });
  });
});
```

### **GREEN Phase: Implementation**

**Target Files:**
1. `/components/providers/orchard-provider.tsx` (เพิ่ม URL cleanup effect)
2. `/components/nav-bar.tsx` (อาจจำเป็นต้องแก้ orchard switching logic)

**Implementation Steps:**
```typescript
// Step 1: Add URL cleanup to OrchardProvider
// components/providers/orchard-provider.tsx
useEffect(() => {
  // Clear treeId when orchard changes
  if (searchParams.has('treeId')) {
    router.replace('/dashboard', { scroll: false });
  }
}, [currentOrchardId]);

// Step 2: Test implementation
// Test all scenarios from RED phase
```

### **REFACTOR Phase: Optimization**
- Add debouncing for rapid orchard switches
- Add navigation state validation
- Add error handling for URL manipulation

---

## 🟢 Phase 4: Integration & Final QA (10 test cases)

### **RED Phase: Write Failing Integration Tests**

#### Test File: `tests/fixes/integration-final-qa.test.tsx`

```typescript
describe('Phase 4: Integration Final QA Tests', () => {

  describe('4.1 End-to-End User Workflows', () => {
    it('should complete tree viewing workflow: dashboard → tree detail → view history → back', async () => {
      // Test complete user journey
    });

    it('should complete refresh workflow: view data → refresh → see updates', async () => {
      // Test refresh effectiveness
    });

    it('should complete orchard switching workflow: tree detail → switch orchard → dashboard', async () => {
      // Test orchard switching without errors
    });
  });

  describe('4.2 Performance & Edge Cases', () => {
    it('should handle rapid tab switching without errors', async () => {
      // Test rapid interactions
    });

    it('should handle network failures gracefully', async () => {
      // Test error scenarios
    });

    it('should handle concurrent operations without race conditions', async () => {
      // Test concurrent state changes
    });
  });

  describe('4.3 Regression Tests', () => {
    it('should not break existing deep linking functionality', async () => {
      // Test deep linking still works
    });

    it('should not break existing orchard switching functionality', async () => {
      // Test orchard switching works
    });

    it('should not break existing filtering and searching', async () => {
      // Test all filters work
    });

    it('should not break existing navigation flow', async () => {
      // Test navigation works
    });
  });
});
```

### **GREEN Phase: Integration Implementation**
- Run all tests together
- Fix any integration issues
- Ensure no regressions

### **REFACTOR Phase: Final Optimization**
- Performance optimization
- Code quality improvements
- Documentation updates

---

## 📊 **Test Execution Plan**

### **Test Running Order:**
```bash
# Phase 1: Tree History (15 tests)
npm test tests/fixes/tree-history-case-mismatch.test.tsx

# Phase 2: Refresh Button (12 tests)
npm test tests/fixes/refresh-button-isolation.test.tsx

# Phase 3: TreeId Persistence (15 tests)
npm test tests/fixes/treeId-persistence-cleanup.test.tsx

# Phase 4: Integration QA (10 tests)
npm test tests/fixes/integration-final-qa.test.tsx

# All Tests Together (52 tests total)
npm test tests/fixes/
```

### **Success Criteria:**
- ✅ All 52 tests pass (100% pass rate)
- ✅ `npm run build` passes without errors
- ✅ `npm run lint` passes without warnings
- ✅ Manual testing confirms all scenarios work
- ✅ No performance regression
- ✅ No regressions in existing features

### **Timeline:**
- **Phase 1:** 20-25 นาที (implement + test)
- **Phase 2:** 25-30 นาที (implement + test)
- **Phase 3:** 20-25 นาที (implement + test)
- **Phase 4:** 15-20 นาที (integration + QA)
- **Total:** 80-100 นาที (ประมาณ 1.5 ชั่วโมง)

---

## 🎯 **Acceptance Criteria**

### **Phase 1 Acceptance:**
- [ ] Tree History แสดงข้อมูลทุกแท็บ (ทั้งหมด, งานเหมา, ติดตาม/นัดหมาย)
- [ ] Individual logs แสดงถูกต้อง
- [ ] Batch logs แสดงถูกต้อง (zone matching)
- [ ] Follow-up indicator แสดงถูกต้อง
- [ ] Search และ sort ทำงานถูกต้อง

### **Phase 2 Acceptance:**
- [ ] Refresh แต่ละแท็บไม่แสดง OrchardSwitchingOverlay
- [ ] Refresh ทำงานเฉพาะที่เกี่ยวข้องกับแท็บนั้น
- [ ] ไม่มีการ refetch ข้อมูลที่ไม่เกี่ยวข้อง
- [ ] Loading state แสดงถูกต้องระหว่าง refresh

### **Phase 3 Acceptance:**
- [ ] สลับ orchard ไม่ทำให้เกิด "Tree Not Found"
- [ ] URL treeId ถูกลบออกเมื่อสลับ orchard
- [ ] Navigation กลับไป dashboard ถูกต้อง
- [ ] State ถูก reset อย่างปลอดภัย

### **Phase 4 Acceptance:**
- [ ] ทุก workflow ทำงาน end-to-end
- [ ] ไม่มี regressions ในฟีเจอร์เดิม
- [ ] Performance ไม่ลดลง
- [ ] Error handling ทำงานถูกต้อง

---

**พร้อมเริ่ม TDD Phase 1.A หรือไม่ครับ?** 🚀