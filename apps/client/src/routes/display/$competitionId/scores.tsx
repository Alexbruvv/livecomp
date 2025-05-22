import { createFileRoute } from "@tanstack/react-router";
import SplitDisplay from "../../../components/display/SplitDisplay";
import { api } from "../../../utils/trpc";

export const Route = createFileRoute("/display/$competitionId/scores")({
    component: RouteComponent,
    beforeLoad: () => ({
        title: "Livecomp Displays",
    }),
});

function RouteComponent() {
    const { competitionId } = Route.useParams();
    const { data: competition } = api.competitions.fetchById.useQuery({ id: competitionId });
    const { data: teams } = api.teams.fetchAll.useQuery({ filters: { competitionId } }, { initialData: [] });
    const { data: scores } = api.teams.fetchAllScores.useQuery({ competitionId });

    return (
        <SplitDisplay competition={competition}>
            <h1 className="text-white text-4xl font-bold">Scores</h1>

            <div className="grid grid-cols-5 gap-4">
                {teams.map((team) => (
                    <div key={team.id} className="p-4">
                        <h1 className="text-white text-2xl font-bold">{team.shortName}</h1>
                        <h2 className="text-white text-lg font-medium">
                            League Points:{" "}
                            <span className="font-mono font-normal">{scores && scores[team.id].leaguePoints}</span>
                        </h2>
                        <h2 className="text-white text-lg font-medium">
                            Game Points:{" "}
                            <span className="font-mono font-normal">{scores && scores[team.id].gamePoints}</span>
                        </h2>
                    </div>
                ))}
            </div>
        </SplitDisplay>
    );
}

