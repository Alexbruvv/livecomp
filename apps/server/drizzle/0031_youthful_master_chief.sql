ALTER TABLE "matches" DROP CONSTRAINT "unique_sequence_number";--> statement-breakpoint
ALTER TABLE "matches" DROP CONSTRAINT "matches_match_period_id_match_periods_id_fk";
--> statement-breakpoint
ALTER TABLE "matches" DROP COLUMN IF EXISTS "match_period_id";--> statement-breakpoint
DELETE FROM "auto_match_assignment_configs";--> statement-breakpoint
DELETE FROM "match_assignments";--> statement-breakpoint
DELETE FROM "matches";--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_sequenceNumber_unique" UNIQUE("sequence_number");