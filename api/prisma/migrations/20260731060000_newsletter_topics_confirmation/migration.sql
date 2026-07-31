-- AlterTable
ALTER TABLE "newsletter_subscribers" ADD COLUMN "confirmed_at" TIMESTAMP(3),
ADD COLUMN "topics" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
