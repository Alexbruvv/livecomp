ALTER TABLE "games" ADD COLUMN "staging_open_offset" integer DEFAULT 300 NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "staging_close_offset" integer DEFAULT 150 NOT NULL;