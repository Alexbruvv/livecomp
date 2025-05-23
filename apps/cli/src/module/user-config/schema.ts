import { z } from "zod";

export const userConfigSchema = z.object({
    tokens: z.record(z.string(), z.string().optional()),
});

export type UserConfig = z.infer<typeof userConfigSchema>;

export const defaultUserConfig: UserConfig = {
    tokens: {},
};

