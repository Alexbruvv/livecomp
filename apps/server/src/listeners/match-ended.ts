import { eq } from "drizzle-orm";
import { hooks } from "../tasks/hooks";
import { matchesRepository } from "../modules/matches/matches.repository";
import { matches } from "../db/schema/matches";

export default function setupMatchEndedListener() {
    hooks.matchEnded.subscribe(async ({ competitionId, matchId }) => {
        const match = await matchesRepository.findFirst({
            where: eq(matches.id, matchId),
            with: {
                scoreEntry: true,
            },
        });

        if (match?.scoreEntry) {
            hooks.scoresPublished.trigger({
                competitionId,
                matchId,
            });
        }
    });
}

