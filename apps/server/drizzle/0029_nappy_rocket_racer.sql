ALTER TABLE "match_periods" ALTER COLUMN "type" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "public"."match_periods" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."match_period_type";--> statement-breakpoint
ALTER TABLE "public"."match_periods" ALTER COLUMN "type" SET DATA TYPE "public"."match_type" USING "type"::"public"."match_type";--> statement-breakpoint
ALTER TABLE "match_periods" ALTER COLUMN "type" SET DEFAULT 'league';