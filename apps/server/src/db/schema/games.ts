import { integer, pgEnum, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { baseColumns } from "./base";
import { relations, type InferSelectModel } from "drizzle-orm";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";

export const scorer = pgEnum("scorer", ["nuclear_cleanup"]);
export type Scorer = (typeof scorer.enumValues)[number];

export const games = pgTable("games", {
    ...baseColumns,

    name: varchar().notNull(),
    matchDuration: integer().notNull(),
    defaultMatchSpacing: integer().notNull(),
    stagingOpenOffset: integer().default(300).notNull(),
    stagingCloseOffset: integer().default(150).notNull(),

    scorer: scorer(),
});

export const gamesRelations = relations(games, ({ many }) => ({
    startingZones: many(startingZones),
}));

export const gameSchema = createSelectSchema(games);
export const insertGameSchema = createInsertSchema(games);
export type Game = InferSelectModel<typeof games>;

export const startingZones = pgTable("starting_zones", {
    ...baseColumns,

    name: varchar().notNull(),
    color: varchar().notNull(),

    gameId: uuid()
        .references(() => games.id, { onDelete: "cascade" })
        .notNull(),
});

export const startingZonesRelations = relations(startingZones, ({ one }) => ({
    game: one(games, { fields: [startingZones.gameId], references: [games.id] }),
}));

export const startingZoneSchema = createSelectSchema(startingZones);
export const insertStartingZoneSchema = createInsertSchema(startingZones);
export type StartingZone = InferSelectModel<typeof startingZones>;

