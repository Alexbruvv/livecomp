ALTER TABLE "match_score_entries" DROP CONSTRAINT "match_score_entries_match_id_matches_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "match_score_entries" ADD CONSTRAINT "match_score_entries_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
