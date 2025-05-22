ALTER TABLE "offsets" DROP CONSTRAINT "offsets_match_period_id_match_periods_id_fk";
--> statement-breakpoint
ALTER TABLE "pauses" DROP CONSTRAINT "pauses_match_period_id_match_periods_id_fk";
--> statement-breakpoint
ALTER TABLE "offsets" ADD COLUMN "competition_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "pauses" ADD COLUMN "competition_id" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "offsets" ADD CONSTRAINT "offsets_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pauses" ADD CONSTRAINT "pauses_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "offsets" DROP COLUMN IF EXISTS "match_period_id";--> statement-breakpoint
ALTER TABLE "pauses" DROP COLUMN IF EXISTS "match_period_id";