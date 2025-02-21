import { integer, json, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { baseColumns } from "./base";
import { users } from "./auth";
import { matches } from "./matches";
import { relations, type InferSelectModel } from "drizzle-orm";
import { teams } from "./teams";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";

export const matchScoreEntries = pgTable("match_score_entries", {
    ...baseColumns,

    matchId: uuid()
        .references(() => matches.id, { onDelete: "cascade" })
        .notNull(),

    gamePoints: json().$type<Record<string, number>>().notNull(), // Maps team ID -> game points
    leaguePoints: json().$type<Record<string, number>>().notNull(), // Maps team ID -> league points
    scoreData: json().notNull(),
});

export const matchScoreEntriesRelations = relations(matchScoreEntries, ({ one }) => ({
    match: one(matches, { fields: [matchScoreEntries.matchId], references: [matches.id] }),
}));

export const matchScoreEntrySchema = createSelectSchema(matchScoreEntries);
export const insertMatchScoreEntrySchema = createInsertSchema(matchScoreEntries);
export type MatchScoreEntry = InferSelectModel<typeof matchScoreEntries>;

export const manualPointsAdjustments = pgTable("manual_points_adjustments", {
    ...baseColumns,

    issuerId: uuid()
        .references(() => users.id)
        .notNull(),

    teamId: uuid()
        .references(() => teams.id)
        .notNull(),

    leaguePoints: integer().notNull(),

    reason: varchar().notNull(),
});

export const manualPointsAdjustmentsRelations = relations(manualPointsAdjustments, ({ one }) => ({
    issuer: one(users, { fields: [manualPointsAdjustments.issuerId], references: [users.id] }),
    team: one(teams, { fields: [manualPointsAdjustments.teamId], references: [teams.id] }),
}));

export const manualPointsAdjustmentSchema = createSelectSchema(manualPointsAdjustments);
export const insertManualPointsAdjustmentSchema = createInsertSchema(manualPointsAdjustments);
export type ManualPointsAdjustment = InferSelectModel<typeof manualPointsAdjustments>;

