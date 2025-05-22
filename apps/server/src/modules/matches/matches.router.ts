import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { autoMatchAssignmentConfigs, insertMatchSchema, matchAssignments, matches } from "../../db/schema/matches";
import { publicProcedure, restrictedProcedure, router } from "../../trpc/trpc";
import { matchesRepository } from "./matches.repository";
import { TRPCError } from "@trpc/server";
import { matchAssignmentsRepository } from "../matchAssignments/matchAssignments.repository";
import { autoMatchAssignmentConfigsRepository } from "../matchAssignments/autoMatchAssignmentConfigs.repository";

export const matchesRouter = router({
    create: restrictedProcedure("admin")
        .input(z.object({ data: insertMatchSchema }))
        .mutation(async ({ input: { data } }) => {
            return await matchesRepository.create(data);
        }),

    fetchAll: publicProcedure
        .input(
            z
                .object({
                    filters: z
                        .object({
                            teamId: z.string(),
                            competitionId: z.string(),
                        })
                        .partial(),
                })
                .partial()
                .optional()
        )
        .query(async ({ input }) => {
            const conditions = [];

            if (input?.filters?.competitionId) {
                conditions.push(eq(matches.competitionId, input.filters.competitionId));
            }

            let fetchedMatches = await matchesRepository.findMany({
                where: and(...conditions),
                with: {
                    assignments: {
                        with: {
                            team: true,
                        },
                    },
                },
            });

            if (input?.filters?.teamId) {
                fetchedMatches = fetchedMatches.filter((match) =>
                    match.assignments.some((assignment) => assignment.teamId === input!.filters!.teamId)
                );
            }

            return fetchedMatches;
        }),

    fetchById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input: { id } }) => {
        return await matchesRepository.findFirst({
            where: eq(matches.id, id),
            with: { assignments: { with: { team: true, autoConfig: true } }, scoreEntry: true },
        });
    }),

    update: restrictedProcedure("admin")
        .input(
            z.object({
                id: z.string(),
                data: insertMatchSchema.partial(),
            })
        )
        .mutation(async ({ input: { id, data } }) => {
            return await matchesRepository.update(data, { where: eq(matches.id, id) });
        }),

    updateAssignments: restrictedProcedure("admin")
        .input(
            z.object({
                id: z.string(),
                assignments: z.record(
                    z.string(),
                    z.union([
                        z.object({ type: z.literal("none") }),
                        z.object({
                            type: z.literal("team"),
                            teamId: z.string(),
                        }),
                        z.object({
                            type: z.literal("auto"),
                            targetMatchId: z.string().nullable(),
                            position: z.number().min(0),
                        }),
                    ])
                ),
            })
        )
        .mutation(async ({ input: { id, assignments } }) => {
            const match = await matchesRepository.findFirst({
                where: eq(matches.id, id),
                with: { assignments: { with: { autoConfig: true } } },
            });

            if (!match) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Match not found" });
            }

            const promises = [];

            // Remove assignments that are not in the new list
            for (const assignment of match.assignments) {
                if (!(assignment.startingZoneId in assignments)) {
                    promises.push(matchAssignmentsRepository.delete({ where: eq(matchAssignments.id, assignment.id) }));
                }
            }

            // Update assignments
            for (const startingZoneId in assignments) {
                const newAssignment = assignments[startingZoneId]!;

                const assignment = match.assignments.find((a) => a.startingZoneId === startingZoneId);

                if (newAssignment.type === "none") {
                    if (assignment?.autoConfig) {
                        promises.push(
                            autoMatchAssignmentConfigsRepository.delete({
                                where: eq(autoMatchAssignmentConfigs.assignmentId, assignment.id),
                            })
                        );
                    }
                    if (assignment) {
                        promises.push(
                            matchAssignmentsRepository.update(
                                { teamId: null },
                                { where: eq(matchAssignments.id, assignment.id) }
                            )
                        );
                    }
                } else if (newAssignment.type === "team") {
                    if (assignment) {
                        promises.push(
                            matchAssignmentsRepository.update(
                                { teamId: newAssignment.teamId },
                                { where: eq(matchAssignments.id, assignment.id) }
                            )
                        );
                        autoMatchAssignmentConfigsRepository.delete({
                            where: eq(autoMatchAssignmentConfigs.assignmentId, assignment.id),
                        });
                    } else {
                        promises.push(
                            matchAssignmentsRepository.create({
                                matchId: match.id,
                                startingZoneId,
                                teamId: newAssignment.teamId,
                            })
                        );
                    }
                } else {
                    let assignmentId = assignment?.id ?? "";

                    if (!assignment) {
                        const insertedAssignment = await matchAssignmentsRepository.create({
                            matchId: match.id,
                            startingZoneId,
                            teamId: null,
                        });

                        if (!insertedAssignment) {
                            throw new TRPCError({
                                code: "INTERNAL_SERVER_ERROR",
                                message: "Failed to create assignment",
                            });
                        }

                        assignmentId = insertedAssignment.id;
                    }

                    if (assignment?.autoConfig) {
                        promises.push(
                            autoMatchAssignmentConfigsRepository.update(
                                {
                                    targetMatchId: newAssignment.targetMatchId,
                                    position: newAssignment.position,
                                },
                                { where: eq(autoMatchAssignmentConfigs.assignmentId, assignment.id) }
                            )
                        );
                    } else {
                        promises.push(
                            autoMatchAssignmentConfigsRepository.create({
                                assignmentId: assignmentId,
                                targetMatchId: newAssignment.targetMatchId,
                                position: newAssignment.position,
                            })
                        );
                    }

                    promises.push(
                        matchAssignmentsRepository.update(
                            { teamId: null },
                            { where: eq(matchAssignments.id, assignmentId) }
                        )
                    );
                }
            }

            await Promise.all(promises);
        }),

    delete: restrictedProcedure("admin")
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input: { id } }) => {
            return await matchesRepository.delete({ where: eq(matches.id, id) });
        }),
});

