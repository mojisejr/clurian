import { prisma } from '@/lib/prisma';
import { Tree, TreeStatus } from '@/lib/types';
import { treeStatusToUI } from '@/lib/domain/mappers';
import { handleServiceError } from '@/lib/errors';

interface GetOrchardTreesOptions {
    orchardId: string;
    page?: number;
    limit?: number;
    filters?: {
        status?: TreeStatus;
        zone?: string;
        searchTerm?: string;
    };
}

/**
 * Get trees from an orchard with proper sorting at the database level
 * This ensures consistent ordering across pagination
 */
export async function getOrchardTreesSorted(options: GetOrchardTreesOptions) {
    const { orchardId, page = 1, limit = 20, filters } = options;
    const skip = (page - 1) * limit;

    try {
        // Use raw SQL with parameter binding for security
        const queryParams: any[] = [];
        let paramIndex = 1;

        // Build WHERE conditions
        const whereConditions = [`t."orchardId" = $${paramIndex++}`];
        queryParams.push(orchardId);

        if (filters?.status) {
            whereConditions.push(`t.status = $${paramIndex++}`);
            queryParams.push(filters.status);
        }

        if (filters?.zone) {
            whereConditions.push(`t.zone = $${paramIndex++}`);
            queryParams.push(filters.zone);
        }

        if (filters?.searchTerm) {
            whereConditions.push(`(
                t.code ILIKE $${paramIndex++}
                OR t.variety ILIKE $${paramIndex++}
            )`);
            queryParams.push(`%${filters.searchTerm}%`, `%${filters.searchTerm}%`);
        }

        const whereClause = whereConditions.join(' AND ');

        // Main query with proper sorting
        const query = `
            SELECT
                t.id,
                t."orchardId",
                t.code,
                t.zone,
                t.type,
                t.variety,
                t."planted_date",
                t.status,
                t."created_at",
                t."updated_at"
            FROM trees t
            WHERE ${whereClause}
            ORDER BY
                CASE t.status
                    WHEN 'SICK' THEN 1
                    WHEN 'HEALTHY' THEN 2
                    WHEN 'DEAD' THEN 3
                    WHEN 'ARCHIVED' THEN 4
                    ELSE 5
                END,
                -- Extract prefix (everything before the numbers)
                CASE
                    WHEN t.code ~ '^[A-Za-z]+' THEN SUBSTRING(t.code FROM '^[A-Za-z]+')
                    ELSE ''
                END,
                -- Extract and sort by number (handle edge cases)
                CASE
                    WHEN t.code ~ '[0-9]' THEN CAST(REGEXP_REPLACE(t.code, '[^0-9]', '') AS INTEGER)
                    ELSE 999999
                END,
                -- Finally sort by the full code as tiebreaker
                t.code
            LIMIT $${paramIndex++}
            OFFSET $${paramIndex++}
        `;

        // Count query
        const countQuery = `
            SELECT COUNT(*) as total
            FROM trees t
            WHERE ${whereClause}
        `;

        // Add limit and offset to params
        queryParams.push(limit, skip);

        // Execute queries in parallel
        const [treesResult, totalResult] = await Promise.all([
            prisma.$queryRawUnsafe(query, ...queryParams),
            prisma.$queryRawUnsafe(countQuery, ...queryParams.slice(0, -2)) // Don't include limit/offset for count
        ]);

        const total = Number((totalResult as any[])[0]?.total || 0);
        const totalPages = Math.ceil(total / limit);

        // Convert to Tree objects
        const trees: Tree[] = (treesResult as any[]).map(tree => ({
            id: tree.id,
            orchardId: tree.orchardId,
            code: tree.code,
            zone: tree.zone,
            type: tree.type,
            variety: tree.variety,
            plantedDate: tree.planted_date?.toISOString().split('T')[0] || undefined,
            status: treeStatusToUI(tree.status),
            createdAt: tree.created_at.toISOString(),
            updatedAt: tree.updated_at.toISOString()
        }));

        return {
            trees,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        };
    } catch (error) {
        console.error('Error in getOrchardTreesSorted:', error);
        handleServiceError(error, 'getOrchardTreesSorted');

        // Fallback to empty result
        return {
            trees: [],
            pagination: {
                page,
                limit,
                total: 0,
                totalPages: 0,
                hasNext: false,
                hasPrev: false
            }
        };
    }
}