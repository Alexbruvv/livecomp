CREATE TABLE IF NOT EXISTS "pauses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"match_period_id" uuid NOT NULL,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pauses" ADD CONSTRAINT "pauses_match_period_id_match_periods_id_fk" FOREIGN KEY ("match_period_id") REFERENCES "public"."match_periods"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
