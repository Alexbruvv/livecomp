import { boolean, integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { baseColumns } from "./base";
import { relations, type InferSelectModel } from "drizzle-orm";
import { games } from "./games";
import { matches, matchPeriods } from "./matches";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { teams } from "./teams";
import { venues } from "./venues";

export const competitions = pgTable("competitions", {
    ...baseColumns,

    name: varchar().notNull(),
    shortName: varchar().unique().notNull(),
    startsAt: timestamp({ withTimezone: false }).notNull(),
    endsAt: timestamp({ withTimezone: false }).notNull(),

    matchHoldOffset: integer().default(30).notNull(),

    acceptingNewDisplays: boolean().default(false).notNull(),

    gameId: uuid().notNull(),
    venueId: uuid().notNull(),
});

export const competitionsRelations = relations(competitions, ({ one, many }) => ({
    game: one(games, { fields: [competitions.gameId], references: [games.id] }),
    venue: one(venues, { fields: [competitions.venueId], references: [venues.id] }),
    matchPeriods: many(matchPeriods),
    matches: many(matches),
    teams: many(teams),
    pauses: many(pauses),
}));

export const competitionSchema = createSelectSchema(competitions);
export const insertCompetitionSchema = createInsertSchema(competitions);
export type Competition = InferSelectModel<typeof competitions>;

export const pauses = pgTable("pauses", {
    ...baseColumns,

    competitionId: uuid()
        .references(() => competitions.id)
        .notNull(),

    startsAt: timestamp({ withTimezone: false }).notNull(),
    endsAt: timestamp({ withTimezone: false }),
});

export const pausesRelations = relations(pauses, ({ one }) => ({
    competition: one(competitions, { fields: [pauses.competitionId], references: [competitions.id] }),
}));

export const pauseSchema = createSelectSchema(pauses);
export const insertPauseSchema = createInsertSchema(pauses);
export type Pause = InferSelectModel<typeof pauses>;

