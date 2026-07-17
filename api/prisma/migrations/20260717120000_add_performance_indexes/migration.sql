-- CreateIndex
CREATE INDEX IF NOT EXISTS "content_items_type_status_published_at_idx" ON "content_items"("type", "status", "published_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "content_items_author_id_status_published_at_idx" ON "content_items"("authorId", "status", "published_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "categories_parent_id_idx" ON "categories"("parentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "comments_content_item_id_status_created_at_idx" ON "comments"("contentItemId", "status", "created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "reactions_content_item_id_type_idx" ON "reactions"("contentItemId", "type");
