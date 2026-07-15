BEGIN;

WITH pairs AS (
  SELECT t1.id AS main_id, t2.id AS dup_id
  FROM tags t1
  JOIN tags t2
    ON TRIM(t1.name) = TRIM(t2.name)
    AND t1.id != t2.id
    AND t2.slug = t1.slug || '-2'
),
removed AS (
  DELETE FROM "_ContentItemToTag" rel
  USING pairs
  WHERE rel."B" = pairs.dup_id
    AND EXISTS (
      SELECT 1 FROM "_ContentItemToTag" existing
      WHERE existing."B" = pairs.main_id
        AND existing."A" = rel."A"
    )
),
updated AS (
  UPDATE "_ContentItemToTag" rel
  SET "B" = pairs.main_id
  FROM pairs
  WHERE rel."B" = pairs.dup_id
)
DELETE FROM tags
WHERE id IN (SELECT dup_id FROM pairs);

COMMIT;
