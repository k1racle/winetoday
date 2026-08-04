-- CreateTable
CREATE TABLE "comment_stop_words" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "word" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comment_stop_words_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "comment_stop_words_word_key" ON "comment_stop_words"("word");

-- Seed: базовый русский мат (корни слов; сравнение — по началу слова)
INSERT INTO "comment_stop_words" ("word") VALUES
  ('хуй'),
  ('пизд'),
  ('еб'),
  ('бляд'),
  ('блят'),
  ('сук'),
  ('муда'),
  ('пидор'),
  ('пидр'),
  ('гандон'),
  ('шлюх'),
  ('залуп'),
  ('манд'),
  ('срак'),
  ('жоп'),
  ('чмо'),
  ('уеб'),
  ('дроч');
