import { pgTable, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { baseColumns } from "./base";
import { regions } from "./venues";
import { competitions } from "./competitions";
import { relations, type InferSelectModel } from "drizzle-orm";
import { manualPointsAdjustments } from "./scores";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";

export const teams = pgTable(
    "teams",
    {
        ...baseColumns,

        name: varchar().notNull(),
        shortName: varchar().notNull(),

        regionId: uuid()
            .references(() => regions.id)
            .notNull(),

        competitionId: uuid()
            .references(() => competitions.id)
            .notNull(),
    },
    (teams) => ({
        uniqueShortName: unique("unique_short_name").on(teams.shortName, teams.competitionId),
    })
);

export const teamsRelations = relations(teams, ({ one, many }) => ({
    region: one(regions, { fields: [teams.regionId], references: [regions.id] }),
    competition: one(competitions, { fields: [teams.competitionId], references: [competitions.id] }),
    pointsAdjustments: many(manualPointsAdjustments),
}));

export const teamSchema = createSelectSchema(teams);
export const insertTeamSchema = createInsertSchema(teams);
export type Team = InferSelectModel<typeof teams>;

