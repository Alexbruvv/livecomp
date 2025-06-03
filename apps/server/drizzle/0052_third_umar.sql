ALTER TABLE "pauses" DROP CONSTRAINT "pauses_competition_id_competitions_id_fk";
--> statement-breakpoint
ALTER TABLE "displays" DROP CONSTRAINT "displays_competition_id_competitions_id_fk";
--> statement-breakpoint
ALTER TABLE "manual_points_adjustments" DROP CONSTRAINT "manual_points_adjustments_team_id_teams_id_fk";
--> statement-breakpoint
ALTER TABLE "match_score_entries" DROP CONSTRAINT "match_score_entries_match_id_matches_id_fk";
--> statement-breakpoint
ALTER TABLE "starting_zones" DROP CONSTRAINT "starting_zones_game_id_games_id_fk";
--> statement-breakpoint
ALTER TABLE "teams" DROP CONSTRAINT "teams_region_id_regions_id_fk";
--> statement-breakpoint
ALTER TABLE "teams" DROP CONSTRAINT "teams_competition_id_competitions_id_fk";
--> statement-breakpoint
ALTER TABLE "regions" DROP CONSTRAINT "regions_venue_id_venues_id_fk";
--> statement-breakpoint
ALTER TABLE "shepherds" DROP CONSTRAINT "shepherds_venue_id_venues_id_fk";
--> statement-breakpoint
ALTER TABLE "auto_match_assignment_configs" DROP CONSTRAINT "auto_match_assignment_configs_assignment_id_match_assignments_id_fk";
--> statement-breakpoint
ALTER TABLE "match_assignments" DROP CONSTRAINT "match_assignments_match_id_matches_id_fk";
--> statement-breakpoint
ALTER TABLE "match_assignments" DROP CONSTRAINT "match_assignments_team_id_teams_id_fk";
--> statement-breakpoint
ALTER TABLE "match_periods" DROP CONSTRAINT "match_periods_competition_id_competitions_id_fk";
--> statement-breakpoint
ALTER TABLE "matches" DROP CONSTRAINT "matches_competition_id_competitions_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "competitions" ADD CONSTRAINT "competitions_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "competitions" ADD CONSTRAINT "competitions_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pauses" ADD CONSTRAINT "pauses_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "displays" ADD CONSTRAINT "displays_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "manual_points_adjustments" ADD CONSTRAINT "manual_points_adjustments_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "match_score_entries" ADD CONSTRAINT "match_score_entries_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "starting_zones" ADD CONSTRAINT "starting_zones_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teams" ADD CONSTRAINT "teams_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teams" ADD CONSTRAINT "teams_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "regions" ADD CONSTRAINT "regions_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shepherds" ADD CONSTRAINT "shepherds_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auto_match_assignment_configs" ADD CONSTRAINT "auto_match_assignment_configs_assignment_id_match_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."match_assignments"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "match_assignments" ADD CONSTRAINT "match_assignments_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "match_assignments" ADD CONSTRAINT "match_assignments_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "match_periods" ADD CONSTRAINT "match_periods_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "matches" ADD CONSTRAINT "matches_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
