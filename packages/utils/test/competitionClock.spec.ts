import type { AppRouterOutput } from "@livecomp/server";
import { DateTime } from "luxon";
import { expect, test } from "bun:test";
import { matchPeriods } from "@livecomp/server/src/db/schema/matches";
import type { ExcludeNull } from "../src/types";
import { CompetitionClock } from "../src";

type FullCompetition = ExcludeNull<AppRouterOutput["competitions"]["fetchById"]>;

const NOW = DateTime.fromObject({ year: 2025, month: 1, day: 1, hour: 0, minute: 0, second: 0 });

const BASE_COMPETITION = {
    id: "1",
    name: "Test Competition",
    shortName: "TC",
    startsAt: NOW.toJSDate(),
    endsAt: NOW.plus({ days: 1 }).toJSDate(),
    acceptingNewDisplays: false,
    createdAt: NOW.toJSDate(),
    updatedAt: NOW.toJSDate(),
    gameId: "1",
    game: {
        id: "1",
        name: "Test Game",
        defaultMatchSpacing: 90,
        matchDuration: 150,
        scorer: null,
        stagingOpenOffset: 300,
        stagingCloseOffset: 150,
        startingZones: [
            {
                id: "0",
                name: "0",
                color: "red",
                createdAt: NOW.toJSDate(),
                updatedAt: NOW.toJSDate(),
                gameId: "1",
            },
            {
                id: "1",
                name: "1",
                color: "blue",
                createdAt: NOW.toJSDate(),
                updatedAt: NOW.toJSDate(),
                gameId: "1",
            },
        ],
        createdAt: NOW.toJSDate(),
        updatedAt: NOW.toJSDate(),
    },
    venueId: "1",
    venue: {
        id: "1",
        name: "Test Venue",
        createdAt: NOW.toJSDate(),
        updatedAt: NOW.toJSDate(),
    },
    matchPeriods: [],
    matches: [],
    pauses: [],
    offsets: [],
} satisfies FullCompetition;

function matchPeriod({ startsAt, endsAt, endsAtLatest }: { startsAt: Date; endsAt: Date; endsAtLatest?: Date }) {
    return {
        id: "1",
        competitionId: "1",
        name: "Match Period",
        type: "league",
        startsAt,
        endsAt,
        endsAtLatest: endsAtLatest || endsAt,
        createdAt: NOW.toJSDate(),
        updatedAt: NOW.toJSDate(),
    } satisfies FullCompetition["matchPeriods"][number];
}

function match({ number, buffer }: { number: number; buffer?: number }) {
    return {
        id: `${number}`,
        competitionId: "1",
        name: `Match ${number}`,
        sequenceNumber: number,
        buffer: buffer ?? 0,
        type: "league",
        assignments: [],
        createdAt: NOW.toJSDate(),
        updatedAt: NOW.toJSDate(),
    } satisfies FullCompetition["matches"][number];
}

/**
 * Each match lasts for 150 seconds, with 90 seconds between each match.
 * For two matches, 150 + 90 + 150 = 390 seconds.
 * The second match should start 150 + 90 = 240 seconds after the first match.
 * Staging for the first match should open 300 seconds before the first match starts.
 * Staging for the second match should open 300 seconds before the second match starts.
 */
test("Two matches are scheduled relatively correctly", () => {
    const competition = {
        ...BASE_COMPETITION,
        matchPeriods: [
            matchPeriod({
                startsAt: NOW.toJSDate(),
                endsAt: NOW.plus({ seconds: 390 }).toJSDate(),
            }),
        ],
        matches: [match({ number: 0 }), match({ number: 1 })],
    } satisfies FullCompetition;

    const clock = new CompetitionClock(competition, NOW);

    expect(clock.getMatchTimings("1")!.startsAt.diff(clock.getMatchTimings("0")!.startsAt).as("seconds")).toBe(240);
    expect(clock.getMatchTimings("0")!.stagingOpensAt.diff(clock.getMatchTimings("0")!.startsAt).as("seconds")).toBe(
        -300
    );
    expect(clock.getMatchTimings("1")!.stagingOpensAt.diff(clock.getMatchTimings("1")!.startsAt).as("seconds")).toBe(
        -300
    );
});

