CREATE TABLE "content_item_people" (
    "content_item_id" UUID NOT NULL,
    "person_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_item_people_pkey" PRIMARY KEY ("content_item_id","person_id")
);

CREATE TABLE "content_item_terroirs" (
    "content_item_id" UUID NOT NULL,
    "terroir_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_item_terroirs_pkey" PRIMARY KEY ("content_item_id","terroir_id")
);

CREATE INDEX "content_item_people_person_id_idx" ON "content_item_people"("person_id");
CREATE INDEX "content_item_terroirs_terroir_id_idx" ON "content_item_terroirs"("terroir_id");

ALTER TABLE "content_item_people"
    ADD CONSTRAINT "content_item_people_content_item_id_fkey"
    FOREIGN KEY ("content_item_id") REFERENCES "content_items"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "content_item_people"
    ADD CONSTRAINT "content_item_people_person_id_fkey"
    FOREIGN KEY ("person_id") REFERENCES "winemakers_people"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "content_item_terroirs"
    ADD CONSTRAINT "content_item_terroirs_content_item_id_fkey"
    FOREIGN KEY ("content_item_id") REFERENCES "content_items"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "content_item_terroirs"
    ADD CONSTRAINT "content_item_terroirs_terroir_id_fkey"
    FOREIGN KEY ("terroir_id") REFERENCES "winemakers_terroirs"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
