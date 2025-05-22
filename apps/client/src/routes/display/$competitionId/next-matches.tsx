import { createFileRoute } from "@tanstack/react-router";
import SplitDisplay from "../../../components/display/SplitDisplay";
import { api } from "../../../utils/trpc";
import { useMemo } from "react";
import { DateTime } from "luxon";
import useCompetitionClock from "../../../hooks/useCompetitionClock";
import useDateTime from "../../../hooks/useDateTime";

export const Route = createFileRoute("/display/$competitionId/next-matches")({
    component: RouteComponent,
    beforeLoad: () => ({
        title: "Livecomp Displays",
    }),
});

function RouteComponent() {
    const { competitionId } = Route.useParams();

    const { data: competition } = api.competitions.fetchById.useQuery({
        id: competitionId,
    });
    const { data: teams } = api.teams.fetchAll.useQuery({ filters: { competitionId: competitionId } });

    const competitionClock = useCompetitionClock(competition);
    const now = useDateTime(competitionClock);

    const nextMatchTimes = useMemo<Record<string, DateTime>>(() => {
        return Object.fromEntries(
            (teams ?? [])
                .map((team) => {
                    for (const [matchId, timings] of Object.entries(competitionClock?.getTimings() ?? {})) {
                        const match = (competition?.matches ?? []).find((match) => match.id === matchId);
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
    }, [competition?.matches, competitionClock, now, teams]);

    return (
        <SplitDisplay competition={competition}>
            <h1 className="text-white text-4xl font-bold">Next matches - {competition?.name}</h1>

            <div className="grid grid-cols-5 gap-4 mt-8">
                {(teams ?? []).map((team) => (
                    <div key={team.id} className="p-4">
                        <h1 className="text-white text-2xl font-bold">{team.shortName}</h1>
                        <h2 className="text-white text-lg font-medium">
                            Next match:{" "}
                            <span className="font-mono font-normal">
                                {nextMatchTimes[team.id]?.toLocaleString(DateTime.TIME_24_WITH_SECONDS) ?? "-"}
                            </span>
                        </h2>
                    </div>
                ))}
            </div>

            <div className="p-4 absolute bottom-0">
                <h1 className="text-white text-2xl font-semibold">
                    Staging closes at the time specified for each match.
                </h1>
            </div>
        </SplitDisplay>
    );
}

