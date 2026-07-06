-- Drop old combined offset columns
ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "watermark_offset_x_percent";
ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "watermark_offset_y_percent";

-- Add per-side offset columns
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "watermark_offset_top_percent" DOUBLE PRECISION NOT NULL DEFAULT 4;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "watermark_offset_right_percent" DOUBLE PRECISION NOT NULL DEFAULT 4;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "watermark_offset_bottom_percent" DOUBLE PRECISION NOT NULL DEFAULT 4;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "watermark_offset_left_percent" DOUBLE PRECISION NOT NULL DEFAULT 4;
