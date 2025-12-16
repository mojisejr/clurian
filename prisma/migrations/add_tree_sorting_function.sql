-- Create a function to extract prefix from tree code
CREATE OR REPLACE FUNCTION extract_tree_prefix(tree_code TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN REGEXP_REPLACE(tree_code, '\\d+$', '');
END;
$$ LANGUAGE plpgsql;

-- Create a function to extract number from tree code
CREATE OR REPLACE FUNCTION extract_tree_number(tree_code TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE(
        NULLIF(
            CAST(REGEXP_REPLACE(tree_code, '[^0-9]', '') AS INTEGER),
            0
        ),
        999999
    );
END;
$$ LANGUAGE plpgsql;

-- Create the main sorting function for trees
CREATE OR REPLACE FUNCTION get_sorted_trees(
    p_orchard_id UUID,
    p_status TEXT DEFAULT NULL,
    p_zone TEXT DEFAULT NULL,
    p_search_term TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    orchardId UUID,
    code TEXT,
    zone TEXT,
    type TEXT,
    variety TEXT,
    plantedDate DATE,
    status TEXT,
    createdAt TIMESTAMP WITH TIME ZONE,
    updatedAt TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.id,
        t."orchardId",
        t.code,
        t.zone,
        t.type,
        t.variety,
        t."plantedDate",
        t.status,
        t."createdAt",
        t."updatedAt"
    FROM "Tree" t
    WHERE
        t."orchardId" = p_orchard_id
        AND (p_status IS NULL OR t.status = p_status)
        AND (p_zone IS NULL OR t.zone = p_zone)
        AND (
            p_search_term IS NULL
            OR t.code ILIKE '%' || p_search_term || '%'
            OR t.variety ILIKE '%' || p_search_term || '%'
        )
    ORDER BY
        CASE t.status
            WHEN 'SICK' THEN 1
            WHEN 'HEALTHY' THEN 2
            WHEN 'DEAD' THEN 3
            WHEN 'ARCHIVED' THEN 4
            ELSE 5
        END,
        extract_tree_prefix(t.code),
        extract_tree_number(t.code)
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Create a function to count filtered trees
CREATE OR REPLACE FUNCTION count_filtered_trees(
    p_orchard_id UUID,
    p_status TEXT DEFAULT NULL,
    p_zone TEXT DEFAULT NULL,
    p_search_term TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    tree_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO tree_count
    FROM "Tree" t
    WHERE
        t."orchardId" = p_orchard_id
        AND (p_status IS NULL OR t.status = p_status)
        AND (p_zone IS NULL OR t.zone = p_zone)
        AND (
            p_search_term IS NULL
            OR t.code ILIKE '%' || p_search_term || '%'
            OR t.variety ILIKE '%' || p_search_term || '%'
        );

    RETURN tree_count;
END;
$$ LANGUAGE plpgsql;