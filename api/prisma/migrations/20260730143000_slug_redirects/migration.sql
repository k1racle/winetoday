-- CreateTable
CREATE TABLE "slug_redirects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "from_path" TEXT NOT NULL,
    "to_path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "slug_redirects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "slug_redirects_from_path_key" ON "slug_redirects"("from_path");
