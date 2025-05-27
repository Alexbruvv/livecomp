ALTER TABLE "user_passwords" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "user_passwords" CASCADE;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
ALTER TABLE "manual_points_adjustments" DROP COLUMN IF EXISTS "issuer_id";--> statement-breakpoint
DROP TYPE "public"."role";