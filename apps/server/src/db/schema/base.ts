import { timestamp, uuid } from "drizzle-orm/pg-core";

export const baseColumns = {
    id: uuid().defaultRandom().primaryKey().notNull(),
    createdAt: timestamp({ withTimezone: false }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: false })
        .defaultNow()
        .$onUpdate(() => new Date()),
};

