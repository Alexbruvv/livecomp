import { boolean, json, pgTable, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { baseColumns } from "./base";
import { relations, type InferSelectModel } from "drizzle-orm";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { competitions } from "./competitions";
import { z } from "zod";

const configurationSchema = z.union([
    z.object({
        mode: z.literal("identify"),
    }),
    z.object({
        mode: z.literal("arena"),
        startingZoneId: z.string(),
    }),
    z.object({
        mode: z.literal("outside"),
    }),
    z.object({
        mode: z.literal("staging"),
    }),
    z.object({
        mode: z.literal("empty"),
    }),
]);

export const displays = pgTable(
    "displays",
    {
        ...baseColumns,

        name: varchar().notNull(),
        competitionId: uuid()
            .references(() => competitions.id)
            .notNull(),
        identifier: varchar().notNull(),
        configuration: json().$type<z.infer<typeof configurationSchema>>().default({ mode: "identify" }).notNull(),

        online: boolean().default(false).notNull(),
        lastHeartbeat: timestamp(),
    },
    (displays) => ({
        uniqueIdentifier: unique("unique_display_identifier").on(displays.identifier, displays.competitionId),
    })
);

export const displaysRelations = relations(displays, ({ one }) => ({
    competition: one(competitions, { fields: [displays.competitionId], references: [competitions.id] }),
}));

export const displaySchema = createSelectSchema(displays, {
    configuration: configurationSchema,
});
export const insertDisplaySchema = createInsertSchema(displays, {
    configuration: configurationSchema,
});
export type Display = InferSelectModel<typeof displays>;

