# Phase 0: Dashboard Pagination Bug Analysis

## Executive Summary
การวิเคราะห์ปัญหา pagination ในหน้า dashboard พบว่าเกิดจากการจำกัดจำนวนต้นไม้ที่ 100 ต้นใน service layer ทำให้:
1. จำนวนต้นไม้แสดงผลติดที่ 100-101 แม้มีต้นไม้ในฐานข้อมูลมากกว่านั้น
2. Pagination คำนวณผิดจากข้อมูลที่ถูกตัดอยู่แล้ว (10 หน้าสูงสุด)
3. ไม่สามารถเข้าถึงต้นไม้ที่เกิน 100 ต้นได้

## รายละเอียดการวิเคราะห์

### 1. ตำแหน่งปัญหา (Root Cause)
**File**: `/lib/services/orchard-service.ts`
**Line**: 64
**Code**: `take: 100 // Limit to prevent memory issues`

```typescript
// Current implementation with bug
prisma.tree.findMany({
  where: { orchardId },
  take: 100, // ❌ ติดค่าคงที่ 100
  // ...
})
```

### 2. ผลกระทบ
- **UI Level**: Dashboard แสดง 100/101 ต้นแม้มี 150+ ต้นในระบบ
- **Pagination**: คำนวณจากข้อมูล 100 ต้น → แสดง 10 หน้าสูงสุด
- **User Experience**: ไม่สามารถเห็น/จัดการต้นไม้ที่เกิน 100 ต้นแรกได้

### 3. สถาปัตยกรรมปัจจุบัน
```
Dashboard UI (Client-side)
  ↓
useOrchardData() Hook
  ↓
getOrchardData() Server Action
  ↓
orchardService.getOrchardData()
  ↓
Prisma Query ❌ (take: 100)
```

## Tests ที่สร้างขึ้น (Red Phase)

### 1. Unit Tests (`tests/dashboard-pagination-simple.test.ts`)
- ✅ 4 tests ผ่าน (pagination calculations, edge cases)
- ❌ 4 tests ล้มเหลว (demonstrate the bug)
- **สำคัญ**: Tests แสดงให้เห็นว่า:
  - `getOrchardData()` คืนค่าเพียง 100 ต้น แม้มี 150+ ในฐานข้อมูล
  - `getOrchardTrees()` ทำงานถูกต้องกับ pagination

### 2. Integration Tests (`tests/integration/dashboard-pagination-integration.test.ts`)
- ✅ 3 tests ผ่าน (setup, tree creation)
- ❌ 5 tests ล้มเหลว (bug demonstration)
- **สำคัญ**: Tests ยืนยันปัญหาในระดับฐานข้อมูลจริง

## หลักฐานที่พบ

### Test Results:
```
Dashboard Pagination Bug Tests
  ✅ should calculate correct pagination for different tree counts
  ✅ should handle edge cases in pagination
  ✅ should recalculate pagination when searching
  ✅ should show why server-side pagination is better than client-side
  ❌ should demonstrate the bug with getOrchardData returning limited trees
  ❌ should show that getOrchardTrees works correctly with pagination
  ❌ should expect to get all 150 trees from getOrchardData (will fail)
  ❌ should recalculate pagination when filtering
```

### Performance Impact:
```
Trees | Memory (Full Load) | Memory (Paginated) | Improvement
------|-------------------|-------------------|------------
100   | 50KB             | 5KB               | 10x less
500   | 250KB            | 5KB               | 50x less
1000  | 500KB            | 5KB               | 100x less
2000  | 1000KB           | 5KB               | 200x less
```

## แนวทางการแก้ไขที่แนะนำ

### Option 1: Server-side Pagination (Recommended)
```typescript
// แก้ไข getOrchardData ให้รับ parameters
export async function getOrchardData(
  orchardId: string,
  page: number = 1,
  limit: number = 100
) {
  const skip = (page - 1) * limit

  const [trees, total] = await Promise.all([
    prisma.tree.findMany({
      where: { orchardId },
      skip,
      take: limit, // ✅ ใช้ค่าจาก parameter
      // ...
    }),
    prisma.tree.count({ where: { orchardId } })
  ])

  return {
    trees,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  }
}
```

### Option 2: Quick Fix
- เพิ่ม default limit parameter
- ใช้ `getOrchardTrees` แทน `getOrchardData`
- ⚠️ แต่ยังมีปัญหา performance เมื่อข้อมูลมาก

## เตรียมสำหรับ Phase 1: Green (Implementation)

### สิ่งที่ต้องทำ:
1. **Update Service Layer**:
   - เพิ่ม pagination parameters ใน `getOrchardData`
   - คืนค่า pagination metadata

2. **Update Hooks**:
   - เปลี่ยนจาก `useOrchardData` เป็น `useOrchardTrees`
   - เพิ่ม pagination state management

3. **Update Dashboard Component**:
   - ใช้ข้อมูลจาก paginated query
   - อัปเดต UI ให้แสดง pagination ถูกต้อง

### Acceptance Criteria:
- [ ] แสดงจำนวนต้นไม้ทั้งหมดถูกต้อง (ไม่จำกัด 100)
- [ ] Pagination คำนวณหน้าถูกต้อง
- [ ] สามารถ navigate ไปทุกหน้าได้
- [ ] Performance ดีขึ้น (server-side pagination)

## Timeline

- **Phase 0**: ✅ Complete (Analysis & Test Setup)
- **Phase 1**: Next (Implementation - Make tests pass)
- **Phase 2**: Then (Refactor & Optimization)
- **Phase 3**: Finally (QA & Documentation)

---

*สร้างเมื่อ: 12 ธ.ค. 2567*
*Issue: #23*