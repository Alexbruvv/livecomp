import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";

import SplitDisplay from "../../../components/display/SplitDisplay";
import useCompetitionClock from "../../../hooks/use-competition-clock";
import useDateTime from "../../../hooks/use-date-time";
import { useCompetition } from "../../../data/competition";

export const Route = createFileRoute("/display/$competitionId/staging")({
    component: RouteComponent,
});

function RouteComponent() {
    useEffect(() => {
        import("../../../styles/display/staging.css");
    }, []);

    const competition = useCompetition();
    const competitionClock = useCompetitionClock(competition);
    const now = useDateTime(competitionClock);

    const matches = useMemo(
        () =>
            competition && competitionClock
                ? competition.matches
                      .filter((match) => {
                          const timings = competitionClock.getMatchTimings(match.id);

                          if (!timings) return false;

                          return timings.stagingClosesAt.plus({ minutes: 5 }) >= now;
                      })
                      .slice(0, 10)
                      .sort((a, b) => {
                          const aTimings = competitionClock.getMatchTimings(a.id);
                          const bTimings = competitionClock.getMatchTimings(b.id);

                          if (!aTimings || !bTimings) return 0;

                          return aTimings.stagingOpensAt.toUnixInteger() - bTimings.stagingOpensAt.toUnixInteger();
                      })
                : [],
        [competition, competitionClock, now]
    );

    return (
        <SplitDisplay competition={competition}>
            <h1 className="text-white text-4xl font-bold">Staging - {competition.name}</h1>

            <div className="w-full my-24 flex flex-col justify-items-center">
                <table className="w-full mx-auto my-auto">
                    <thead>
                        <tr>
                            <th>Match</th>
                            <th>Staging</th>
                            <th>Start time</th>
                            {competition &&
                                competition.game.startingZones.map((zone) => (
                                    <th key={zone.id} style={{ color: zone.color }}>
                                        Zone {zone.name}
                                    </th>
                                ))}
                        </tr>
                    </thead>
                    <tbody>
                        {competition &&
                            competitionClock &&
                            matches.map((match) => {
                                const timings = competitionClock.getMatchTimings(match.id);
                                if (!timings) return null;

                                return (
                                    <tr key={match.id}>
                                        <td>{match.name}</td>
                                        <td>
                                            {now < timings.stagingOpensAt ? (
                                                <span className="text-blue-500">
                                                    Opens{" "}
                                                    {timings.stagingOpensAt.toRelative({ base: now, style: "short" })}
                                                </span>
                                            ) : now < timings.stagingClosesAt ? (
                                                <span className="text-green-500">
                                                    Closes{" "}
                                                    {timings.stagingClosesAt.toRelative({ base: now, style: "short" })}
                                                </span>
                                            ) : (
                                                <span className="text-red-500">
                                                    Closed{" "}
                                                    {timings.stagingClosesAt.toRelative({ base: now, style: "short" })}
                                                </span>
                                            )}
                                        </td>
                                        <td>{timings.startsAt.toRelative()}</td>
                                        {competition.game.startingZones.map((zone) => (
                                            <td key={zone.id} style={{ color: zone.color }}>
                                                {match.assignments.find(
                                                    (assignment) => assignment.startingZoneId === zone.id
                                                )?.team?.shortName ?? "???"}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>
        </SplitDisplay>
    );
}

