-- CreateIndex
CREATE INDEX "content_items_type_status_published_at_idx" ON "content_items"("type", "status", "published_at");

-- CreateIndex
CREATE INDEX "content_items_author_id_status_published_at_idx" ON "content_items"("author_id", "status", "published_at");

-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");

-- CreateIndex
CREATE INDEX "comments_content_item_id_status_created_at_idx" ON "comments"("content_item_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "reactions_content_item_id_type_idx" ON "reactions"("content_item_id", "type");
