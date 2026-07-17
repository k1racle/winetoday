-- Enable trigram extension for fast ILIKE / contains searches
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "content_items_title_trgm_idx" ON "content_items" USING GIN ("title" gin_trgm_ops);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "content_items_excerpt_trgm_idx" ON "content_items" USING GIN ("excerpt" gin_trgm_ops);
