---
type: snapshot
project: clurian
task_id: "#hq-spaces-integration"
status: active
tags: [snapshot, migration, clurian, site-memory]
related_files:
  - /Users/non/dev/opilot/projects/clurian/ψ/memory/logs/2025-12-19_21-40_[clurian]_snapshot-pull-refresh.md
  - /Users/non/dev/opilot/projects/clurian/ψ/memory/logs/2025-12-19_22-10_[clurian]_refactor-refresh-initiation.md
  - /Users/non/dev/opilot/projects/clurian/ψ/memory/retrospectives/2025-12/19/23.25_[clurian]_refresh-refactor.md
  - /Users/non/dev/opilot/scripts/migrate-site-memory.sh
---

# Snapshot: Clurian Legacy Memory Migrated Into Site Repo

**Time**: 2026-03-22 15:49 +0700
**Context**: ย้าย legacy logs และ retrospective ของ `clurian` ออกจาก HQ `ψ/memory/` เข้าไปยัง `projects/clurian/ψ/memory/` เพื่อให้ memory ของโปรเจกต์อยู่ใน repo เจ้าของงานตามกติกา Dual-Identity

## Tags
- snapshot
- migration
- clurian
- site-memory
- dual-identity

## What Changed
- ย้าย 2 log files จาก HQ `ψ/memory/logs/clurian/` ไปยัง `projects/clurian/ψ/memory/logs/`
- ย้าย 1 retrospective file จาก HQ `ψ/memory/retrospectives/2025-12/19/` ไปยัง `projects/clurian/ψ/memory/retrospectives/2025-12/19/`
- สร้าง Site-local `ψ/memory/` tree ใน repo `clurian` สำหรับการเก็บ history รอบถัดไป

## Evidence
- Moved files:
  - `2025-12-19_21-40_[clurian]_snapshot-pull-refresh.md`
  - `2025-12-19_22-10_[clurian]_refactor-refresh-initiation.md`
  - `23.25_[clurian]_refresh-refactor.md`
- Post-move state:
  - `git -C projects/clurian status --short` shows new `ψ/` content inside the `clurian` repo
  - HQ repo shows deletions for the original `clurian` files, which is expected after the move

## Apply When
- เมื่อ project มี legacy memory ตกค้างใน HQ แต่มี repo ของตัวเองพร้อมรับ Site-local `ψ/memory/`
- เมื่ออยากย้ายทีละโปรเจกต์แบบ reviewable แทนการ apply migration ข้ามหลาย repo พร้อมกัน

## Next Actions
- review และ commit การย้ายไฟล์นี้จากใน repo `projects/clurian` แยกจาก HQ cleanup commit
- ถ้าจะ clean HQ ต่อ ให้ลบ path ที่ว่างแล้วหรือปล่อยให้ migration batch ถัดไปจัดการ