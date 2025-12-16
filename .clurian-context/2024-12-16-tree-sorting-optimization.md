# Tree Sorting Optimization - Database Level Implementation
## Date: 2024-12-16
## Issue: #45

### Problem
- Tree sorting was happening client-side after pagination
- This caused inconsistent ordering between pagination pages and PDF export
- With 3000 trees, loading all data for sorting was inefficient

### Solution Implemented
1. **Database-Level Sorting**: Moved sorting logic to PostgreSQL using raw SQL queries
2. **Proper Ordering**: Implemented 3-tier sorting:
   - Status priority (SICK > HEALTHY > DEAD > ARCHIVED)
   - Code prefix (alphabetical)
   - Code number (numerical)
3. **Edge Case Handling**: Proper handling of empty/malformed tree codes

### Technical Implementation
- Created `tree-service-db.ts` with raw SQL queries using `$queryRawUnsafe`
- Used parameter binding for security against SQL injection
- Implemented regex operations in PostgreSQL:
  - `SUBSTRING(code FROM '^[A-Za-z]+')` for prefix extraction
  - `CAST(REGEXP_REPLACE(code, '[^0-9]', '') AS INTEGER)` for number extraction

### Challenges Encountered
1. Table/Column naming: Prisma maps to different database names (e.g., `trees` not `Tree`)
2. SQL syntax: Initial attempts with template literals failed, needed proper parameter binding
3. Test expectations: Had to match actual API response (lowercase English status, not Thai)

### Key Learnings
- Raw SQL is necessary for complex sorting that Prisma ORM can't express
- PostgreSQL regex functions are powerful for string manipulation
- Parameter binding order must match query placeholders exactly
- Database functions would be even better for reusability (created but not implemented due to time)

### Performance Impact
- Sorting now happens in database before pagination
- No need to load all 3000 trees into memory
- Consistent ordering across all pages and exports
- Query time < 2 seconds for 50+ trees

### Test Coverage
- 6 comprehensive tests covering:
  - Status priority sorting
  - Code prefix sorting
  - Code number sorting
  - Pagination consistency
  - Edge case handling
  - Performance benchmarks

All tests passing ✅

### Future Improvements
1. Create PostgreSQL functions for sorting logic reusability
2. Add database indexes for optimized sorting performance
3. Implement caching for frequently accessed pages
4. Consider using materialized views for very large orchards