import { eq } from "drizzle-orm";
import { Repository } from "../../db/repository";
import type { AppSchema } from "../../db/schema";
import type { ManualPointsAdjustment } from "../../server";
import { stream } from "../../trpc/stream";
import { teamsRepository } from "../teams/teams.repository";
import { teams } from "../../db/schema/teams";
import { appDb } from "../../db/db";
import { manualPointsAdjustments } from "../../db/schema/scores";

class PointsAdjustmentsRepository extends Repository<
    AppSchema,
    AppSchema["manualPointsAdjustments"],
    "manualPointsAdjustments"
> {
    async afterCreate(row: ManualPointsAdjustment) {
        const team = await teamsRepository.findFirst({ where: eq(teams.id, row.teamId) });
        if (!team) throw new Error(`Team with ID ${row.teamId} not found`);

        stream.broadcastInvalidateMessage("competitions", "fetchById", { id: team.competitionId });
    }

    async afterUpdate(row: ManualPointsAdjustment) {
        const team = await teamsRepository.findFirst({ where: eq(teams.id, row.teamId) });
        if (!team) throw new Error(`Team with ID ${row.teamId} not found`);

        stream.broadcastInvalidateMessage("competitions", "fetchById", { id: team.competitionId });
    }

    async afterDelete(row: ManualPointsAdjustment) {
        const team = await teamsRepository.findFirst({ where: eq(teams.id, row.teamId) });
        if (!team) throw new Error(`Team with ID ${row.teamId} not found`);

        stream.broadcastInvalidateMessage("competitions", "fetchById", { id: team.competitionId });
    }
}

export const pointsAdjustmentsRepository = new PointsAdjustmentsRepository(appDb, manualPointsAdjustments);

