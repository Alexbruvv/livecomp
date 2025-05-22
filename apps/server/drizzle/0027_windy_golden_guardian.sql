ALTER TABLE "match_periods" ALTER COLUMN "type" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "public"."match_periods" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
UPDATE "public"."match_periods" SET "type" = 'knockout' WHERE "type" = 'knockouts';--> statement-breakpoint
DROP TYPE "public"."match_period_type";--> statement-breakpoint
CREATE TYPE "public"."match_period_type" AS ENUM('league', 'knockout');--> statement-breakpoint
ALTER TABLE "public"."match_periods" ALTER COLUMN "type" SET DATA TYPE "public"."match_period_type" USING "type"::"public"."match_period_type";