ALTER TABLE "users" DROP CONSTRAINT "users_username_unique";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "username";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "display_username";