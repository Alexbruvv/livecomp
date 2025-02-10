import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";
import { api } from "../../../utils/trpc";
import { useMemo } from "react";
import { formatClock } from "../../../utils/clock";
import useDateTime from "../../../hooks/useDateTime";
import useCompetitionClock from "../../../hooks/useCompetitionClock";

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
    MATCH_END_COUNTDOWN = "MATCH_END_COUNTDOWN",
    POST_MATCH = "POST_MATCH",
}

function RouteComponent() {
    const { competitionId } = Route.useParams();
    const { startingZoneId } = Route.useSearch();

    const now = useDateTime();

    const { data: competition } = api.competitions.fetchById.useQuery({ id: competitionId });

    const { data: startingZone } = api.startingZones.fetchById.useQuery({ id: startingZoneId });
    const { data: startingZones } = api.startingZones.fetchAll.useQuery(
        { filters: { gameId: startingZone?.gameId ?? "" } },
        { enabled: !!startingZone }
    );

    const otherStartingZones = useMemo(
        () => (startingZones ?? []).filter((zone) => zone.id !== startingZoneId),
        [startingZones, startingZoneId]
    );
    const shouldShowOtherZones = useMemo(() => otherStartingZones.length === 3, [otherStartingZones]);

    const competitionClock = useCompetitionClock(competition);

    const previousMatch = useMemo(() => {
        const previousMatchId = competitionClock?.getPreviousMatchId(now);
        if (!previousMatchId) return undefined;

        return competition?.matches.find((match) => match.id === previousMatchId);
    }, [competitionClock, now, competition?.matches]);

    const currentMatch = useMemo(() => {
        const currentMatchId = competitionClock?.getCurrentMatchId(now);
        if (!currentMatchId) return undefined;

        return competition?.matches.find((match) => match.id === currentMatchId);
    }, [competitionClock, now, competition?.matches]);

    const currentAssignment = useMemo(() => {
        if (!currentMatch) return undefined;

        return currentMatch.assignments.find((assignment) => assignment.startingZoneId === startingZoneId);
    }, [currentMatch, startingZoneId]);

    const nextMatch = useMemo(() => {
        const nextMatchId = competitionClock?.getNextMatchId(now);
        if (!nextMatchId) return undefined;

        return competition?.matches.find((match) => match.id === nextMatchId);
    }, [competitionClock, now, competition?.matches]);

    const nextAssignment = useMemo(() => {
        if (!nextMatch) return undefined;

        return nextMatch.assignments.find((assignment) => assignment.startingZoneId === startingZoneId);
    }, [nextMatch, startingZoneId]);

    const displayMode: DisplayMode | undefined = useMemo(() => {
        if (competition && competitionClock) {
            if (currentMatch) {
                if (competitionClock.getMatchTimings(currentMatch.id)?.endsAt.minus({ seconds: 5 }) <= now) {
                    return DisplayMode.MATCH_END_COUNTDOWN;
                } else {
                    return DisplayMode.MATCH_IN_PROGRESS;
                }
            } else {
                if (
                    previousMatch &&
                    now <= competitionClock.getMatchTimings(previousMatch.id).endsAt.plus({ seconds: 10 })
                ) {
                    return DisplayMode.POST_MATCH;
                } else if (nextMatch) {
                    if (now >= competitionClock.getMatchTimings(nextMatch.id).startsAt.minus({ seconds: 10 })) {
                        return DisplayMode.MATCH_START_COUNTDOWN;
                    } else {
                        return DisplayMode.PRE_MATCH;
                    }
                }
            }
        }

        return undefined;
    }, [competition, competitionClock, currentMatch, nextMatch, now, previousMatch]);

    return (
        <div className="w-screen h-screen flex">
            <div className="w-1/4 h-full" style={{ backgroundColor: startingZone?.color ?? "red" }}></div>
            <div className="w-2/4 h-full flex flex-col justify-center relative">
                {displayMode === DisplayMode.PRE_MATCH && nextMatch && competition && competitionClock && (
                    <>
                        <div className="my-16">
                            <h1 className="text-white font-bold text-8xl text-center">{nextMatch.name}</h1>
                        </div>
                        <div className="my-16">
                            <h1 className="text-white font-bold text-5xl text-center mb-4">Starting in</h1>
                            <h1 className="text-white font-bold font-mono text-8xl text-center">
                                {formatClock(
                                    competitionClock.getMatchTimings(nextMatch.id).startsAt.diffNow().as("seconds")
                                )}
                            </h1>
                        </div>
                        <div className="my-16">
                            <h1 className="text-white font-bold text-8xl text-center">
                                {nextAssignment?.team?.shortName}
                            </h1>
                            <h2 className="text-white font-semibold text-5xl text-center">
                                {nextAssignment?.team?.name}
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

                {displayMode === DisplayMode.MATCH_START_COUNTDOWN && nextMatch && competition && competitionClock && (
                    <>
                        <div>
                            <h1 className="text-white font-bold font-mono text-9xl text-center">
                                {Math.ceil(
                                    competitionClock.getMatchTimings(nextMatch.id).startsAt.diffNow().as("seconds")
                                )}
                            </h1>
                        </div>
                    </>
                )}

                {displayMode === DisplayMode.MATCH_IN_PROGRESS && currentMatch && competitionClock && competition && (
                    <>
                        <div className="my-16">
                            <h1 className="text-white font-bold text-8xl text-center">{currentMatch.name}</h1>
                        </div>
                        <div className="my-16">
                            <h1 className="text-white font-bold font-mono text-8xl text-center">
                                {formatClock(
                                    competitionClock.getMatchTimings(currentMatch.id).endsAt.diffNow().as("seconds")
                                )}
                            </h1>
                        </div>
                        <div className="my-16">
                            <h1 className="text-white font-bold text-8xl text-center">
                                {currentAssignment?.team?.shortName}
                            </h1>
                            <h2 className="text-white font-semibold text-5xl text-center">
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

                {displayMode === DisplayMode.MATCH_END_COUNTDOWN && currentMatch && competition && competitionClock && (
                    <>
                        <div>
                            <h1 className="text-white font-bold font-mono text-9xl text-center">
                                {Math.ceil(
                                    competitionClock.getMatchTimings(currentMatch.id).endsAt.diffNow().as("seconds")
                                )}
                            </h1>
                        </div>
                    </>
                )}

                {displayMode === DisplayMode.POST_MATCH && previousMatch && (
                    <>
                        <div className="my-16">
                            <h1 className="text-white font-bold text-6xl text-center">{previousMatch.name}</h1>
                        </div>
                        <div className="my-16">
                            <h1 className="text-white font-bold text-8xl text-center">Match ended</h1>
                        </div>
                    </>
                )}
            </div>
            <div className="w-1/4 h-full" style={{ backgroundColor: startingZone?.color ?? "red" }}></div>
        </div>
    );
}

