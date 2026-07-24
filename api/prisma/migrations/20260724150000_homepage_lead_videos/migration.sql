-- Add lead/video configuration columns to homepage singleton
ALTER TABLE "homepage" ADD COLUMN "lead_item_ids" uuid[];
ALTER TABLE "homepage" ADD COLUMN "video_item_ids" uuid[];

-- Migrate currently published special-block items into the new lead slots
DO $$
DECLARE
  homepage_id uuid;
  lead_ids uuid[];
BEGIN
  SELECT id INTO homepage_id FROM "homepage" LIMIT 1;
  IF homepage_id IS NOT NULL THEN
    SELECT ARRAY(
      SELECT id FROM "content_items"
      WHERE "homepage_special_block" = true AND status = 'published'
      ORDER BY "published_at" DESC
      LIMIT 5
    ) INTO lead_ids;

    UPDATE "homepage" SET "lead_item_ids" = lead_ids WHERE id = homepage_id;
  END IF;
END $$;
