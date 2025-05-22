ALTER TABLE "display_groups" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "display_groups" CASCADE;--> statement-breakpoint
--> statement-breakpoint
ALTER TABLE "displays" ADD COLUMN "competition_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "displays" ADD COLUMN "identifier" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "displays" ADD COLUMN "route" varchar NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "displays" ADD CONSTRAINT "displays_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "displays" DROP COLUMN IF EXISTS "page";--> statement-breakpoint
ALTER TABLE "displays" DROP COLUMN IF EXISTS "display_group_id";--> statement-breakpoint
ALTER TABLE "displays" ADD CONSTRAINT "unique_display_identifier" UNIQUE("identifier","competition_id");--> statement-breakpoint
DROP TYPE "public"."display_page";