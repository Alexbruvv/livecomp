CREATE TABLE IF NOT EXISTS "seeded_match_assignment_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"assignment_id" uuid NOT NULL,
	"seed_position" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "seeded_match_assignment_configs" ADD CONSTRAINT "seeded_match_assignment_configs_assignment_id_match_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."match_assignments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
