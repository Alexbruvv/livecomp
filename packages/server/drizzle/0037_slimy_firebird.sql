ALTER TABLE "match_score_entries" DROP CONSTRAINT "match_score_entries_scorer_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "match_score_entries" DROP COLUMN IF EXISTS "scorer_id";