import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CompetitionProvider } from "../../data/competition";

export const Route = createFileRoute("/console/competitions/$competitionId")({
    component: RouteComponent,
    beforeLoad: () => ({
        title: "Manage competition",
    }),
});

function RouteComponent() {
    const { competitionId } = Route.useParams();

    return (
        <CompetitionProvider competitionId={competitionId}>
            <Outlet />
        </CompetitionProvider>
    );
}

