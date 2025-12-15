# TDD Plan: แก้ไขปัญหา Tree History ไม่แสดงใน Deep Linking

## ปัญหา (Problem Statement)

**Core Issue**: TreeHistorySection ไม่แสดง activity logs เมื่อเข้า `/dashboard?treeId=xxx`

### Root Causes:
1. **Race Condition**: `currentOrchardId` อาจยังไม่พร้อมตอนเรียก `useOrchardActivityLogs`
2. **Missing Loading States**: ไม่แสดง loading → ดูเหมือนไม่มีข้อมูล
3. **Duplicate Queries**: TreeDetailView และ TreeHistorySection เรียก logs ซ้ำ
4. **Cache Invalidation**: ไม่มีการ refresh cache เมื่อ deep linking

### Success Criteria:
- ✅ Tree History แสดง loading state ระหว่างโหลด logs
- ✅ Tree History แสดง activity logs ที่เกี่ยวข้องกับต้นไม้ (Individual + Batch)
- ✅ Error handling สำหรับกรณีที่โหลด logs ไม่สำเร็จ
- ✅ Performance ดี (ไม่เรียก API ซ้ำซ้อน)
- ✅ Tests ครอบคลุมทุกกรณี

---

## Implementation Strategy: Option A (แนะนำ)

**แก้ TreeHistorySection โดยตรง - ไม่ rollback การแก้ไข deep linking ที่ผ่านมา**

### Phase 1: RED - Write Failing Tests

#### 1.1 Test Structure
```
tests/integration/dashboard/tree-history/
├── tree-history-deep-linking.test.tsx    # Main integration tests
├── tree-history-loading.test.tsx          # Loading state tests
└── tree-history-performance.test.tsx     # Performance/duplicate tests
```

#### 1.2 Core Test Cases

**File**: `tests/integration/dashboard/tree-history/tree-history-deep-linking.test.tsx`

```typescript
describe('TreeHistorySection Deep Linking', () => {
  // Test Case 1: Deep Linking ต้องแสดง loading state
  it('should show loading state when accessing tree via deep link', async () => {})

  // Test Case 2: Deep Linking ต้องแสดง individual logs ของต้นไม้
  it('should display individual logs for specific tree when accessed via deep link', async () => {})

  // Test Case 3: Deep Linking ต้องแสดง batch logs ที่เกี่ยวข้อง
  it('should display batch logs for tree zone when accessed via deep link', async () => {})

  // Test Case 4: Error handling สำหรับ failed log loading
  it('should show error when logs fail to load', async () => {})

  // Test Case 5: Cache invalidation เมื่อเปลี่ยน tree
  it('should refresh logs when switching between different trees', async () => {})

  // Test Case 6: Performance - ไม่มี duplicate API calls
  it('should not make duplicate API calls for logs', async () => {});
});
```

#### 1.3 Mock Data Structure
```typescript
const mockActivityLogs = [
  // Individual log สำหรับ tree-1
  {
    id: 'log-individual-1',
    orchardId: 'orchard-1',
    logType: 'INDIVIDUAL',
    treeId: 'tree-1',
    action: 'ให้น้ำ',
    note: 'ให้น้ำประจำสัปดาห์',
    performDate: '2024-01-15',
    status: 'COMPLETED',
    createdAt: '2024-01-15T00:00:00.000Z'
  },
  // Batch log สำหรับ zone A (tree-1 อยู่ใน zone A)
  {
    id: 'log-batch-1',
    orchardId: 'orchard-1',
    logType: 'BATCH',
    targetZone: 'A',
    action: 'พ่นยาฆ่าแมลง',
    note: 'พ่นทั้งแปลง A',
    performDate: '2024-01-14',
    status: 'COMPLETED',
    createdAt: '2024-01-14T00:00:00.000Z'
  }
];
```

### Phase 2: GREEN - Minimal Implementation

#### 2.1 TreeHistorySection Changes (Option A)
```typescript
// TreeHistorySection.tsx - Phase 2: GREEN
export function TreeHistorySection({ tree, onLogClick }: TreeHistorySectionProps) {
  const { currentOrchardId } = useOrchard();

  // ✅ เพิ่ม enabled condition และ loading states
  const { data: logsData, isLoading, error, refetch } = useOrchardActivityLogs(
    currentOrchardId,
    {
      page: 1,
      limit: 1000,
      enabled: !!currentOrchardId, // ✅ โหลดเฉพาะเมื่อมี orchardId
    }
  );

  // ✅ เพิ่ม useEffect สำหรับ deep linking
  useEffect(() => {
    if (currentOrchardId && tree.id) {
      refetch(); // ✅ บังคับ refresh เมื่อเข้า deep link
    }
  }, [currentOrchardId, tree.id, refetch]);

  const logs = useMemo(() => logsData?.logs || [], [logsData?.logs]);

  // ✅ เพิ่ม loading state UI
  if (isLoading && logs.length === 0) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 px-1">
          <ClipboardList size={20} className="text-primary" />
          <h3 className="font-bold text-lg">ประวัติการดูแล</h3>
        </div>

        {/* Loading state */}
        <div className="bg-card rounded-xl border p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-3"></div>
          <p className="text-muted-foreground">กำลังโหลดประวัติการดูแล...</p>
        </div>
      </div>
    );
  }

  // ✅ เพิ่ม error state
  if (error) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 px-1">
          <ClipboardList size={20} className="text-primary" />
          <h3 className="font-bold text-lg">ประวัติการดูแล</h3>
        </div>

        {/* Error state */}
        <div className="bg-card rounded-xl border p-8 text-center">
          <p className="text-red-500 mb-3">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
          <Button size="sm" onClick={() => refetch()}>
            ลองใหม่
          </Button>
        </div>
      </div>
    );
  }

  // ... rest of existing logic (keep the same filtering logic)
}
```

### Phase 3: REFACTOR - Create Custom Hook

#### 3.1 Create useTreeHistory Hook
**File**: `hooks/useTreeHistory.ts`

```typescript
interface UseTreeHistoryProps {
  treeId: string;
  orchardId: string;
  zone: string;
}

export function useTreeHistory({ treeId, orchardId, zone }: UseTreeHistoryProps) {
  const queryClient = useQueryClient();

  const { data: logsData, isLoading, error, refetch } = useOrchardActivityLogs(
    orchardId,
    {
      page: 1,
      limit: 1000,
      enabled: !!orchardId,
    }
  );

  // ✅ Auto refresh เมื่อ deep linking (smart cache check)
  useEffect(() => {
    if (orchardId && treeId) {
      // ตรวจสอบว่ามีข้อมูลใน cache หรือไม่
      const cachedData = queryClient.getQueryData(['orchard', orchardId, 'logs']);
      if (!cachedData) {
        refetch();
      }
    }
  }, [orchardId, treeId, refetch]);

  // ✅ Filter logic แยกออกมา
  const filteredLogs = useMemo(() => {
    if (!logsData?.logs) return [];

    return logsData.logs.filter(log =>
      (log.logType === 'INDIVIDUAL' && log.treeId === treeId) ||
      (log.logType === 'BATCH' && log.targetZone === zone)
    );
  }, [logsData?.logs, treeId, zone]);

  // ✅ Stats for performance monitoring
  const individualLogsCount = useMemo(() =>
    filteredLogs.filter(log => log.logType === 'INDIVIDUAL').length,
    [filteredLogs]
  );

  const batchLogsCount = useMemo(() =>
    filteredLogs.filter(log => log.logType === 'BATCH').length,
    [filteredLogs]
  );

  return {
    logs: filteredLogs,
    isLoading,
    error,
    refetch,
    stats: {
      total: filteredLogs.length,
      individual: individualLogsCount,
      batch: batchLogsCount,
    },
  };
}
```

#### 3.2 Refactor TreeHistorySection
```typescript
// ✅ ใช้ custom hook
export function TreeHistorySection({ tree, onLogClick }: TreeHistorySectionProps) {
  const { currentOrchardId } = useOrchard();

  const { logs, isLoading, error, refetch, stats } = useTreeHistory({
    treeId: tree.id,
    orchardId: currentOrchardId,
    zone: tree.zone,
  });

  // ... rest of component with improved loading/error states using stats
}
```

### Phase 4: Performance Optimization

#### 4.1 Cache Strategy Update
```typescript
// ✅ ใน lib/hooks/use-orchard-queries.ts
ACTIVITY_LOGS: {
  staleTime: 15 * 1000, // 15 seconds
  gcTime: 45 * 1000,    // 45 seconds
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  retry: 1,
  retryDelay: 1000,
  // ✅ เพิ่ม background refetch สำหรับ deep linking
  refetchOnMount: 'always',
}
```

#### 4.2 Query Deduplication
```typescript
// ✅ ใน useTreeHistory hook
export function useTreeHistory({ treeId, orchardId, zone }: UseTreeHistoryProps) {
  // ✅ ใช้ query key ที่ unique และ consistent
  const queryKey = useMemo(() =>
    ['orchard', orchardId, 'logs', { page: 1, limit: 1000 }],
    [orchardId]
  );
}
```

### Phase 5: Quality Assurance & Edge Cases

#### 5.1 Additional Test Cases
```typescript
describe('TreeHistorySection Edge Cases', () => {
  // Test Case 7: ต้นไม้ใหม่ที่ยังไม่มี logs
  it('should show empty state for new tree with no activities', async () => {})

  // Test Case 8: ต้นไม้ที่มี logs จำนวนมาก
  it('should handle tree with many activities efficiently', async () => {})

  // Test Case 9: การเปลี่ยน orchard ระหว่าง viewing tree
  it('should handle orchard switching while viewing tree', async () => {})

  // Test Case 10: Network error handling
  it('should handle network errors gracefully', async () => {})

  // Test Case 11: ต้นไม้ที่ถูก archive
  it('should show appropriate state for archived tree', async () => {})
});
```

#### 5.2 Performance Tests
```typescript
describe('TreeHistorySection Performance', () => {
  // Test Case 12: API call counting
  it('should make exactly one API call for logs', async () => {
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    render(<TreeHistorySection tree={mockTree} onLogClick={vi.fn()} />);
    await waitFor(() => screen.getByText(/ประวัติการดูแล/));

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  // Test Case 13: Cache hit performance
  it('should load instantly on second visit (cache hit)', async () => {
    // First visit
    render(<TreeHistorySection tree={mockTree} onLogClick={vi.fn()} />);
    await waitFor(() => screen.getByText(/ประวัติการดูแล/));

    // Second visit should be instant (cache)
    const startTime = performance.now();
    render(<TreeHistorySection tree={mockTree} onLogClick={vi.fn()} />);
    await waitFor(() => screen.getByText(/ประวัติการดูแล/));
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(100); // Should be < 100ms
  });
});
```

---

## Implementation Timeline

### Week 1: Foundation
- [x] Analysis & Planning (เสร็จแล้ว)
- [ ] เขียน failing tests (Phase 1) - 16 test cases
- [ ] Implement basic loading states (Phase 2)

### Week 2: Optimization
- [ ] Create `useTreeHistory` custom hook (Phase 3)
- [ ] Performance optimization (Phase 4)
- [ ] Cache strategy implementation

### Week 3: Quality & Testing
- [ ] Edge case tests (Phase 5)
- [ ] Performance tests
- [ ] Integration with existing deep linking

---

## Success Metrics

**Functional Requirements:**
- ✅ Tree History แสดงข้อมูล 100% เมื่อ deep linking
- ✅ Loading time < 2 วินาที
- ✅ Error rate < 1%
- ✅ Support both Individual และ Batch logs

**Technical Requirements:**
- ✅ Tests coverage > 90%
- ✅ No duplicate API calls
- ✅ Performance regression 0%
- ✅ Cache hit rate > 80%

**User Experience Requirements:**
- ✅ Clear loading states
- ✅ Helpful error messages
- ✅ Instant response on repeat visits
- ✅ Smooth animations/transitions

---

## Files to Modify/Create

### New Files:
- `hooks/useTreeHistory.ts` - Custom hook for tree history logic
- `tests/integration/dashboard/tree-history/tree-history-deep-linking.test.tsx`
- `tests/integration/dashboard/tree-history/tree-history-loading.test.tsx`
- `tests/integration/dashboard/tree-history/tree-history-performance.test.tsx`

### Modified Files:
- `components/dashboard/detail/tree-history-section.tsx` - Add loading/error states + use custom hook
- `lib/hooks/use-orchard-queries.ts` - Update cache config for ACTIVITY_LOGS

---

## Risk Assessment

### Low Risk:
- ✅ ไม่กระทบ deep linking ที่ทำไปแล้ว
- ✅ ไม่เปลี่ยน API structure
- ✅ Backward compatible

### Medium Risk:
- ⚠️ ต้องทดสอบ performance กับข้อมูลจริง
- ⚠️ ต้องจัดการ cache ให้เหมาะสม

### Mitigation:
- ✅ TDD approach ลดความเสี่ยง
- ✅ เพิ่ม performance tests
- ✅ มี rollback plan (revert TreeHistorySection changes)

---

## Conclusion

แผนนี้ใช้ TDD approach กับ Option A (แก้ TreeHistorySection โดยตรง) ซึ่ง:
- ✅ ไม่ต้อง rollback การแก้ไข deep linking ที่ผ่านมา
- ✅ เพิ่มเติม functionality ที่จำเป็นเท่านั้น
- ✅ ครอบคลุมทุกกรณีด้วย comprehensive tests
- ✅ มี metrics ที่ชัดเจนวัดผลความสำเร็จ

**Next Step**: เริ่ม Phase 1 - เขียน failing tests