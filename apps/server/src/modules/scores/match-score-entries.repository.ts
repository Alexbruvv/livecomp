import { eq } from "drizzle-orm";
import { appDb } from "../../db/db";
import { Repository } from "../../db/repository";
import type { AppSchema } from "../../db/schema";
import { matchScoreEntries, type MatchScoreEntry } from "../../db/schema/scores";
import { stream } from "../../trpc/stream";
import { getFullCompetition } from "../competitions/query";
import { matchesRepository } from "../matches/matches.repository";
import { matches } from "../../db/schema/matches";
import { CompetitionClock } from "@livecomp/utils";
import { hooks } from "../../tasks/hooks";

class MatchScoreEntriesRepository extends Repository<AppSchema, AppSchema["matchScoreEntries"], "matchScoreEntries"> {
    private async triggerScoresPublished(row: MatchScoreEntry) {
        const match = await matchesRepository.findFirst({ where: eq(matches.id, row.matchId) });
        if (!match) return;
        const competition = await getFullCompetition(match.competitionId);
        if (!competition) return;
        const clock = new CompetitionClock(competition);

        if (clock.getMatchStatus(match.id) === "finished") {
            hooks.scoresPublished.trigger({
                competitionId: match.competitionId,
                matchId: row.matchId,
            });
        }
    }

    async afterCreate(row: MatchScoreEntry) {
        stream.broadcastInvalidateMessage("teams", "fetchAllScores");
        stream.broadcastInvalidateMessage("matches", "fetchById", { id: row.matchId });
        stream.broadcastInvalidateMessage("competitions", "fetchById");

        this.triggerScoresPublished(row);
    }

    async afterUpdate(row: MatchScoreEntry) {
        stream.broadcastInvalidateMessage("teams", "fetchAllScores");
        stream.broadcastInvalidateMessage("matches", "fetchById", { id: row.matchId });
        stream.broadcastInvalidateMessage("competitions", "fetchById");

        this.triggerScoresPublished(row);
    }

    async afterDelete(row: MatchScoreEntry) {
        stream.broadcastInvalidateMessage("teams", "fetchAllScores");
        stream.broadcastInvalidateMessage("matches", "fetchById", { id: row.matchId });
        stream.broadcastInvalidateMessage("competitions", "fetchById");

        this.triggerScoresPublished(row);
    }
}

export const matchScoreEntriesRepository = new MatchScoreEntriesRepository(appDb, matchScoreEntries);

