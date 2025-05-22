CREATE TYPE "public"."match_period_type" AS ENUM('league', 'knockouts');--> statement-breakpoint
ALTER TABLE "match_periods" ADD COLUMN "type" "match_period_type" DEFAULT 'league' NOT NULL;--> statement-breakpoint
ALTER TABLE "matches" DROP COLUMN IF EXISTS "type";--> statement-breakpoint
DROP TYPE "public"."match_type";