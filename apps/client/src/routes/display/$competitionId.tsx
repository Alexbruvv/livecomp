import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CompetitionProvider } from "../../data/competition";

export const Route = createFileRoute("/display/$competitionId")({
    component: RouteComponent,
});

function RouteComponent() {
    const { competitionId } = Route.useParams();

    return (
        <CompetitionProvider competitionId={competitionId}>
            <Outlet />
        </CompetitionProvider>
    );
}

