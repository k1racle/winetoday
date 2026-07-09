-- AddColumn
ALTER TABLE "authors" ADD COLUMN IF NOT EXISTS "avatarMediaId" UUID;

-- AddForeignKey
ALTER TABLE "authors" ADD CONSTRAINT "authors_avatarMediaId_fkey" FOREIGN KEY ("avatarMediaId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE IF NOT EXISTS "author_subscriptions" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "author_subscriptions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "author_subscriptions" ADD CONSTRAINT "author_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "author_subscriptions" ADD CONSTRAINT "author_subscriptions_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "authors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "author_subscriptions_userId_authorId_key" ON "author_subscriptions"("userId", "authorId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "author_subscriptions_authorId_idx" ON "author_subscriptions"("authorId");
