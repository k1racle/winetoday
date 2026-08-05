-- CreateEnum
CREATE TYPE "PersonRelationType" AS ENUM ('parent', 'spouse', 'sibling', 'founder');

-- CreateTable
CREATE TABLE "winemakers_people" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birth_year" INTEGER,
    "death_year" INTEGER,
    "photo_id" UUID,
    "summary" TEXT,
    "bio_blocks" JSONB NOT NULL DEFAULT '[]',
    "career" JSONB NOT NULL DEFAULT '[]',
    "winery_id" UUID,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "seo" JSONB,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "winemakers_people_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "winemakers_person_relations" (
    "person_id" UUID NOT NULL,
    "related_id" UUID NOT NULL,
    "type" "PersonRelationType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "winemakers_person_relations_pkey" PRIMARY KEY ("person_id","related_id","type")
);

-- CreateTable
CREATE TABLE "winemakers_wineries" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT,
    "founded_year" INTEGER,
    "region_id" UUID,
    "logo_id" UUID,
    "description" JSONB NOT NULL DEFAULT '[]',
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "seo" JSONB,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "winemakers_wineries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "winemakers_regions" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT,
    "parent_id" UUID,
    "description" JSONB NOT NULL DEFAULT '[]',
    "climate" TEXT,
    "soil" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "seo" JSONB,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "winemakers_regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "winemakers_terroirs" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT,
    "region_id" UUID NOT NULL,
    "exposition" TEXT,
    "elevation_m" INTEGER,
    "soil" TEXT,
    "description" JSONB NOT NULL DEFAULT '[]',
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "seo" JSONB,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "winemakers_terroirs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "winemakers_wines" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT,
    "type" TEXT,
    "style" TEXT,
    "vintage" INTEGER,
    "grapes" JSONB NOT NULL DEFAULT '[]',
    "winery_id" UUID,
    "region_id" UUID,
    "terroir_id" UUID,
    "description" JSONB NOT NULL DEFAULT '[]',
    "seo" JSONB,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "winemakers_wines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "winemakers_wine_people" (
    "wine_id" UUID NOT NULL,
    "person_id" UUID NOT NULL,
    "role" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "winemakers_wine_people_pkey" PRIMARY KEY ("wine_id","person_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "winemakers_people_slug_key" ON "winemakers_people"("slug");

-- CreateIndex
CREATE INDEX "winemakers_people_status_sort_order_updated_at_idx" ON "winemakers_people"("status", "sort_order", "updated_at");

-- CreateIndex
CREATE INDEX "winemakers_people_winery_id_idx" ON "winemakers_people"("winery_id");

-- CreateIndex
CREATE INDEX "winemakers_person_relations_related_id_type_idx" ON "winemakers_person_relations"("related_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "winemakers_wineries_slug_key" ON "winemakers_wineries"("slug");

-- CreateIndex
CREATE INDEX "winemakers_wineries_status_updated_at_idx" ON "winemakers_wineries"("status", "updated_at");

-- CreateIndex
CREATE INDEX "winemakers_wineries_region_id_idx" ON "winemakers_wineries"("region_id");

-- CreateIndex
CREATE UNIQUE INDEX "winemakers_regions_slug_key" ON "winemakers_regions"("slug");

-- CreateIndex
CREATE INDEX "winemakers_regions_status_updated_at_idx" ON "winemakers_regions"("status", "updated_at");

-- CreateIndex
CREATE INDEX "winemakers_regions_parent_id_idx" ON "winemakers_regions"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "winemakers_terroirs_slug_key" ON "winemakers_terroirs"("slug");

-- CreateIndex
CREATE INDEX "winemakers_terroirs_status_updated_at_idx" ON "winemakers_terroirs"("status", "updated_at");

-- CreateIndex
CREATE INDEX "winemakers_terroirs_region_id_idx" ON "winemakers_terroirs"("region_id");

-- CreateIndex
CREATE UNIQUE INDEX "winemakers_wines_slug_key" ON "winemakers_wines"("slug");

-- CreateIndex
CREATE INDEX "winemakers_wines_status_updated_at_idx" ON "winemakers_wines"("status", "updated_at");

-- CreateIndex
CREATE INDEX "winemakers_wines_winery_id_idx" ON "winemakers_wines"("winery_id");

-- CreateIndex
CREATE INDEX "winemakers_wines_region_id_idx" ON "winemakers_wines"("region_id");

-- CreateIndex
CREATE INDEX "winemakers_wines_terroir_id_idx" ON "winemakers_wines"("terroir_id");

-- CreateIndex
CREATE INDEX "winemakers_wine_people_person_id_idx" ON "winemakers_wine_people"("person_id");

-- AddForeignKey
ALTER TABLE "winemakers_people" ADD CONSTRAINT "winemakers_people_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winemakers_people" ADD CONSTRAINT "winemakers_people_winery_id_fkey" FOREIGN KEY ("winery_id") REFERENCES "winemakers_wineries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winemakers_person_relations" ADD CONSTRAINT "winemakers_person_relations_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "winemakers_people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winemakers_person_relations" ADD CONSTRAINT "winemakers_person_relations_related_id_fkey" FOREIGN KEY ("related_id") REFERENCES "winemakers_people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winemakers_wineries" ADD CONSTRAINT "winemakers_wineries_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "winemakers_regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winemakers_wineries" ADD CONSTRAINT "winemakers_wineries_logo_id_fkey" FOREIGN KEY ("logo_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winemakers_regions" ADD CONSTRAINT "winemakers_regions_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "winemakers_regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winemakers_terroirs" ADD CONSTRAINT "winemakers_terroirs_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "winemakers_regions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winemakers_wines" ADD CONSTRAINT "winemakers_wines_winery_id_fkey" FOREIGN KEY ("winery_id") REFERENCES "winemakers_wineries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winemakers_wines" ADD CONSTRAINT "winemakers_wines_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "winemakers_regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winemakers_wines" ADD CONSTRAINT "winemakers_wines_terroir_id_fkey" FOREIGN KEY ("terroir_id") REFERENCES "winemakers_terroirs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winemakers_wine_people" ADD CONSTRAINT "winemakers_wine_people_wine_id_fkey" FOREIGN KEY ("wine_id") REFERENCES "winemakers_wines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winemakers_wine_people" ADD CONSTRAINT "winemakers_wine_people_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "winemakers_people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

