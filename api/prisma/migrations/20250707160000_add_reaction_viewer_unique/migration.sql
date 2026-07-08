-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "reactions_contentItemId_viewer_id_key" ON "reactions"("contentItemId", "viewer_id");
