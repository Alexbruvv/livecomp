import { appDb } from "../../db/db";
import { Repository } from "../../db/repository";
import type { AppSchema } from "../../db/schema";
import { type Team, teams } from "../../db/schema/teams";
import { stream } from "../../trpc/stream";

class TeamsRepository extends Repository<AppSchema, AppSchema["teams"], "teams"> {
    async afterCreate(row: Team) {
        stream.broadcastInvalidateMessage("teams", "fetchAll");
        stream.broadcastInvalidateMessage("competitions", "fetchById", { id: row.competitionId });
    }

    async afterUpdate(row: Team) {
        stream.broadcastInvalidateMessage("teams", "fetchAll");
        stream.broadcastInvalidateMessage("teams", "fetchById", { id: row.id });
        stream.broadcastInvalidateMessage("competitions", "fetchById", { id: row.competitionId });
    }

    async afterDelete(row: Team) {
        stream.broadcastInvalidateMessage("teams", "fetchAll");
        stream.broadcastInvalidateMessage("teams", "fetchById", { id: row.id });
        stream.broadcastInvalidateMessage("competitions", "fetchById", { id: row.competitionId });
    }
}

export const teamsRepository = new TeamsRepository(appDb, teams);

