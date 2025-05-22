ALTER TABLE "match_assignments" DROP CONSTRAINT "match_assignments_match_id_matches_id_fk";
--> statement-breakpoint
ALTER TABLE "match_assignments" DROP CONSTRAINT "match_assignments_team_id_teams_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "match_assignments" ADD CONSTRAINT "match_assignments_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "match_assignments" ADD CONSTRAINT "match_assignments_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
