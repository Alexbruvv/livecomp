CREATE TYPE "public"."display_page" AS ENUM('home');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "display_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "displays" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"name" varchar NOT NULL,
	"description" varchar NOT NULL,
	"page" "display_page" NOT NULL,
	"display_group_id" uuid
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "displays" ADD CONSTRAINT "displays_display_group_id_display_groups_id_fk" FOREIGN KEY ("display_group_id") REFERENCES "public"."display_groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
