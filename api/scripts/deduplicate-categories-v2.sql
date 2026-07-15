-- Deduplicate categories in winetoday_v2
-- Keeps the category without "-2" suffix, merges relations, deletes duplicates

BEGIN;

-- Create temporary mapping of duplicate pairs
WITH pairs AS (
  SELECT c1.id AS main_id, c2.id AS dup_id
  FROM categories c1
  JOIN categories c2
    ON TRIM(c1.name) = TRIM(c2.name)
    AND c1.id != c2.id
    AND c2.slug = c1.slug || '-2'
),
-- Remove duplicate relations where the content item is already linked to the main category
removed AS (
  DELETE FROM "_CategoryToContentItem" rel
  USING pairs
  WHERE rel."A" = pairs.dup_id
    AND EXISTS (
      SELECT 1 FROM "_CategoryToContentItem" existing
      WHERE existing."A" = pairs.main_id
        AND existing."B" = rel."B"
    )
),
-- Update remaining relations to point to the main category
updated AS (
  UPDATE "_CategoryToContentItem" rel
  SET "A" = pairs.main_id
  FROM pairs
  WHERE rel."A" = pairs.dup_id
)
-- Delete duplicate categories
DELETE FROM categories
WHERE id IN (SELECT dup_id FROM pairs);

COMMIT;
