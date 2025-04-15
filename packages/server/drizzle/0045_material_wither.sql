ALTER TABLE "matches" ADD COLUMN "released_at" timestamp;--> statement-breakpoint
ALTER TABLE "matches" DROP COLUMN IF EXISTS "released";