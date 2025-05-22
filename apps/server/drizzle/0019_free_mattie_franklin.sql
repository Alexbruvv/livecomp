ALTER TABLE "displays" ADD COLUMN "configuration" json DEFAULT '{"mode":"outside"}'::json NOT NULL;--> statement-breakpoint
ALTER TABLE "displays" DROP COLUMN IF EXISTS "route";