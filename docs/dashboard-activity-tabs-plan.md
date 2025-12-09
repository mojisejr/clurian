# Dashboard Activity Tabs Implementation Plan

## 1. Overview

This document outlines the implementation plan for adding activity tabs to the dashboard page. The goal is to provide users with quick access to batch activities and scheduled activities directly from the main dashboard.

## 2. Current State Analysis

### 2.1 Dashboard Architecture
- **Location**: `/app/dashboard/page.tsx`
- **State Management**: Uses view state pattern (`'dashboard' | 'add_tree' | 'add_batch_log' | 'tree_detail'`)
- **Layout**: Single container with max-width md, optimized for mobile
- **Components**: Modular views in `/components/dashboard/views/`

### 2.2 Data Models
```typescript
// Log Types
LogType: "batch" | "individual"
LogStatus: "completed" | "in-progress"

// ActivityLog Schema
{
  id: string,
  orchardId: string,
  logType: LogType,
  treeId?: string,        // For individual logs
  targetZone?: string,    // For batch logs
  action: string,
  note?: string,
  performDate: DateTime,
  status: LogStatus,
  followUpDate?: DateTime,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### 2.3 Existing UI Patterns
- Card-based layout with consistent spacing
- Status badges with color variants
- Modal dialogs for detailed views
- Pagination (10 items per page)
- Zone filtering
- Search functionality

## 3. Proposed Architecture

### 3.1 Updated View State
```typescript
type ViewState = 'dashboard' | 'add_tree' | 'add_batch_log' | 'tree_detail'
                | 'batch_activities' | 'scheduled_activities';
```

### 3.2 Tab Structure
```
Dashboard Tabs
├── ต้นไม้ (Trees) - Current view
├── งานทั้งแปลง (Batch Activities) - New
└── งานที่ต้องทำ (Scheduled Activities) - New
```

### 3.3 Component Hierarchy
```
DashboardPage
└── DashboardContent
    ├── TabNavigation (New)
    └── TabContent
        ├── DashboardView (Existing)
        ├── BatchActivitiesView (New)
        └── ScheduledActivitiesView (New)
```

## 4. Implementation Details

### 4.1 Phase 1: Tab Navigation

#### 4.1.1 Create Tab Navigation Component
**File**: `/components/ui/tabs.tsx`
- Reusable tab component following existing patterns
- Support for badge indicators
- Active/inactive states
- Mobile-friendly touch targets

#### 4.1.2 Update Dashboard Page
**File**: `/app/dashboard/page.tsx`
- Add tab state management
- Update ViewState type
- Replace conditional view rendering with tab-based rendering

### 4.2 Phase 2: Batch Activities View

#### 4.2.1 Create Batch Activities View
**File**: `/components/dashboard/views/batch-activities-view.tsx`

**Features**:
- List all batch logs for current orchard
- Filter by zone, date range, activity type
- Status indicators (completed/in-progress)
- Pagination support
- Search functionality

**Data Fetching**:
```typescript
const batchLogs = logs.filter(log =>
  log.orchardId === currentOrchardId &&
  log.logType === 'BATCH'
);
```

#### 4.2.2 Create Activity Card Component
**File**: `/components/activity-card.tsx`
- Reusable card for displaying activities
- Shows: activity type, date, zone, status
- Quick actions menu
- Click to view details

### 4.3 Phase 3: Scheduled Activities View

#### 4.3.1 Create Scheduled Activities View
**File**: `/components/dashboard/views/scheduled-activities-view.tsx`

**Features**:
- Activities with follow-up dates
- Grouped by status: overdue, today, upcoming
- Priority indicators with color coding
- Quick completion actions
- Rescheduling capability

**Data Fetching**:
```typescript
const scheduledActivities = logs.filter(log =>
  log.orchardId === currentOrchardId &&
  log.followUpDate &&
  log.status === 'IN_PROGRESS'
);
```

#### 4.3.2 Add Date Utilities
**File**: `/lib/date-utils.ts`
- Helper functions for date comparisons
- Formatting functions for display
- Date grouping utilities

### 4.4 Phase 4: Shared Components & Enhancements

#### 4.4.1 Activity Filters Component
**File**: `/components/activity-filters.tsx`
- Common filters for both activity views
- Zone filter (reusing existing)
- Date range picker
- Activity type selector
- Export options

#### 4.4.2 Update Data Provider
**File**: `/components/providers/orchard-provider.tsx`
- Add computed values for activity counts
- Optimize queries with proper indexing
- Add real-time updates support

## 5. UI/UX Specifications

### 5.1 Tab Design
- **Style**: Match existing button patterns
- **Indicators**: Badge showing count of pending items
- **Icons**: Use Lucide icons for visual clarity
- **Active State**: Underline or background highlight

### 5.2 Activity Card Design
- **Layout**: Consistent with tree cards
- **Color Coding**:
  - Overdue: Red border
  - Today: Yellow border
  - Upcoming: Green border
- **Actions**: Swipe gestures on mobile

### 5.3 Responsive Design
- Maintain mobile-first approach
- Ensure touch targets are at least 44px
- Consider landscape orientation

## 6. Technical Considerations

### 6.1 Performance
- Implement pagination for activity lists
- Use memoization for filtered data
- Lazy load additional content
- Consider infinite scroll for mobile

### 6.2 Data Access Patterns
```typescript
// Batch Activities Query
const getBatchActivities = (orchardId: string) => ({
  where: {
    orchardId,
    logType: 'BATCH'
  },
  orderBy: {
    performDate: 'desc'
  }
});

// Scheduled Activities Query
const getScheduledActivities = (orchardId: string) => ({
  where: {
    orchardId,
    followUpDate: {
      not: null
    },
    status: 'IN_PROGRESS'
  },
  orderBy: {
    followUpDate: 'asc'
  }
});
```

### 6.3 State Management
- Tab state in dashboard component
- Filter state in individual views
- Shared state via context provider
- URL parameters for deep linking

## 7. Implementation Timeline

### Week 1: Foundation
- [ ] Create tab navigation component
- [ ] Update dashboard page structure
- [ ] Implement basic tab switching

### Week 2: Batch Activities
- [ ] Create batch activities view
- [ ] Implement activity card component
- [ ] Add filtering and pagination

### Week 3: Scheduled Activities
- [ ] Create scheduled activities view
- [ ] Implement date grouping
- [ ] Add quick action functionality

### Week 4: Polish & Enhancement
- [ ] Add advanced filtering
- [ ] Implement export functionality
- [ ] Performance optimization
- [ ] Testing and bug fixes

## 8. Testing Strategy

### 8.1 Unit Tests
- Tab navigation component
- Activity card component
- Date utility functions
- Data filtering logic

### 8.2 Integration Tests
- Dashboard state management
- Data fetching and caching
- Navigation between tabs
- Deep linking functionality

### 8.3 E2E Tests
- Complete user flows
- Mobile responsiveness
- Performance with large datasets

## 9. Success Metrics

### 9.1 User Experience
- Reduced clicks to view activities
- Faster access to scheduled tasks
- Improved visibility of batch operations

### 9.2 Performance
- Page load time under 2 seconds
- Smooth tab transitions
- Efficient data fetching

### 9.3 Adoption
- Increased usage of activity features
- Better task completion rates
- Positive user feedback

## 10. Future Enhancements

### 10.1 Advanced Features
- Calendar view for scheduled activities
- Bulk actions on activities
- Activity templates
- Analytics and reporting

### 10.2 Integrations
- Weather data integration
- Task notifications
- Calendar sync
- Export to external systems

---

This plan provides a structured approach to implementing the activity tabs feature while maintaining consistency with the existing codebase and ensuring a smooth user experience.