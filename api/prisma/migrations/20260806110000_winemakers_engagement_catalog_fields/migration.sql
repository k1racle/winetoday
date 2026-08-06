DO $$
BEGIN
    CREATE TYPE "CatalogEntityType" AS ENUM ('person', 'wine', 'region', 'terroir', 'winery');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "comments"
    ALTER COLUMN "contentItemId" DROP NOT NULL;

ALTER TABLE "comments"
    ADD COLUMN IF NOT EXISTS "person_id" UUID,
    ADD COLUMN IF NOT EXISTS "wine_id" UUID;

ALTER TABLE "winemakers_people"
    ADD COLUMN IF NOT EXISTS "views_total" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "winemakers_wines"
    ADD COLUMN IF NOT EXISTS "views_total" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "catalog_view_events" (
    "id" UUID NOT NULL,
    "entity_type" "CatalogEntityType" NOT NULL,
    "entity_id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "viewer_id" TEXT NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catalog_view_events_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'comments_person_id_fkey'
    ) THEN
        ALTER TABLE "comments"
            ADD CONSTRAINT "comments_person_id_fkey"
            FOREIGN KEY ("person_id") REFERENCES "winemakers_people"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'comments_wine_id_fkey'
    ) THEN
        ALTER TABLE "comments"
            ADD CONSTRAINT "comments_wine_id_fkey"
            FOREIGN KEY ("wine_id") REFERENCES "winemakers_wines"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "comments_person_id_status_created_at_idx"
    ON "comments"("person_id", "status", "created_at");

CREATE INDEX IF NOT EXISTS "comments_wine_id_status_created_at_idx"
    ON "comments"("wine_id", "status", "created_at");

CREATE UNIQUE INDEX IF NOT EXISTS "catalog_view_events_entity_type_entity_id_viewer_id_key"
    ON "catalog_view_events"("entity_type", "entity_id", "viewer_id");

CREATE INDEX IF NOT EXISTS "catalog_view_events_entity_type_entity_id_idx"
    ON "catalog_view_events"("entity_type", "entity_id");

CREATE INDEX IF NOT EXISTS "catalog_view_events_viewed_at_idx"
    ON "catalog_view_events"("viewed_at");
