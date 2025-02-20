import { Header, SpaceBetween } from "@cloudscape-design/components";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "../../../utils/trpc";
import DisplaysTable from "../../../components/console/displays/DisplaysTable";

export const Route = createFileRoute("/console/competitions/$competitionId/displays")({
    component: RouteComponent,
    beforeLoad: () => ({
        title: "Displays",
    }),
});

function RouteComponent() {
    const { competitionId } = Route.useParams();

    const { data: displays } = api.displays.fetchAll.useQuery({ filters: { competitionId } });

    return (
        <SpaceBetween size="s">
            <Header
                variant="h1"
                description={
                    <>
                        To pair a display with this competition, point it at the following path:{" "}
                        <code>
                            {window.location.origin}/display/controlled?competitionId={competitionId}
                        </code>
                        <br />
                        Note that displays can only be paired when pairing mode is enabled.
                    </>
                }
            >
                Manage displays
            </Header>

            <DisplaysTable displays={displays} displaysPending={!displays} competitionId={competitionId} />
        </SpaceBetween>
    );
}

