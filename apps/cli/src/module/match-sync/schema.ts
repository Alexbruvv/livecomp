import { z } from "zod";

export const matchFileSchema = z.object({
    matches: z.array(
        z.object({
            name: z.string(),
            type: z.union([z.literal("league"), z.literal("knockout")]),
            sequenceNumber: z.number(),
            assignments: z.record(z.string(), z.string()),
        })
    ),
});

export type MatchFileSchema = z.infer<typeof matchFileSchema>;

