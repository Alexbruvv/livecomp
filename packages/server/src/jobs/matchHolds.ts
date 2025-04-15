import { CronJob } from "cron";
import { competitionsRepository } from "../modules/competitions/competitions.repository";
import { asc, eq } from "drizzle-orm";
import { matches, matchPeriods } from "../db/schema/matches";
import { CompetitionClock } from "@livecomp/utils";
import { matchesRepository } from "../modules/matches/matches.repository";
import { pausesRepository } from "../modules/pauses/pauses.repository";

export const matchHoldsJob = new CronJob("* * * * * *", async () => {
    const competitions = await competitionsRepository.findMany({
        with: {
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
                        },
                    },
                },
                orderBy: asc(matches.sequenceNumber),
            },
            matchPeriods: {
                orderBy: asc(matchPeriods.startsAt),
            },
            pauses: true,
        },
    });

    for (const competition of competitions) {
        const clock = new CompetitionClock(competition);
        const nextMatchId = clock.getNextMatchId();
        const nextMatch = competition.matches.find((match) => match.id === nextMatchId);

        const now = clock.now();

        if (
            nextMatch &&
            !nextMatch.released &&
            now >= clock.getMatchTimings(nextMatchId!)!.startsAt.minus({ seconds: competition.matchHoldOffset + 1 })
        ) {
            await Promise.all([
                matchesRepository.update(
                    {
                        released: true,
                    },
                    { where: eq(matches.id, nextMatch.id) }
                ),
                pausesRepository.create({
                    competitionId: competition.id,
                    startsAt: now.toJSDate(),
                }),
            ]);

            console.log(`Paused for match ${nextMatch.name}`);
        }
    }
});

