import z from "zod";

const gameConfig = z.object({
    name: z.string().min(1),
    startingZones: z.array(
        z.object({
            name: z.string().min(1),
            cssColor: z.string().min(1),
        }),
    ),
});

const teamReference = z.union([
    z.object({
        type: z.literal("id"),
        id: z.cuid2(),
    }),
    z.object({
        type: z.literal("shortName"),
        name: z.string().min(1),
    }),
]);

const team = z.object({
    id: z.cuid2(),
    name: z.string().min(1),
    shortName: z.string().min(1),
});

const matchGroup = z.object({
    id: z.cuid2(),
    name: z.string().min(1),
});

const competition = z.object({
    id: z.cuid2(),
    name: z.string().min(1),
    slug: z.string().min(1),
    startDate: z.date(),
    endDate: z.date(),
    teams: z.array(team),
    gameConfig,
});

export const schema = {
    competition,
};

