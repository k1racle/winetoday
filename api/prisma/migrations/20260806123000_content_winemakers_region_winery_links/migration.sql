CREATE TABLE IF NOT EXISTS "content_item_regions" (
  "content_item_id" UUID NOT NULL,
  "region_id" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "content_item_regions_pkey" PRIMARY KEY ("content_item_id", "region_id")
);

CREATE TABLE IF NOT EXISTS "content_item_wineries" (
  "content_item_id" UUID NOT NULL,
  "winery_id" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "content_item_wineries_pkey" PRIMARY KEY ("content_item_id", "winery_id")
);

CREATE INDEX IF NOT EXISTS "content_item_regions_region_id_idx"
  ON "content_item_regions" ("region_id");

CREATE INDEX IF NOT EXISTS "content_item_wineries_winery_id_idx"
  ON "content_item_wineries" ("winery_id");

DO $$
BEGIN
  ALTER TABLE "content_item_regions"
    ADD CONSTRAINT "content_item_regions_content_item_id_fkey"
    FOREIGN KEY ("content_item_id") REFERENCES "content_items"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "content_item_regions"
    ADD CONSTRAINT "content_item_regions_region_id_fkey"
    FOREIGN KEY ("region_id") REFERENCES "winemakers_regions"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "content_item_wineries"
    ADD CONSTRAINT "content_item_wineries_content_item_id_fkey"
    FOREIGN KEY ("content_item_id") REFERENCES "content_items"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "content_item_wineries"
    ADD CONSTRAINT "content_item_wineries_winery_id_fkey"
    FOREIGN KEY ("winery_id") REFERENCES "winemakers_wineries"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
