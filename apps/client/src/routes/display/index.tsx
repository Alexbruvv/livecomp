import { createFileRoute, Link } from "@tanstack/react-router";
import { api } from "../../utils/trpc";

export const Route = createFileRoute("/display/")({
    component: RouteComponent,
    beforeLoad: () => ({
        title: "Livecomp Displays",
    }),
});

function RouteComponent() {
    const { data: competitions } = api.competitions.fetchAll.useQuery();
    const { data: startingZones } = api.startingZones.fetchAll.useQuery();

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 w-screen p-4">
            {competitions &&
                competitions.map((competition) => (
                    <div key={competition.id} className="border border-white p-4">
                        <h4 className="text-white text-2xl font-bold mb-4">{competition.name}</h4>

                        <ul className="list-disc list-inside">
                            <li className="text-blue-500 font-semibold">
                                <Link
                                    to="/display/$competitionId/leaderboard"
                                    params={{ competitionId: competition.id }}
                                >
                                    Leaderboard
                                </Link>
                            </li>
                            <li className="text-blue-500 font-semibold">
                                <Link
                                    to="/display/$competitionId/next-matches"
                                    params={{ competitionId: competition.id }}
                                >
                                    Next matches
                                </Link>
                            </li>
                            <li className="text-blue-500 font-semibold">
                                <Link to="/display/$competitionId/scores" params={{ competitionId: competition.id }}>
                                    Scores
                                </Link>
                            </li>
                            <li className="text-blue-500 font-semibold">
                                <Link to="/display/$competitionId/staging" params={{ competitionId: competition.id }}>
                                    Staging
                                </Link>
                            </li>
                            <li className="text-white">
                                Arena
                                <ul className="list-disc list-inside ml-4">
                                    {startingZones &&
                                        startingZones
                                            .filter((zone) => zone.gameId === competition.gameId)
                                            .map((zone) => (
                                                <li key={zone.id} className="text-blue-500 font-semibold">
                                                    <Link
                                                        to="/display/$competitionId/arena"
                                                        params={{ competitionId: competition.id }}
                                                        search={{ startingZoneId: zone.id }}
                                                    >
                                                        Zone {zone.name}
                                                    </Link>
                                                </li>
                                            ))}
                                </ul>
                            </li>
                        </ul>
                    </div>
                ))}
        </div>
    );
}

