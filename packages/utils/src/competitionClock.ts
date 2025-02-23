import { DateTime } from "luxon";
import type { ExcludeNull, MatchStatus } from "./types";
import type { AppRouterOutput } from "@livecomp/server/src/server";
import type { Match, MatchPeriod } from "@livecomp/server/src/db/schema/matches";
import type { Offset, Pause } from "@livecomp/server/src/db/schema/competitions";

interface MatchTimings {
    startsAt: DateTime;
    endsAt: DateTime | null;
    stagingOpensAt: DateTime;
    stagingClosesAt: DateTime;
    matchPeriod: MatchPeriod;
}

export class CompetitionClock {
    private timings: Record<string, MatchTimings>;

    constructor(private readonly competition: ExcludeNull<AppRouterOutput["competitions"]["fetchById"]>) {
        this.timings = this.computeMatchTimings();
    }

    private computeMatchTimings() {
        const timings: Record<string, MatchTimings> = {};
        const matchPeriods = [...this.competition.matchPeriods].sort(
            (a, b) => a.startsAt.getTime() - b.startsAt.getTime()
        );
        const matches = [...this.competition.matches.sort((a, b) => a.sequenceNumber - b.sequenceNumber)];

        const pauses = [...this.competition.pauses.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())];
        const offsets = [...this.competition.offsets.sort((a, b) => a.appliesFrom.getTime() - b.appliesFrom.getTime())];

        let matchPeriod = matchPeriods.shift();
        if (!matchPeriod) return timings;

        let timeAccumulator = DateTime.fromJSDate(matchPeriod.startsAt);
        let slackAccumulator = 0;
        for (const match of matches) {
            timeAccumulator = timeAccumulator.plus({ seconds: match.buffer });

            const baseMatchEndTime = timeAccumulator.plus({
                seconds: match.buffer + this.competition.game.matchDuration + this.competition.game.defaultMatchSpacing,
            });

            // Apply pauses
            let pause = pauses[0];
            while (pause && DateTime.fromJSDate(pause.startsAt) < baseMatchEndTime) {
                const pauseStartsAt = DateTime.fromJSDate(pause.startsAt);
                const pauseEndsAt = pause.endsAt ? DateTime.fromJSDate(pause.endsAt) : null;
                if (pauseEndsAt) {
                    pauses.shift();
                    timeAccumulator = timeAccumulator.plus({
                        seconds: Math.abs(pauseStartsAt.diff(pauseEndsAt).as("seconds")),
                    });
                    slackAccumulator += Math.abs(pauseStartsAt.diff(pauseEndsAt).as("seconds"));
                } else if (!pauseEndsAt) break;

                pause = pauses[0];
            }

            // Apply offsets
            let offset = offsets[0];
            while (offset && DateTime.fromJSDate(offset.appliesFrom) < baseMatchEndTime) {
                offsets.shift();
                timeAccumulator = timeAccumulator.minus({ seconds: offset.offset });

                offset = offsets[0];
            }

            // Move to next match period if match overflows
            if (
                timeAccumulator.plus({ seconds: this.competition.game.matchDuration }) >
                DateTime.min(
                    DateTime.fromJSDate(matchPeriod.endsAt).plus({ seconds: slackAccumulator }),
                    DateTime.fromJSDate(matchPeriod.endsAtLatest)
                )
            ) {
                matchPeriod = matchPeriods.shift();
                if (!matchPeriod) break;

                slackAccumulator = 0;
                timeAccumulator = DateTime.fromJSDate(matchPeriod.startsAt);
            } else {
                timeAccumulator = timeAccumulator.plus({
                    seconds: this.competition.game.defaultMatchSpacing + this.competition.game.matchDuration,
                });
            }

            timings[match.id] = {
                startsAt: timeAccumulator,
                endsAt: timeAccumulator.plus({
                    seconds: this.competition.game.matchDuration,
                }),
                stagingOpensAt: timeAccumulator.minus({ seconds: this.competition.game.stagingOpenOffset }),
                stagingClosesAt: timeAccumulator.minus({ seconds: this.competition.game.stagingCloseOffset }),
                matchPeriod,
            };
        }

        return timings;
    }

    public isPaused() {
        return this.competition.pauses.some((pause) => pause.endsAt === null);
    }

    public now() {
        if (this.isPaused()) {
            return DateTime.fromJSDate(this.competition.pauses.find((pause) => pause.endsAt === null)!.startsAt);
        }

        return DateTime.now();
    }

    public getCurrentMatchPeriod() {
        const now = this.now();
        return this.competition.matchPeriods.find(
            (period) => now >= DateTime.fromJSDate(period.startsAt) && now < DateTime.fromJSDate(period.endsAtLatest)
        );
    }

    public getTimings() {
        return this.timings;
    }

    public getMatchTimings(matchId: string) {
        return this.timings[matchId] as MatchTimings | undefined;
    }

    public getMatchStatus(matchId: string): MatchStatus {
        const timings = this.timings[matchId];

        if (!timings) {
            return "notStarted";
        }

        const now = DateTime.now();

        if (now >= timings.stagingOpensAt && now < timings.stagingClosesAt) {
            return "staging";
        }

        if (now >= timings.startsAt && timings.endsAt && now < timings.endsAt) {
            return "inProgress";
        }

        if (timings.endsAt && now >= timings.endsAt) {
            return "finished";
        }

        return "notStarted";
    }

    public getPreviousMatchId(now?: DateTime) {
        if (!now) now = DateTime.now();

        for (const [matchId, matchTimings] of Object.entries(this.timings).sort(
            ([, a], [, b]) => b!.startsAt.toUnixInteger() - a!.startsAt.toUnixInteger()
        )) {
            if (matchTimings?.endsAt && now >= matchTimings.endsAt) return matchId;
        }

        return undefined;
    }

    public getCurrentMatchId(now?: DateTime) {
        if (!now) now = DateTime.now();

        for (const [matchId, matchTimings] of Object.entries(this.timings).sort(
            ([, a], [, b]) => a!.startsAt.toUnixInteger() - b!.startsAt.toUnixInteger()
        )) {
            if (matchTimings?.endsAt && now >= matchTimings.startsAt && now < matchTimings.endsAt) return matchId;
        }

        return undefined;
    }

    public getNextMatchId(now?: DateTime) {
        if (!now) now = DateTime.now();

        for (const [matchId, matchTimings] of Object.entries(this.timings).sort(
            ([, a], [, b]) => a!.startsAt.toUnixInteger() - b!.startsAt.toUnixInteger()
        )) {
            if (now < matchTimings!.startsAt) return matchId;
        }

        return undefined;
    }
}

