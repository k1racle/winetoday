-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'editor', 'author', 'member');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('article', 'news', 'video', 'gallery', 'page');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('draft', 'in_review', 'published', 'rejected');

-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('like', 'dislike');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "passwordHash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'member',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_accounts" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oauth_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_profiles" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "display_name" TEXT,
    "account_type" TEXT,
    "authorId" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authors" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "position" TEXT,
    "bio" TEXT,
    "memberProfileId" UUID,
    "avatarMediaId" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "authors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" UUID NOT NULL,
    "path" TEXT NOT NULL,
    "mime" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "alt_text" TEXT,
    "size_bytes" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_items" (
    "id" UUID NOT NULL,
    "type" "ContentType" NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMP(3),
    "published_at_custom" TIMESTAMP(3),
    "coverMediaId" UUID,
    "archiveCoverMediaId" UUID,
    "cover_source" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "homepage_lead" BOOLEAN NOT NULL DEFAULT false,
    "homepage_special_block" BOOLEAN NOT NULL DEFAULT false,
    "material_label" TEXT,
    "reading_time" INTEGER,
    "preview" BOOLEAN NOT NULL DEFAULT false,
    "content_blocks" JSONB NOT NULL DEFAULT '[]',
    "sources" JSONB,
    "tasting_note" JSONB,
    "video_url" TEXT,
    "duration" INTEGER,
    "seo" JSONB,
    "views_total" INTEGER NOT NULL DEFAULT 0,
    "authorId" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "submitted_at" TIMESTAMP(3),
    "reviewed_at" TIMESTAMP(3),
    "review_comment" TEXT,

    CONSTRAINT "content_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" UUID NOT NULL,
    "contentItemId" UUID NOT NULL,
    "userId" UUID,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reactions" (
    "id" UUID NOT NULL,
    "contentItemId" UUID NOT NULL,
    "userId" UUID,
    "viewer_id" TEXT,
    "type" "ReactionType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_view_events" (
    "id" UUID NOT NULL,
    "content_type" "ContentType" NOT NULL,
    "contentId" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "authorId" UUID,
    "viewer_id" TEXT NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_hash" TEXT,
    "user_agent" TEXT,
    "referrer" TEXT,

    CONSTRAINT "content_view_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_view_totals" (
    "content_type" "ContentType" NOT NULL,
    "contentId" UUID NOT NULL,
    "views_total" INTEGER NOT NULL DEFAULT 0,
    "unique_viewers" INTEGER NOT NULL DEFAULT 0,
    "last_viewed_at" TIMESTAMP(3),

    CONSTRAINT "content_view_totals_pkey" PRIMARY KEY ("content_type","contentId")
);

-- CreateTable
CREATE TABLE "content_view_daily" (
    "date" DATE NOT NULL,
    "content_type" "ContentType" NOT NULL,
    "contentId" UUID NOT NULL,
    "authorId" UUID,
    "views" INTEGER NOT NULL DEFAULT 0,
    "unique_viewers" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "content_view_daily_pkey" PRIMARY KEY ("date","content_type","contentId")
);

-- CreateTable
CREATE TABLE "author_subscriptions" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "author_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "author_view_daily" (
    "date" DATE NOT NULL,
    "authorId" UUID NOT NULL,
    "article_views" INTEGER NOT NULL DEFAULT 0,
    "news_views" INTEGER NOT NULL DEFAULT 0,
    "video_views" INTEGER NOT NULL DEFAULT 0,
    "gallery_views" INTEGER NOT NULL DEFAULT 0,
    "total_views" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "author_view_daily_pkey" PRIMARY KEY ("date","authorId")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" UUID NOT NULL,
    "site_name" TEXT,
    "site_description" TEXT,
    "logoMediaId" UUID,
    "typography" JSONB,
    "social_links" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage" (
    "id" UUID NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "infographic_cards" JSONB,
    "blocks" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_header" (
    "id" UUID NOT NULL,
    "menu" JSONB,
    "lightLogoMediaId" UUID,
    "darkLogoMediaId" UUID,
    "sticky_desktop" BOOLEAN NOT NULL DEFAULT false,
    "sticky_tablet" BOOLEAN NOT NULL DEFAULT false,
    "sticky_mobile" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_header_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_footer" (
    "id" UUID NOT NULL,
    "columns" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_footer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_seo" (
    "id" UUID NOT NULL,
    "default_seo" JSONB,
    "openGraphImageMediaId" UUID,
    "twitterImageMediaId" UUID,
    "robots_enabled" BOOLEAN NOT NULL DEFAULT true,
    "robots_rules" JSONB,
    "robots_host" TEXT,
    "robots_additional_sitemaps" TEXT,
    "sitemap_enabled" BOOLEAN NOT NULL DEFAULT true,
    "sitemap_exclude_paths" TEXT,
    "sitemap_include_articles" BOOLEAN NOT NULL DEFAULT true,
    "sitemap_include_news" BOOLEAN NOT NULL DEFAULT true,
    "sitemap_include_videos" BOOLEAN NOT NULL DEFAULT true,
    "sitemap_include_pages" BOOLEAN NOT NULL DEFAULT true,
    "sitemap_include_galleries" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_seo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sidebars" (
    "id" UUID NOT NULL,
    "title" TEXT,
    "path" TEXT,
    "paths" JSONB,
    "links" JSONB,
    "sections" JSONB,
    "archive_blocks" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sidebars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_settings" (
    "id" UUID NOT NULL,
    "moderation_enabled" BOOLEAN NOT NULL DEFAULT true,
    "stop_words" TEXT,
    "share_networks" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_auth_settings" (
    "id" UUID NOT NULL,
    "providers" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_auth_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archive_settings" (
    "id" UUID NOT NULL,
    "settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "archive_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "static_pages" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content_blocks" JSONB NOT NULL DEFAULT '[]',
    "seo" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "static_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoryToContentItem" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_ContentItemToTag" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_accounts_provider_provider_account_id_key" ON "oauth_accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "member_profiles_userId_key" ON "member_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "member_profiles_authorId_key" ON "member_profiles"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "authors_slug_key" ON "authors"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "authors_memberProfileId_key" ON "authors"("memberProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "content_items_status_published_at_idx" ON "content_items"("status", "published_at");

-- CreateIndex
CREATE INDEX "content_items_homepage_lead_idx" ON "content_items"("homepage_lead");

-- CreateIndex
CREATE INDEX "content_items_homepage_special_block_idx" ON "content_items"("homepage_special_block");

-- CreateIndex
CREATE UNIQUE INDEX "content_items_type_slug_key" ON "content_items"("type", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "content_items_type_id_key" ON "content_items"("type", "id");

-- CreateIndex
CREATE UNIQUE INDEX "reactions_contentItemId_userId_key" ON "reactions"("contentItemId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "reactions_contentItemId_viewer_id_key" ON "reactions"("contentItemId", "viewer_id");

-- CreateIndex
CREATE INDEX "content_view_events_content_type_contentId_idx" ON "content_view_events"("content_type", "contentId");

-- CreateIndex
CREATE INDEX "content_view_events_viewed_at_idx" ON "content_view_events"("viewed_at");

-- CreateIndex
CREATE UNIQUE INDEX "content_view_events_content_type_contentId_viewer_id_key" ON "content_view_events"("content_type", "contentId", "viewer_id");

-- CreateIndex
CREATE UNIQUE INDEX "content_view_totals_contentId_key" ON "content_view_totals"("contentId");

-- CreateIndex
CREATE INDEX "content_view_daily_date_idx" ON "content_view_daily"("date");

-- CreateIndex
CREATE UNIQUE INDEX "author_subscriptions_userId_authorId_key" ON "author_subscriptions"("userId", "authorId");

-- CreateIndex
CREATE UNIQUE INDEX "site_settings_logoMediaId_key" ON "site_settings"("logoMediaId");

-- CreateIndex
CREATE UNIQUE INDEX "site_header_lightLogoMediaId_key" ON "site_header"("lightLogoMediaId");

-- CreateIndex
CREATE UNIQUE INDEX "site_header_darkLogoMediaId_key" ON "site_header"("darkLogoMediaId");

-- CreateIndex
CREATE UNIQUE INDEX "site_seo_openGraphImageMediaId_key" ON "site_seo"("openGraphImageMediaId");

-- CreateIndex
CREATE UNIQUE INDEX "site_seo_twitterImageMediaId_key" ON "site_seo"("twitterImageMediaId");

-- CreateIndex
CREATE UNIQUE INDEX "static_pages_slug_key" ON "static_pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryToContentItem_AB_unique" ON "_CategoryToContentItem"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoryToContentItem_B_index" ON "_CategoryToContentItem"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ContentItemToTag_AB_unique" ON "_ContentItemToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_ContentItemToTag_B_index" ON "_ContentItemToTag"("B");

-- AddForeignKey
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_profiles" ADD CONSTRAINT "member_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_profiles" ADD CONSTRAINT "member_profiles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "authors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authors" ADD CONSTRAINT "authors_avatarMediaId_fkey" FOREIGN KEY ("avatarMediaId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "authors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_archiveCoverMediaId_fkey" FOREIGN KEY ("archiveCoverMediaId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "content_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "content_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_view_events" ADD CONSTRAINT "content_view_events_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "content_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_view_totals" ADD CONSTRAINT "content_view_totals_content_type_contentId_fkey" FOREIGN KEY ("content_type", "contentId") REFERENCES "content_items"("type", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_view_daily" ADD CONSTRAINT "content_view_daily_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "content_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "author_subscriptions" ADD CONSTRAINT "author_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "author_subscriptions" ADD CONSTRAINT "author_subscriptions_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "authors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "author_view_daily" ADD CONSTRAINT "author_view_daily_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "authors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logoMediaId_fkey" FOREIGN KEY ("logoMediaId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_header" ADD CONSTRAINT "site_header_lightLogoMediaId_fkey" FOREIGN KEY ("lightLogoMediaId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_header" ADD CONSTRAINT "site_header_darkLogoMediaId_fkey" FOREIGN KEY ("darkLogoMediaId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_seo" ADD CONSTRAINT "site_seo_openGraphImageMediaId_fkey" FOREIGN KEY ("openGraphImageMediaId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_seo" ADD CONSTRAINT "site_seo_twitterImageMediaId_fkey" FOREIGN KEY ("twitterImageMediaId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToContentItem" ADD CONSTRAINT "_CategoryToContentItem_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToContentItem" ADD CONSTRAINT "_CategoryToContentItem_B_fkey" FOREIGN KEY ("B") REFERENCES "content_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContentItemToTag" ADD CONSTRAINT "_ContentItemToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "content_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContentItemToTag" ADD CONSTRAINT "_ContentItemToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

