import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import SplitDisplay from "../../../components/display/SplitDisplay";
import { api } from "../../../utils/trpc";
import useRankings from "../../../hooks/use-rankings";
import { useCompetition } from "../../../data/competition";

export const Route = createFileRoute("/display/$competitionId/leaderboard")({
    component: RouteComponent,
    beforeLoad: () => ({
        title: "Livecomp Displays",
    }),
});

function RouteComponent() {
    const { competitionId } = Route.useParams();

    useEffect(() => {
        import("../../../styles/display/leaderboard.css");
    }, []);
    const competition = useCompetition();
    const teams = useMemo(() => competition.teams, [competition]);
    const { data: rawScores } = api.teams.fetchAllScores.useQuery({ competitionId });

    const rankings = useRankings(competition);
    const scores = useMemo(() => {
        if (!rankings || !rawScores) return [];
        return Object.entries(rankings)
            .slice(0, 10)
            .sort(([, a], [, b]) => a - b)
            .map(([teamId]) => {
                const teamScores = rawScores[teamId];
                return {
                    teamId,
                    leaguePoints: teamScores?.leaguePoints ?? 0,
                    gamePoints: teamScores?.gamePoints ?? 0,
                    matchCount: teamScores?.matchCount ?? 0,
                };
            });
    }, [rankings, rawScores]);

    return (
        <SplitDisplay competition={competition}>
            <h1 className="text-white font-bold" style={{ fontSize: "4vh" }}>
                Leaderboard - {competition?.name}
            </h1>

            <div className="w-full my-24 flex flex-col justify-items-center">
                <table className="w-full mx-auto my-auto">
                    <thead>
                        <tr>
                            <th>Team</th>
                            <th>League Points</th>
                            <th>Game Points</th>
                            <th>Matches Played</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scores.map((scores) => (
                            <tr key={scores.teamId}>
                                <td>{teams?.find((team) => team.id === scores.teamId)?.shortName}</td>
                                <td>{scores.leaguePoints}</td>
                                <td>{scores.gamePoints}</td>
                                <td>{scores.matchCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </SplitDisplay>
    );
}

