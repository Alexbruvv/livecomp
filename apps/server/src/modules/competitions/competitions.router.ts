import { z } from "zod";
import { publicProcedure, restrictedProcedure, router } from "../../trpc/trpc";
import { competitions, insertCompetitionSchema, pauses } from "../../db/schema/competitions";
import { competitionsRepository } from "./competitions.repository";
import { and, asc, eq, isNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { teamsRepository } from "../teams/teams.repository";
import { matchesRepository } from "../matches/matches.repository";
import { matchAssignmentsRepository } from "../matchAssignments/matchAssignments.repository";
import { matches, matchPeriods } from "../../db/schema/matches";
import { pausesRepository } from "../pauses/pauses.repository";

export const competitionsRouter = router({
    create: restrictedProcedure({ competition: ["create"] })
        .input(
            z.object({
                data: insertCompetitionSchema,
            })
        )
        .mutation(async ({ input: { data } }) => {
            return await competitionsRepository.create(data);
        }),

    fetchAll: publicProcedure.query(async () => {
        return await competitionsRepository.findMany();
    }),

    fetchById: publicProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .query(async ({ input: { id } }) => {
            return await competitionsRepository.findFirst({
                where: eq(competitions.id, id),
                with: {
                    teams: true,
                    venue: true,
                    game: {
                        with: {
                            startingZones: true,
                        },
                    },
                    matches: {
                        with: {
                            assignments: {
                                with: {
                                    team: true,
                                    autoConfig: true,
                                },
                            },
                            scoreEntry: true,
                        },
                        orderBy: asc(matches.sequenceNumber),
                    },
                    matchPeriods: {
                        orderBy: asc(matchPeriods.startsAt),
                    },
                    pauses: true,
                },
            });
        }),

    update: restrictedProcedure({ competition: ["update"] })
        .input(z.object({ id: z.string(), data: insertCompetitionSchema.partial() }))
        .mutation(async ({ input: { id, data } }) => {
            return await competitionsRepository.update(data, { where: eq(competitions.id, id) });
        }),

    generateTeams: restrictedProcedure({ competition: ["configure"] })
        .input(z.object({ competitionId: z.string(), count: z.number() }))
        .mutation(async ({ input: { competitionId, count } }) => {
            const competition = await competitionsRepository.findFirst({
                where: eq(competitions.id, competitionId),
                with: { game: { with: { startingZones: true } }, venue: { with: { regions: true } } },
            });

            if (!competition) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Competition not found" });
            }

            const region = competition.venue.regions[0];
            if (!region) {
                throw new TRPCError({ code: "NOT_FOUND", message: "No regions found" });
            }

            for (let i = 0; i < count; i++) {
                await teamsRepository.create({
                    name: `Team ${i + 1}`,
                    shortName: `T${(i + 1).toString().padStart(2, "0")}`,
                    competitionId: competitionId,
                    regionId: region.id,
                });
            }
        }),

    importSchedule: restrictedProcedure({ competition: ["configure"] })
        .input(z.object({ id: z.string(), data: z.object({ schedule: z.string() }) }))
        .mutation(async ({ input: { id, data } }) => {
            const competition = await competitionsRepository.findFirst({
                where: eq(competitions.id, id),
                with: { game: { with: { startingZones: true } }, matches: true, teams: true },
            });

            if (!competition) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Competition not found" });
            }

            if (competition.matches.length > 0) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid schedule (matches already exist)" });
            }

            const parsedSchedule = data.schedule
                .split("\n")
                .map((s) => s.trim())
                .map((s) => s.split("|").map((s) => parseInt(s)));

            if (parsedSchedule.some((match) => match.length > competition.game.startingZones.length)) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Invalid schedule (a match exists with too many teams)",
                });
            }

            const teams = competition.teams
                .map((team) => ({ team, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ team }) => team);

            console.log(teams.length);

            let sequenceNumber = 0;

            for (const matchTeamIndexes of parsedSchedule) {
                const match = await matchesRepository.create({
                    name: `Match ${sequenceNumber}`,
                    competitionId: competition.id,
                    sequenceNumber: sequenceNumber,
                });

                if (!match) {
                    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create match" });
                }

                for (let i = 0; i < matchTeamIndexes.length; i++) {
                    matchAssignmentsRepository.create({
                        matchId: match.id,
                        teamId: teams[matchTeamIndexes[i] - 1].id,
                        startingZoneId: competition.game.startingZones[i].id,
                    });
                }

                sequenceNumber++;
            }
        }),

    pause: restrictedProcedure({ competition: ["control"] })
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input: { id } }) => {
            const activePause = await pausesRepository.findFirst({
                where: and(eq(pauses.competitionId, id), isNull(pauses.endsAt)),
            });

            if (activePause) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Competition already paused" });
            }

            await pausesRepository.create({ competitionId: id, startsAt: new Date() });
        }),

    unpause: restrictedProcedure({ competition: ["control"] })
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input: { id } }) => {
            const activePause = await pausesRepository.findFirst({
                where: and(eq(pauses.competitionId, id), isNull(pauses.endsAt)),
            });

            if (!activePause) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Competition not paused" });
            }

            await pausesRepository.update({ endsAt: new Date() }, { where: eq(pauses.id, activePause.id) });
        }),

    delete: restrictedProcedure({ competition: ["delete"] })
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input: { id } }) => {
            return await competitionsRepository.delete({ where: eq(competitions.id, id) });
        }),
});

