ALTER TABLE "competitions" DROP CONSTRAINT "competitions_displayToken_unique";--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "accepting_new_displays" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "competitions" DROP COLUMN IF EXISTS "display_token";