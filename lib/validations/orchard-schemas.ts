import { z } from 'zod';

// Common validation patterns
const nonEmptyString = z.string().min(1, 'จำเป็นต้องระบุข้อมูล');
const optionalString = z.string().optional();
const dateSchema = z.string().datetime('วันที่ไม่ถูกต้อง');

// Tree status validation
const TreeStatusSchema = z.enum(['HEALTHY', 'SICK', 'DEAD', 'ARCHIVED']);

// Log type validation
const LogTypeSchema = z.enum(['INDIVIDUAL', 'BATCH']);

// Log status validation
const LogStatusSchema = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']);

// Orchard validation schemas
export const CreateOrchardSchema = z.object({
  name: z.string()
    .min(1, 'ชื่อสวนต้องมีความยาวอย่างน้อย 1 ตัวอักษร')
    .max(100, 'ชื่อสวนต้องมีความยาวไม่เกิน 100 ตัวอักษร')
    .regex(/^[ก-๙a-zA-Z0-9\s\-_]+$/, 'ชื่อสวนต้องเป็นตัวอักษรไทย อังกฤษ ตัวเลข หรือเครื่องหมาย -_ เท่านั้น'),
  zones: z.array(z.string().min(1, 'ชื่อโซนต้องไม่ว่าง'))
    .min(1, 'ต้องมีโซนอย่างน้อย 1 โซน')
    .max(26, 'โซนสูงสุดคือ 26 โซน (A-Z)')
    .default(['A']),
});

export const UpdateOrchardSchema = CreateOrchardSchema.partial();

export const AddZoneSchema = z.object({
  zone: z.string()
    .min(1, 'ชื่อโซนต้องมีความยาวอย่างน้อย 1 ตัวอักษร')
    .max(10, 'ชื่อโซนต้องมีความยาวไม่เกิน 10 ตัวอักษร')
    .regex(/^[A-Z0-9]+$/, 'ชื่อโซนต้องเป็นตัวอักษรภาษาอังกฤษพิมพ์ใหญ่หรือตัวเลขเท่านั้น'),
});

// Tree validation schemas
export const CreateTreeSchema = z.object({
  code: z.string()
    .min(1, 'รหัสต้นไม้ต้องไม่ว่าง')
    .max(20, 'รหัสต้นไม้ต้องมีความยาวไม่เกิน 20 ตัวอักษร')
    .regex(/^[A-Z0-9\-]+$/, 'รหัสต้นไม้ต้องเป็นตัวอักษรภาษาอังกฤษพิมพ์ใหญ่ ตัวเลข หรือเครื่องหมาย - เท่านั้น'),
  zone: z.string()
    .min(1, 'โซนต้องไม่ว่าง')
    .max(10, 'ชื่อโซนต้องมีความยาวไม่เกิน 10 ตัวอักษร'),
  type: z.enum(['ทุเรียน', 'มะม่วง', 'ลองกอง', 'อื่นๆ']).default('ทุเรียน'),
  variety: z.string()
    .min(1, 'พันธุ์ต้นไม้ต้องไม่ว่าง')
    .max(50, 'ชื่อพันธุ์ต้องมีความยาวไม่เกิน 50 ตัวอักษร'),
  plantedDate: dateSchema.optional(),
  status: TreeStatusSchema.default('HEALTHY'),
  orchardId: nonEmptyString,
});

export const UpdateTreeSchema = z.object({
  code: optionalString,
  zone: optionalString,
  type: z.enum(['ทุเรียน', 'มะม่วง', 'ลองกอง', 'อื่นๆ']).optional(),
  variety: optionalString,
  plantedDate: dateSchema.optional(),
  status: TreeStatusSchema.optional(),
});

export const UpdateTreeStatusSchema = z.object({
  status: TreeStatusSchema,
  reason: optionalString,
});

export const ArchiveTreeSchema = z.object({
  treeId: nonEmptyString,
  newCode: z.string()
    .min(1, 'รหัสต้นไม้ใหม่ต้องไม่ว่าง')
    .max(20, 'รหัสต้นไม้ใหม่ต้องมีความยาวไม่เกิน 20 ตัวอักษร'),
});

// Activity Log validation schemas
export const CreateLogSchema = z.object({
  orchardId: nonEmptyString,
  logType: LogTypeSchema,
  treeId: optionalString, // Required for INDIVIDUAL, optional for BATCH
  targetZone: optionalString, // Required for BATCH, optional for INDIVIDUAL
  action: z.string()
    .min(1, 'การดำเนินการต้องไม่ว่าง')
    .max(200, 'การดำเนินการต้องมีความยาวไม่เกิน 200 ตัวอักษร'),
  note: optionalString,
  performDate: dateSchema.optional(),
  status: LogStatusSchema.default('PENDING'),
  followUpDate: dateSchema.optional(),
  mixingFormulaId: optionalString,
}).refine((data) => {
  // Validate based on log type
  if (data.logType === 'INDIVIDUAL') {
    return !!data.treeId;
  }
  if (data.logType === 'BATCH') {
    return !!data.targetZone;
  }
  return true;
}, {
  message: 'กิจกรรมแบบ INDIVIDUAL ต้องระบุ treeId, กิจกรรมแบบ BATCH ต้องระบุ targetZone',
  path: ['logType'],
});

export const UpdateLogSchema = z.object({
  id: nonEmptyString,
  action: optionalString,
  note: optionalString,
  performDate: dateSchema.optional(),
  status: LogStatusSchema.optional(),
  followUpDate: dateSchema.optional(),
  mixingFormulaId: optionalString,
});

// Pagination validation schemas
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'code', 'zone', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const TreeFilterSchema = z.object({
  status: z.enum(['ALL', 'HEALTHY', 'SICK', 'DEAD', 'ARCHIVED']).default('ALL'),
  zone: z.string().default('ALL'),
  searchTerm: z.string().max(100, 'คำค้นหาต้องมีความยาวไม่เกิน 100 ตัวอักษร').default(''),
  type: z.string().optional(),
  variety: z.string().optional(),
});

export const LogFilterSchema = z.object({
  logType: z.enum(['ALL', 'INDIVIDUAL', 'BATCH']).default('ALL'),
  status: z.enum(['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED']).default('ALL'),
  zone: z.string().default('ALL'),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  searchTerm: z.string().max(100).default(''),
});

// Combined schemas for API endpoints
export const GetOrchardDataSchema = z.object({
  orchardId: nonEmptyString,
  ...PaginationQuerySchema.shape,
  ...TreeFilterSchema.shape,
});

export const GetTreesSchema = z.object({
  orchardId: nonEmptyString,
  ...PaginationQuerySchema.shape,
  ...TreeFilterSchema.shape,
});

export const GetLogsSchema = z.object({
  orchardId: nonEmptyString,
  ...PaginationQuerySchema.shape,
  ...LogFilterSchema.shape,
});

// Search validation schemas
export const SearchTreesSchema = z.object({
  orchardId: nonEmptyString,
  query: z.string()
    .min(1, 'คำค้นหาต้องไม่ว่าง')
    .max(100, 'คำค้นหาต้องมีความยาวไม่เกิน 100 ตัวอักษร'),
  ...PaginationQuerySchema.pick({ limit: true, page: true }),
});

export const SearchLogsSchema = z.object({
  orchardId: nonEmptyString,
  query: z.string()
    .min(1, 'คำค้นหาต้องไม่ว่าง')
    .max(100, 'คำค้นหาต้องมีความยาวไม่เกิน 100 ตัวอักษร'),
  ...PaginationQuerySchema.pick({ limit: true, page: true }),
});

// Export type inference for use in components
export type CreateOrchardInput = z.infer<typeof CreateOrchardSchema>;
export type UpdateOrchardInput = z.infer<typeof UpdateOrchardSchema>;
export type AddZoneInput = z.infer<typeof AddZoneSchema>;
export type CreateTreeInput = z.infer<typeof CreateTreeSchema>;
export type UpdateTreeInput = z.infer<typeof UpdateTreeSchema>;
export type UpdateTreeStatusInput = z.infer<typeof UpdateTreeStatusSchema>;
export type ArchiveTreeInput = z.infer<typeof ArchiveTreeSchema>;
export type CreateLogInput = z.infer<typeof CreateLogSchema>;
export type UpdateLogInput = z.infer<typeof UpdateLogSchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type TreeFilter = z.infer<typeof TreeFilterSchema>;
export type LogFilter = z.infer<typeof LogFilterSchema>;
export type GetOrchardDataInput = z.infer<typeof GetOrchardDataSchema>;
export type GetTreesInput = z.infer<typeof GetTreesSchema>;
export type GetLogsInput = z.infer<typeof GetLogsSchema>;
export type SearchTreesInput = z.infer<typeof SearchTreesSchema>;
export type SearchLogsInput = z.infer<typeof SearchLogsSchema>;

// Helper functions for validation
export function validateOrchardInput(input: unknown): CreateOrchardInput {
  return CreateOrchardSchema.parse(input);
}

export function validateTreeInput(input: unknown): CreateTreeInput {
  return CreateTreeSchema.parse(input);
}

export function validateLogInput(input: unknown): CreateLogInput {
  return CreateLogSchema.parse(input);
}

export function validatePaginationQuery(input: unknown): PaginationQuery {
  return PaginationQuerySchema.parse(input);
}

export function validateTreeFilter(input: unknown): TreeFilter {
  return TreeFilterSchema.parse(input);
}

export function validateLogFilter(input: unknown): LogFilter {
  return LogFilterSchema.parse(input);
}

// Error types for better error handling
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Sanitization functions
export function sanitizeSearchQuery(query: string): string {
  return query.trim().slice(0, 100);
}

export function sanitizeTreeCode(code: string): string {
  return code.trim().toUpperCase().slice(0, 20);
}

export function sanitizeZone(zone: string): string {
  return zone.trim().slice(0, 10);
}