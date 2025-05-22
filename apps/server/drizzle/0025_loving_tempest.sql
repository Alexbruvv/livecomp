ALTER TABLE "match_periods" ADD COLUMN "ends_at" timestamp;
ALTER TABLE "match_periods" ADD COLUMN "ends_at_latest" timestamp;

UPDATE "match_periods"
SET "ends_at" = "starts_at",
    "ends_at_latest" = "starts_at";

ALTER TABLE "match_periods" ALTER COLUMN "ends_at" SET NOT NULL;
ALTER TABLE "match_periods" ALTER COLUMN "ends_at_latest" SET NOT NULL;