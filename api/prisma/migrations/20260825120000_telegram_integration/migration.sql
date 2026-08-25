ALTER TABLE "users"
  ADD COLUMN "telegram_user_id" BIGINT,
  ADD COLUMN "telegram_username" TEXT,
  ADD COLUMN "telegram_linked_at" TIMESTAMP(3);

CREATE UNIQUE INDEX "users_telegram_user_id_key" ON "users"("telegram_user_id");

CREATE TABLE "telegram_link_tokens" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "token_hash" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "used_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "telegram_link_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "telegram_link_tokens_token_hash_key" ON "telegram_link_tokens"("token_hash");
CREATE INDEX "telegram_link_tokens_user_id_idx" ON "telegram_link_tokens"("user_id");
CREATE INDEX "telegram_link_tokens_expires_at_idx" ON "telegram_link_tokens"("expires_at");

ALTER TABLE "telegram_link_tokens"
  ADD CONSTRAINT "telegram_link_tokens_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
