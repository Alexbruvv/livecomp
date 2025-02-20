import { integer, json, pgEnum, pgTable, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { baseColumns } from "./base";
import { competitions } from "./competitions";
import { relations, type InferSelectModel } from "drizzle-orm";
import { teams } from "./teams";
import { startingZones } from "./games";
import { matchScoreEntries } from "./scores";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";

export const matchType = pgEnum("match_type", ["league", "knockout"]);

export const matchPeriods = pgTable("match_periods", {
    ...baseColumns,

    name: varchar().notNull(),
    type: matchType().notNull().default("league"),

    startsAt: timestamp({ withTimezone: false }).notNull(),
    endsAt: timestamp({ withTimezone: false }).notNull(),
    endsAtLatest: timestamp({ withTimezone: false }).notNull(),

    competitionId: uuid()
        .references(() => competitions.id)
        .notNull(),
});

export const matchPeriodsRelations = relations(matchPeriods, ({ one, many }) => ({
    competition: one(competitions, { fields: [matchPeriods.competitionId], references: [competitions.id] }),
}));

export const matchPeriodSchema = createSelectSchema(matchPeriods);
export const insertMatchPeriodSchema = createInsertSchema(matchPeriods);
export type MatchPeriod = InferSelectModel<typeof matchPeriods>;

export const matches = pgTable(
    "matches",
    {
        ...baseColumns,

        name: varchar().notNull(),
        type: matchType().notNull().default("league"),

        competitionId: uuid()
            .references(() => competitions.id)
            .notNull(),

        sequenceNumber: integer().notNull(),
    },
    (matches) => ({
        uniqueSequenceNumber: unique("unique_sequence_number").on(matches.competitionId, matches.sequenceNumber),
    })
);

export const matchesRelations = relations(matches, ({ one, many }) => ({
    dependentAssignmentConfigs: many(autoMatchAssignmentConfigs),
    scoreEntry: one(matchScoreEntries),
    assignments: many(matchAssignments),
    competition: one(competitions, { fields: [matches.competitionId], references: [competitions.id] }),
}));

export const matchSchema = createSelectSchema(matches);
export const insertMatchSchema = createInsertSchema(matches);
export type Match = InferSelectModel<typeof matches>;

export const matchAssignments = pgTable(
    "match_assignments",
    {
        ...baseColumns,

        matchId: uuid()
            .references(() => matches.id, { onDelete: "cascade" })
            .notNull(),

        teamId: uuid().references(() => teams.id, { onDelete: "cascade" }),

        gamePoints: integer().default(0),

        startingZoneId: uuid()
            .references(() => startingZones.id)
            .notNull(),
    },
    (matchAssignments) => ({
        uniqueTeam: unique("unique_team").on(matchAssignments.matchId, matchAssignments.teamId),
        uniqueStartingZone: unique("unique_starting_zone").on(
            matchAssignments.matchId,
            matchAssignments.startingZoneId
        ),
    })
);

export const matchAssignmentsRelations = relations(matchAssignments, ({ one }) => ({
    match: one(matches, { fields: [matchAssignments.matchId], references: [matches.id] }),
    team: one(teams, { fields: [matchAssignments.teamId], references: [teams.id] }),
    autoConfig: one(autoMatchAssignmentConfigs),
}));

export const matchAssignmentSchema = createSelectSchema(matchAssignments);
export const insertMatchAssignmentSchema = createInsertSchema(matchAssignments);
export type MatchAssignment = InferSelectModel<typeof matchAssignments>;

export const autoMatchAssignmentConfigs = pgTable("auto_match_assignment_configs", {
    ...baseColumns,

    assignmentId: uuid()
        .references(() => matchAssignments.id)
        .notNull(),

    targetMatchId: uuid().references(() => matches.id), // If null, position is the league position

    position: integer().notNull(), // 0 is the winner, 1 is the runner-up etc.
});

export const autoMatchAssignmentConfigsRelations = relations(autoMatchAssignmentConfigs, ({ one }) => ({
    assignment: one(matchAssignments, {
        fields: [autoMatchAssignmentConfigs.assignmentId],
        references: [matchAssignments.id],
    }),
    targetMatch: one(matches, { fields: [autoMatchAssignmentConfigs.targetMatchId], references: [matches.id] }),
}));

export const autoMatchAssignmentConfigSchema = createSelectSchema(autoMatchAssignmentConfigs);
export const insertAutoMatchAssignmentConfigSchema = createInsertSchema(autoMatchAssignmentConfigs);
export type AutoMatchAssignmentConfig = InferSelectModel<typeof autoMatchAssignmentConfigs>;

