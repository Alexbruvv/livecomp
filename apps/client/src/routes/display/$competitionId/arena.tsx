import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";
import { useMemo } from "react";
import { formatClock } from "../../../utils/clock";
import useDateTime from "../../../hooks/use-date-time";
import useCompetitionClock from "../../../hooks/use-competition-clock";
import { DateTime } from "luxon";
import { useCompetition } from "../../../data/competition";

const searchSchema = z.object({
    startingZoneId: z.string(),
});

export const Route = createFileRoute("/display/$competitionId/arena")({
    component: RouteComponent,
    beforeLoad: () => ({
        title: "Livecomp Displays",
    }),
    validateSearch: zodValidator(searchSchema),
});

enum DisplayMode {
    PRE_MATCH = "PRE_MATCH",
    MATCH_START_COUNTDOWN = "MATCH_START_COUNTDOWN",
    MATCH_IN_PROGRESS = "MATCH_IN_PROGRESS",
    POST_MATCH = "POST_MATCH",
}

function RouteComponent() {
    const { startingZoneId } = Route.useSearch();

    const competition = useCompetition();

    const startingZones = useMemo(() => competition.game.startingZones, [competition]);
    const startingZone = useMemo(
        () => startingZones.find((zone) => zone.id === startingZoneId),
        [startingZoneId, startingZones]
    );

    const otherStartingZones = useMemo(
        () => (startingZones ?? []).filter((zone) => zone.id !== startingZoneId),
        [startingZones, startingZoneId]
    );
    const shouldShowOtherZones = useMemo(() => otherStartingZones.length === 3, [otherStartingZones]);

    const competitionClock = useCompetitionClock(competition);
    const now = useDateTime(competitionClock);

    const previousMatch = useMemo(() => {
        const previousMatchId = competitionClock.getPreviousMatchId(now);
        if (!previousMatchId) return undefined;

        return competition?.matches.find((match) => match.id === previousMatchId);
    }, [competitionClock, now, competition?.matches]);

    const currentMatch = useMemo(() => {
        const currentMatchId = competitionClock.getCurrentMatchId(now);
        if (!currentMatchId) return undefined;

        return competition?.matches.find((match) => match.id === currentMatchId);
    }, [competitionClock, now, competition?.matches]);

    const currentAssignment = useMemo(() => {
        if (!currentMatch) return undefined;

        return currentMatch.assignments.find((assignment) => assignment.startingZoneId === startingZoneId);
    }, [currentMatch, startingZoneId]);

    const nextMatch = useMemo(() => {
        const nextMatchId = competitionClock.getNextMatchId(now);
        if (!nextMatchId) return undefined;

        return competition?.matches.find((match) => match.id === nextMatchId);
    }, [competitionClock, now, competition?.matches]);

    const nextAssignment = useMemo(() => {
        if (!nextMatch) return undefined;

        return nextMatch.assignments.find((assignment) => assignment.startingZoneId === startingZoneId);
    }, [nextMatch, startingZoneId]);

    const displayMode: DisplayMode | undefined = useMemo(() => {
        if (currentMatch) {
            return DisplayMode.MATCH_IN_PROGRESS;
        } else {
            const previousMatchTimings = previousMatch && competitionClock.getMatchTimings(previousMatch.id);
            if (
                previousMatch &&
                previousMatchTimings?.endsAt &&
                now <= previousMatchTimings.endsAt.plus({ seconds: 10 })
            ) {
                return DisplayMode.POST_MATCH;
            } else if (nextMatch) {
                if (
                    now >=
                    (competitionClock.getMatchTimings(nextMatch.id)?.startsAt ?? DateTime.now()).minus({
                        seconds: 10,
                    })
                ) {
                    return DisplayMode.MATCH_START_COUNTDOWN;
                } else {
                    return DisplayMode.PRE_MATCH;
                }
            }
        }
    }, [competitionClock, currentMatch, nextMatch, now, previousMatch]);

    return (
        <div className="w-screen h-screen flex">
            <div className="w-1/4 h-full" style={{ backgroundColor: startingZone?.color ?? "red" }}></div>
            <div className="w-2/4 h-full flex flex-col justify-center relative">
                {displayMode === DisplayMode.PRE_MATCH && nextMatch && (
                    <>
                        <div className="my-16">
                            <h1 className="text-white font-bold text-center" style={{ fontSize: "9vh" }}>
                                {nextMatch.name}
                            </h1>
                        </div>
                        <div className="my-16">
                            <h1 className="text-white font-bold text-center mb-4" style={{ fontSize: "6vh" }}>
                                Starting in
                            </h1>
                            <h1 className="text-white font-bold font-mono text-center" style={{ fontSize: "8vh" }}>
                                {formatClock(
                                    (competitionClock.getMatchTimings(nextMatch.id)?.startsAt ?? DateTime.now())
                                        .diff(now)
                                        .as("seconds")
                                )}
                            </h1>
                        </div>
                        <div className="my-16">
                            <h1 className="text-white font-bold text-center" style={{ fontSize: "9vh" }}>
                                {nextAssignment?.team?.shortName}
                            </h1>
                            <h2 className="text-white font-semibold text-center" style={{ fontSize: "6vh" }}>
                                {nextAssignment?.team?.name}
                            </h2>
                        </div>

                        {shouldShowOtherZones && (
                            <div className="absolute bottom-0 left-0 right-0 h-1/5 flex flex-row">
                                {otherStartingZones.map((zone) => (
                                    <div key={zone.id} className="w-1/3 h-full flex flex-row">
                                        <div className="w-1/4 h-full" style={{ backgroundColor: zone.color }}></div>
                                        <div className="w-2/4 h-full flex flex-col justify-center">
                                            <h1
                                                className="text-white font-bold text-center"
                                                style={{ fontSize: "6vh" }}
                                            >
                                                {
                                                    nextMatch.assignments.find(
                                                        (assignment) => assignment.startingZoneId === zone.id
                                                    )?.team?.shortName
                                                }
                                            </h1>
                                        </div>
                                        <div className="w-1/4 h-full" style={{ backgroundColor: zone.color }}></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {displayMode === DisplayMode.MATCH_START_COUNTDOWN && nextMatch && (
                    <>
                        <div>
                            <h1 className="text-white font-bold font-mono text-center" style={{ fontSize: "11vh" }}>
                                {Math.ceil(
                                    (competitionClock.getMatchTimings(nextMatch.id)?.startsAt ?? DateTime.now())
                                        .diff(now)
                                        .as("seconds")
                                )}
                            </h1>
                        </div>
                    </>
                )}

                {displayMode === DisplayMode.MATCH_IN_PROGRESS && currentMatch && (
                    <>
                        <div className="my-16">
                            <h1 className="text-white font-bold text-center" style={{ fontSize: "7vh" }}>
                                {currentMatch.name}
                            </h1>
                        </div>
                        <div className="my-16">
                            <h1 className="text-white font-bold font-mono text-center" style={{ fontSize: "9vh" }}>
                                {formatClock(
                                    (competitionClock.getMatchTimings(currentMatch.id)?.endsAt ?? DateTime.now())
                                        .diff(now)
                                        .as("seconds")
                                )}
                            </h1>
                        </div>
                        <div className="my-16">
                            <h1 className="text-white font-bold text-center" style={{ fontSize: "7vh" }}>
                                {currentAssignment?.team?.shortName}
                            </h1>
                            <h2 className="text-white font-semibold text-center" style={{ fontSize: "4vh" }}>
                                {currentAssignment?.team?.name}
                            </h2>
                        </div>

                        {shouldShowOtherZones && (
                            <div className="absolute bottom-0 left-0 right-0 h-1/5 flex flex-row">
                                {otherStartingZones.map((zone) => (
                                    <div key={zone.id} className="w-1/3 h-full flex flex-row">
                                        <div className="w-1/4 h-full" style={{ backgroundColor: zone.color }}></div>
                                        <div className="w-2/4 h-full flex flex-col justify-center">
                                            <h1 className="text-white font-bold text-3xl text-center">
                                                {
                                                    currentMatch.assignments.find(
                                                        (assignment) => assignment.startingZoneId === zone.id
                                                    )?.team?.shortName
                                                }
                                            </h1>
                                        </div>
                                        <div className="w-1/4 h-full" style={{ backgroundColor: zone.color }}></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {displayMode === DisplayMode.POST_MATCH && previousMatch && (
                    <>
                        <div className="my-16">
                            <h1 className="text-white font-bold text-center" style={{ fontSize: "8vh" }}>
                                {previousMatch.name}
                            </h1>
                        </div>
                        <div className="my-16">
                            <h1 className="text-white font-bold text-center" style={{ fontSize: "6vh" }}>
                                Match ended
                            </h1>
                        </div>
                    </>
                )}
            </div>
            <div className="w-1/4 h-full" style={{ backgroundColor: startingZone?.color ?? "red" }}></div>
        </div>
    );
}

