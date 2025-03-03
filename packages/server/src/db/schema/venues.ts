import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { baseColumns } from "./base";
import { relations, sql, type InferSelectModel } from "drizzle-orm";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";

export const venues = pgTable("venues", {
    ...baseColumns,

    name: varchar().notNull(),
});

export const venuesRelations = relations(venues, ({ many }) => ({
    regions: many(regions),
    shepherds: many(shepherds),
}));

export const venueSchema = createSelectSchema(venues);
export const insertVenueSchema = createInsertSchema(venues);
export type Venue = InferSelectModel<typeof venues>;

export const regions = pgTable("regions", {
    ...baseColumns,

    name: varchar().notNull(),

    venueId: uuid()
        .references(() => venues.id)
        .notNull(),
});

export const regionsRelations = relations(regions, ({ one }) => ({
    venue: one(venues, { fields: [regions.venueId], references: [venues.id] }),
}));

export const regionSchema = createSelectSchema(regions);
export const insertRegionSchema = createInsertSchema(regions);
export type Region = InferSelectModel<typeof regions>;

export const shepherds = pgTable("shepherds", {
    ...baseColumns,

    name: varchar().notNull(),

    venueId: uuid()
        .references(() => venues.id)
        .notNull(),

    regionIds: uuid()
        .array()
        .notNull()
        .default(sql`ARRAY[]::uuid[]`),
});

export const shepherdsRelations = relations(shepherds, ({ one }) => ({
    venue: one(venues, { fields: [shepherds.venueId], references: [venues.id] }),
}));

export const shepherdSchema = createSelectSchema(shepherds);
export const insertShepherdSchema = createInsertSchema(shepherds);
export type Shepherd = InferSelectModel<typeof shepherds>;

