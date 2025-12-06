# API Documentation

This document outlines the API endpoints and data structures for the Clurian application, based on the requirements in `docs/feature.md` and the schema in `docs/database.md`.

## Data Types

### TreeStatus
Enum: `HEALTHY`, `SICK`, `DEAD`, `ARCHIVED`

### LogType
Enum: `INDIVIDUAL`, `BATCH`

### LogStatus
Enum: `COMPLETED`, `IN_PROGRESS`

---

## 1. Orchards

### GET /api/orchards
List all orchards owned by the current user.
- **Auth Required**: Yes
- **Response**: `Orchard[]`
  ```json
  [
    {
      "id": "uuid",
      "name": "Suan Thong",
      "zones": ["A", "B"],
      "createdAt": "2023-10-01T00:00:00Z"
    }
  ]
  ```

### POST /api/orchards
Create a new orchard.
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "name": "New Orchard",
    "zones": ["A"]
  }
  ```
- **Response**: `Orchard`

---

## 2. Trees

### GET /api/trees
List trees for a specific orchard with filtering.
- **Auth Required**: Yes
- **Query Params**:
  - `orchardId` (required): UUID
  - `zone`: string (optional)
  - `status`: TreeStatus (optional)
  - `search`: string (optional, matches code or variety)
  - `page`: number (default 1)
  - `limit`: number (default 20)
- **Response**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "code": "A01",
        "zone": "A",
        "status": "HEALTHY",
        "type": "Durian",
        "variety": "Monthong",
        "plantedDate": "2020-05-15"
      }
    ],
    "meta": {
      "total": 100,
      "page": 1,
      "totalPages": 5
    }
  }
  ```

### GET /api/trees/:id
Get details of a specific tree.
- **Response**: `Tree`

### POST /api/trees
Register a new tree.
- **Body**:
  ```json
  {
    "orchardId": "uuid",
    "code": "A01",
    "zone": "A",
    "type": "Durian",
    "variety": "Monthong",
    "plantedDate": "2023-01-01"
  }
  ```
- **Response**: `Tree`

### PATCH /api/trees/:id/status
Update tree status.
- **Body**:
  ```json
  {
    "status": "SICK" // or HEALTHY, DEAD
  }
  ```
- **Response**: `Tree`

### POST /api/trees/:id/replant
Replant a dead tree (Archive old -> Create new).
- **Body**: `{}` (No specific body needed, logic handles the rest)
- **Response**:
  ```json
  {
    "oldTree": { "id": "...", "status": "ARCHIVED", "code": "A01_HIST_..." },
    "newTree": { "id": "...", "status": "HEALTHY", "code": "A01" }
  }
  ```

---

## 3. Activity Logs

### GET /api/logs
Get activity logs (History).
- **Query Params**:
  - `orchardId` (required): UUID
  - `treeId`: UUID (optional, for Individual history)
  - `type`: LogType (optional)
  - `status`: LogStatus (optional, e.g. IN_PROGRESS for follow-ups)
- **Response**: `ActivityLog[]`

### POST /api/logs
Create a new activity log (Individual or Batch).
- **Body**:
  ```json
  {
    "orchardId": "uuid",
    "logType": "INDIVIDUAL", // or BATCH
    "treeId": "uuid", // Required if INDIVIDUAL
    "targetZone": "A", // Required if BATCH
    "action": "Fertilize",
    "note": "Formula 15-15-15",
    "performDate": "2023-10-01",
    "followUpDate": "2023-10-15" // Optional
  }
  ```
- **Note**: If `followUpDate` is provided, `status` defaults to `IN_PROGRESS`.

### PATCH /api/logs/:id/follow-up
Update a follow-up log (e.g., complete it or continue treatment).
- **Body**:
  ```json
  {
    "status": "COMPLETED", // or IN_PROGRESS to update date
    "followUpDate": "2023-11-01", // New date if continuing
    "note": "Added more details"
  }
  ```

---

## 4. Dashboard Stats

### GET /api/dashboard/stats
Get numeric stats for the dashboard.
- **Query Params**: `orchardId`
- **Response**:
  ```json
  {
    "totalTrees": 150,
    "sickTrees": 5,
    "deadTrees": 1
  }
  ```

---

## Server Actions vs API Routes
Given we are using Next.js App Router, these endpoints will primarily be implemented as **Server Actions** for direct UI integration, but the structure remains identical.
