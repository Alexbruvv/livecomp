import { z } from "zod";

export const configSchema = z.object({
    instance: z.object({
        server_url: z.string().url(),
    }),

    config: z.object({
        competition_id: z.string().optional(),
    }),
});
export type Config = z.infer<typeof configSchema>;

export const defaultConfig: Config = {
    instance: {
        server_url: "http://localhost:3000",
    },
    config: {
        competition_id: undefined,
    },
};

