import { CompetitionClock, type FullCompetition, type MatchTimings } from "@livecomp/utils";
import { Hook } from "../utils/hook";
import { competitionsRepository } from "../modules/competitions/competitions.repository";
import { asc } from "drizzle-orm";
import { matches, matchPeriods } from "../db/schema/matches";
import { log } from "../utils/log";
import { streamEmitter, type CacheInvalidationEvent } from "../trpc/stream";
import { DateTime } from "luxon";

export const hooks = {
    stagingOpened: new Hook<{ competitionId: string; matchId: string }>(),
    stagingClosed: new Hook<{ competitionId: string; matchId: string }>(),
    matchStarted: new Hook<{ competitionId: string; matchId: string }>(),
    matchEnded: new Hook<{ competitionId: string; matchId: string }>(),
    scoresPublished: new Hook<{ competitionId: string; matchId: string }>(),
};

const timeHookMap: Partial<Record<keyof MatchTimings, keyof typeof hooks>> = {
    stagingOpensAt: "stagingOpened",
    stagingClosesAt: "stagingClosed",
    startsAt: "matchStarted",
    endsAt: "matchEnded",
};

export class MatchHooksJob {
    private static POLL_INTERVAL = 1000 * 10; // 10 seconds
    private competitions: FullCompetition[] = [];
    private scheduledHooks: Record<
        string,
        { [k in keyof typeof hooks]?: { time: DateTime; timeout: NodeJS.Timeout } }
    > = {};

    constructor() {
        this.updateCompetitionState().catch((e) => log.error("Failed to update competition state", e));
        setInterval(
            () => this.updateCompetitionState().catch((e) => log.error("Failed to update competition state", e)),
            MatchHooksJob.POLL_INTERVAL
        );

        streamEmitter.on("invalidate", (event: CacheInvalidationEvent) => {
            if (event.routerName === "competitions") {
                this.updateCompetitionState().catch((e) => log.error("Failed to update competition state", e));
            }
        });
    }

    private async updateCompetitionState() {
        log.debug("Updating competition state for match hooks");

        this.competitions = await competitionsRepository.findMany({
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

        this.handleNewState();
    }

    private handleNewState() {
        for (const competition of this.competitions) {
            const clock = new CompetitionClock(competition);
            const now = DateTime.now();

            if (!clock) continue;

            if (clock.isPaused()) {
                delete this.scheduledHooks[competition.id];
                continue;
            }

            for (const match of competition.matches) {
                const timings = clock.getMatchTimings(match.id);
                if (!timings) continue;

                for (const [timingKey, hookKey] of Object.entries(timeHookMap)) {
                    const scheduledTime = timings[timingKey as keyof MatchTimings] as DateTime | undefined;
                    if (!scheduledTime || !hookKey || !hooks[hookKey]) {
                        continue; // Skip if no scheduled time or hook is not defined
                    }

                    const delta = scheduledTime.diff(now).as("milliseconds");
                    if (delta === undefined || delta < -0.5) {
                        // Timing has already passed, skip scheduling
                        continue;
                    }

                    const timeout = setTimeout(() => {
                        hooks[hookKey].trigger({
                            competitionId: competition.id,
                            matchId: match.id,
                        });
                        delete this.scheduledHooks[match.id]?.[hookKey];

                        log.debug(`Triggered hook ${hookKey} for match ${match.id} at ${scheduledTime.toISO()}`);
                    }, delta);

                    if (!this.scheduledHooks[match.id]) {
                        this.scheduledHooks[match.id] = {};
                    } else if (this.scheduledHooks[match.id][hookKey]) {
                        // Clear the previous timeout if it exists
                        clearTimeout(this.scheduledHooks[match.id][hookKey]!.timeout);
                    }

                    this.scheduledHooks[match.id][hookKey] = {
                        time: scheduledTime,
                        timeout,
                    };
                }
            }
        }
    }
}

