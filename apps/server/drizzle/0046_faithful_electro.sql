ALTER TABLE "matches" ADD COLUMN "released" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "matches" DROP COLUMN IF EXISTS "released_at";