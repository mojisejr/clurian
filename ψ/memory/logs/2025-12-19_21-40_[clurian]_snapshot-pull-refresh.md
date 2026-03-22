---
project: clurian
issue: #none
tags: []
date: 2025-12-19
agent: oracle-keeper
---

# Snapshot: Pull / Refresh — 2025-12-19 21:40

**Project:** oracle-framework (subproject: projects/clurian)
**Branch:** copiloting

---

## Purpose
บันทึกสถานะปัจจุบันของระบบรีเฟรช (pull-to-refresh และปุ่มรีเฟรช) และสรุป naming / context pattern ของ repo เพื่อใช้เป็นอ้างอิงก่อนเริ่ม refactor

## สรุป Pull / Refresh (สั้น)
- PullToRefresh component
  - ที่อยู่: projects/clurian/components/ui/pull-to-refresh.tsx
  - ลักษณะ: client component รับ props `onRefresh(): Promise<void>`, `disabled`, `threshold`, `className`, `children`.
  - พฤติกรรม: ตรวจจับทัช (touchstart/move/end) เมื่อเลื่อนลงจากบนสุด เก็บระยะการดึง (resistance) แสดง indicator และเรียก `onRefresh` เมื่อถึง threshold; แสดง spinner ขณะเรียกใช้งาน
  - การแสดงผล: แปลงตำแหน่งของเนื้อหา (`translateY`) เพื่อให้ UX ดึงลง

- Refresh buttons
  - ยูทิลิตี้: projects/clurian/components/ui/refresh-button.tsx (มี `onClick`, `label`, `loading` และแสดง spinner)
  - ในโค้ด หลายที่ใช้ `Button` + ไอคอน `RotateCw` โดยตรง (เช่น dashboard, batch-activities, scheduled-activities)

- การใช้งานหลัก (wraps pages)
  - Dashboard: projects/clurian/components/dashboard/views/dashboard-view.tsx
    - ใช้ `<PullToRefresh onRefresh={handleRefresh}>` และปุ่มรีเฟรชใน header
    - `handleRefresh` เรียก `invalidateSpecificTrees(currentOrchardId)`
  - Batch activities: projects/clurian/components/dashboard/views/batch-activities-view.tsx
    - ใช้ PullToRefresh; `handleRefresh` เรียก `invalidateSpecificActivityLogs(currentOrchardId)`
  - Scheduled activities: projects/clurian/components/dashboard/views/scheduled-activities-view.tsx
    - pattern เดียวกัน

- Cache / invalidation strategy
  - ไฟล์หลัก: projects/clurian/lib/hooks/use-orchard-queries.ts
  - มี `useSpecificCacheInvalidation()` ที่ให้ `invalidateSpecificTrees` / `invalidateSpecificActivityLogs` เพื่อ invalidate เฉพาะ query ที่ต้องการ (ไม่กระตุ้น `orchardData` refetch แบบเต็ม) — ลดการแสดง `OrchardSwitchingOverlay`

- Orchard switching overlay
  - Provider: projects/clurian/components/providers/orchard-provider.tsx
  - Overlay component: projects/clurian/components/ui/orchard-switching-overlay.tsx
  - เหตุผล: หลีกเลี่ยง full-orchard refetch ขณะรีเฟรชย่อยด้วยการใช้ invalidation เฉพาะจุด

---

## Naming / Context Patterns (repo conventions observed)
- ไฟล์และโฟลเดอร์
  - UI components: `components/ui/*` (ย่อยเป็น `pull-to-refresh.tsx`, `refresh-button.tsx`, `orchard-switching-overlay.tsx`, ฯลฯ)
  - Views: `components/dashboard/views/*` (แต่ละ view เป็นไฟล์แบบ kebab-case หรือ camelCase ตามตัวอย่าง)
  - Hooks: `lib/hooks/*` (เช่น `use-orchard-queries.ts`)
  - Providers: `components/providers/*` (เช่น `orchard-provider.tsx`)
  - ใช้ kebab-case สำหรับชื่อไฟล์ (ที่เห็นใน repo) เช่น `pull-to-refresh.tsx`, `batch-activities-view.tsx` เป็นต้น
  - Export ของ React components เป็น `PascalCase` (ฟังก์ชัน/คอมโพเนนต์ เช่น `PullToRefresh`, `RefreshButton`)

- React Query key pattern
  - มี `queryKeys` factory ใน `use-orchard-queries.ts` ใช้รูปแบบ array-based keys เช่น:
    - base: `['orchard']`
    - details/list: `['orchard','detail', <id>, 'data', <options>]`
    - trees/logs/dashboard มี segment ชัดเจน (`trees`, `logs`, `dashboard`)
  - ข้อดี: ใช้ predicate หรือ exact key matching เพื่อ invalidate แบบละเอียด

- การแบ่งชั้นโค้ด (context pattern)
  - `components/` สำหรับ UI ทั้งหมด (ย่อย `dashboard/`, `ui/`, `modals/`, `providers/`)
  - `lib/` สำหรับ logic, hooks, services, types
  - `app/` (Next.js app) เก็บ route pages และ actions

## Notes / Recommendations (สำหรับ refactor แบบเร็ว)
- เป้าหมายแรก: ทำให้ทุกที่ใช้ `RefreshButton` หรือ shared handler เพื่อให้ loading state และ aria-live เท่ากัน
- รักษา strategy ของ `useSpecificCacheInvalidation()` — อย่าเปลี่ยนเป็น `invalidateQueries` แบบกว้างเพราะจะ trigger overlay
- ระบุ list ของไฟล์ที่ต้องแก้: `dashboard-view.tsx`, `batch-activities-view.tsx`, `scheduled-activities-view.tsx` (เปลี่ยน inline Button -> `RefreshButton`) และตรวจสอบ `onRefresh` handlers ให้ return Promise และ expose loading state ถ้าจำเป็น

---

## Snapshot metadata
- Created: 2025-12-19 21:40 (เครื่องท้องถิ่น)
- CreatedBy: oracle-copilot (assistant)
- Source files inspected: pull-to-refresh.tsx, refresh-button.tsx, dashboard-view.tsx, batch-activities-view.tsx, scheduled-activities-view.tsx, use-orchard-queries.ts, orchard-provider.tsx

---

(ถ้าต้องการ ผมจะสร้าง PR ใน `projects/clurian` ที่แทนที่ปุ่มรีเฟรชที่ใช้ inline ไอคอนด้วย `RefreshButton` และทำให้ `PullToRefresh` ใช้ same handler/loading state — ยืนยันก่อนผมจะเริ่มทำได้เลย)
