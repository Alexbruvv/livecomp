ALTER TABLE "seeded_match_assignment_configs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "seeded_match_assignment_configs" CASCADE;--> statement-breakpoint
ALTER TABLE "auto_match_assignment_configs" ALTER COLUMN "target_match_id" DROP NOT NULL;