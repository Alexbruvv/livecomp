import { pgEnum, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { baseColumns } from "./base";
import { relations, type InferSelectModel } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const role = pgEnum("role", ["viewer", "scorer", "admin", "sysadmin"]);
export const roleSchema = z.enum(["viewer", "scorer", "admin", "sysadmin"]);
export type Role = (typeof role.enumValues)[number];

export const roleMappings: Record<Role, Role[]> = {
    viewer: [],
    scorer: ["viewer"],
    admin: ["scorer", "viewer"],
    sysadmin: ["admin", "scorer", "viewer"],
};

export const users = pgTable("users", {
    ...baseColumns,

    name: varchar().notNull(),
    username: varchar().notNull().unique(),

    role: role().default("viewer").notNull(),
});

export const usersRelations = relations(users, ({ one }) => ({
    password: one(userPasswords),
}));

export const userSchema = createSelectSchema(users);
export const insertUserSchema = createInsertSchema(users);
export type User = InferSelectModel<typeof users>;

export const userPasswords = pgTable("user_passwords", {
    ...baseColumns,

    userId: uuid()
        .unique()
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),

    passwordHash: varchar().notNull(),
});

export const userPasswordsRelations = relations(userPasswords, ({ one }) => ({
    user: one(users, { fields: [userPasswords.userId], references: [users.id], relationName: "userPassword" }),
}));

export const userPasswordSchema = createSelectSchema(userPasswords);
export const insertUserPasswordSchema = createInsertSchema(userPasswords);
export type UserPassword = InferSelectModel<typeof userPasswords>;

