CREATE TYPE "public"."scorer" AS ENUM('nuclear_cleanup');--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "scorer" "scorer";