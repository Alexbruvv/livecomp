import { Fragment, PropsWithChildren, useMemo } from "react";
import useDateTime from "../../hooks/useDateTime";
import { api } from "../../utils/trpc";
import { array } from "../../utils/array";
import { AppRouterOutput } from "@livecomp/server";
import MatchBox from "./MatchBox";
import { DateTime } from "luxon";
import { formatClock } from "../../utils/clock";
import useCompetitionClock from "../../hooks/useCompetitionClock";
import DisplayOverlay from "./DisplayOverlay";

export default function SplitDisplay({
    competition,
    children,
}: { competition?: AppRouterOutput["competitions"]["fetchById"] } & PropsWithChildren) {
    const { data: teams } = api.teams.fetchAll.useQuery({ filters: { competitionId: competition?.id ?? "" } });
    const chunkedTeams = useMemo(() => [...array.chunk(teams ?? [], 3)], [teams]);

    const competitionClock = useCompetitionClock(competition);
    const time = useDateTime(competitionClock);

    const currentMatch = useMemo(() => {
        const currentMatchId = competitionClock?.getCurrentMatchId() ?? competitionClock?.getPreviousMatchId();

        if (currentMatchId) {
            return competition?.matches.find((match) => match.id === currentMatchId);
        }

        return undefined;
    }, [competition?.matches, competitionClock]);
    const currentMatchStagingClose = useMemo(() => {
        const timings =
            currentMatch && competitionClock ? competitionClock.getMatchTimings(currentMatch.id) : undefined;

        const secondsValue = Math.max(
            0,
            (timings && timings.endsAt ? timings.endsAt.diff(time).as("seconds") : 0) ?? 0
        );

        if (secondsValue === 0) return "Ended";
        return formatClock(secondsValue);
    }, [currentMatch, competitionClock, time]);

    const nextMatch = useMemo(() => {
        const nextMatchId = competitionClock?.getNextMatchId();

        if (nextMatchId) {
            return competition?.matches.find((match) => match.id === nextMatchId);
        }

        return undefined;
    }, [competition?.matches, competitionClock]);
    const nextMatchStagingClose = useMemo(() => {
        const secondsValue = Math.max(
            0,
            (nextMatch
                ? competitionClock?.getMatchTimings(nextMatch.id)?.stagingClosesAt.diff(time).as("seconds")
                : 0) ?? 0
        );

        if (secondsValue === 0) return "Closed";
        return formatClock(secondsValue);
    }, [nextMatch, competitionClock, time]);

    const { data: matches } = api.matches.fetchAll.useQuery(
        { filters: { competitionId: competition?.id } },
        { enabled: !!competition }
    );

    const nextMatchTimes = useMemo<Record<string, DateTime>>(() => {
        const now = DateTime.now();

        return Object.fromEntries(
            (teams ?? [])
                .map((team) => {
                    for (const [matchId, timings] of Object.entries(competitionClock?.getTimings() ?? {})) {
                        const match = (matches ?? []).find((match) => match.id === matchId);
                        if (!match) continue;
                        if (!match.assignments.some((assignment) => assignment.teamId === team.id)) continue;

                        if (now < timings.stagingClosesAt) {
                            return [team.id, timings.stagingClosesAt];
                        }
                    }

                    return undefined;
                })
                .filter((entry) => !!entry)
        );
    }, [competitionClock, matches, teams]);

    return (
        <div className="w-screen h-screen flex flex-row">
            {competitionClock?.isPaused() && (
                <DisplayOverlay>
                    <h1 className="text-center text-white text-4xl font-mono">The competition is currently paused.</h1>
                </DisplayOverlay>
            )}

            <div className="w-2/3 h-full p-4">{children}</div>
            <div className="w-1/3 h-full border-l-2 flex flex-col">
                <div className="text-white text-3xl p-4 font-bold bg-slate-600">Next matches</div>

                <table className="w-full border-b-2 border-white">
                    <thead className="bg-slate-600">
                        <tr>
                            <th className="w-1/6 p-2 px-4 text-2xl text-white text-right">Team</th>
                            <th className="w-1/6 p-2 px-4 text-2xl text-white text-left">Time</th>
                            <th className="w-1/6 p-2 px-4 text-2xl text-white text-right">Team</th>
                            <th className="w-1/6 p-2 px-4 text-2xl text-white text-left">Time</th>
                            <th className="w-1/6 p-2 px-4 text-2xl text-white text-right">Team</th>
                            <th className="w-1/6 p-2 px-4 text-2xl text-white text-left">Time</th>
                        </tr>
                    </thead>

                    <tbody>
                        {chunkedTeams.map((chunk, i) => {
                            return (
                                <tr key={i}>
                                    {chunk.map((team, j) => {
                                        const shadeLeft = (i + j) % 2 === 0;

                                        return (
                                            <Fragment key={team.id}>
                                                <td
                                                    className={`p-2 px-4 text-lg text-white text-right ${
                                                        shadeLeft ? "bg-slate-800" : ""
                                                    }`}
                                                >
                                                    {team.shortName}
                                                </td>
                                                <td
                                                    className={`p-2 px-4 text-lg text-white text-left ${
                                                        shadeLeft ? "bg-slate-800" : ""
                                                    }`}
                                                >
                                                    {nextMatchTimes[team.id]
                                                        ?.set({ second: 0 })
                                                        .toLocaleString(DateTime.TIME_24_SIMPLE) ?? "-"}
                                                </td>
                                            </Fragment>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <table className="w-full my-auto">
                    <tbody>
                        <tr>
                            <td className="w-1/2">
                                <h1 className="text-white font-bold text-3xl p-4 text-center">
                                    Current
                                    <br />
                                    match
                                </h1>
                            </td>
                            <td className="w-1/2">
                                <MatchBox
                                    matchName={currentMatch?.name ?? "-"}
                                    matchTime={currentMatchStagingClose ?? "-"}
                                    startingZones={competition?.game.startingZones ?? []}
                                    assignments={currentMatch?.assignments ?? []}
                                    placeholder="-"
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table className="w-full my-auto">
                    <tbody>
                        <tr>
                            <td className="w-1/2">
                                <h1 className="text-white font-bold text-3xl p-4 text-center">
                                    Next
                                    <br />
                                    match
                                </h1>
                            </td>
                            <td className="w-1/2">
                                <MatchBox
                                    matchName={nextMatch?.name ?? "???"}
                                    matchTime={nextMatchStagingClose ?? "???"}
                                    startingZones={competition?.game.startingZones ?? []}
                                    assignments={nextMatch?.assignments ?? []}
                                    placeholder="???"
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div className="text-white text-3xl p-4 font-semibold bg-slate-600 border-t-2 border-white flex justify-between">
                    <span>Time</span>
                    <span className="font-mono">{time.toFormat("HH:mm:ss")}</span>
                </div>
            </div>
        </div>
    );
}

