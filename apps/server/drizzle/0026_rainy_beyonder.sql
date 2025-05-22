CREATE TYPE "public"."match_type" AS ENUM('league', 'knockout');--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "type" "match_type" DEFAULT 'league' NOT NULL;