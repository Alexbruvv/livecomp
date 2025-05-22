import { Container, Header, KeyValuePairs, SpaceBetween } from "@cloudscape-design/components";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "../../../utils/trpc";
import EditTeamModalButton from "../../../components/console/teams/EditTeamModalButton";
import MatchesTable from "../../../components/console/matches/MatchesTable";

export const Route = createFileRoute("/console/competitions/$competitionId/teams/$teamId")({
    component: RouteComponent,
    beforeLoad: () => ({
        title: "Manage team",
    }),
});

function RouteComponent() {
    const { teamId, competitionId } = Route.useParams();

    const { data: team } = api.teams.fetchById.useQuery({ id: teamId });
    const { data: competition } = api.competitions.fetchById.useQuery({ id: competitionId });
    const { data: region } = api.regions.fetchById.useQuery({ id: team?.regionId ?? "" }, { enabled: !!team });
    const { data: matches, isPending: matchesPending } = api.matches.fetchAll.useQuery({ filters: { teamId } });

    return (
        <SpaceBetween size="s">
            <Header variant="h1">{team?.name ?? "..."}</Header>

            <Container
                header={
                    <Header
                        actions={
                            <SpaceBetween direction="horizontal" size="s">
                                {team && competition && <EditTeamModalButton team={team} competition={competition} />}
                            </SpaceBetween>
                        }
                    >
                        General
                    </Header>
                }
            >
                <KeyValuePairs
                    columns={3}
                    items={[
                        {
                            label: "Name",
                            value: team?.name ?? "...",
                        },
                        {
                            label: "Short name",
                            value: team?.shortName ?? "...",
                        },
                        {
                            label: "Region",
                            value: region?.name ?? "...",
                        },
                    ]}
                />
            </Container>

            <MatchesTable matchesPending={matchesPending} matches={matches} competitionId={competitionId} />
        </SpaceBetween>
    );
}

