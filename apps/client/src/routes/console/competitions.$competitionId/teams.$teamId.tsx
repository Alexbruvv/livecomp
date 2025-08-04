import { Container, Header, KeyValuePairs, SpaceBetween } from "@cloudscape-design/components";
import { createFileRoute } from "@tanstack/react-router";
import EditTeamModalButton from "../../../components/console/teams/EditTeamModalButton";
import MatchesTable from "../../../components/console/matches/MatchesTable";
import useRankings from "../../../hooks/use-rankings";
import { useCompetition } from "../../../data/competition";
import { useMemo } from "react";
import PointsAdjustmentsTable from "../../../components/console/points-adjustments/PointsAdjustmentsTable";

export const Route = createFileRoute("/console/competitions/$competitionId/teams/$teamId")({
    component: RouteComponent,
    beforeLoad: () => ({
        title: "Manage team",
    }),
});

function RouteComponent() {
    const { teamId, competitionId } = Route.useParams();

    const competition = useCompetition();
    const team = useMemo(() => competition.teams.find((t) => t.id === teamId), [competition, teamId]);
    const region = useMemo(() => competition.venue.regions.find((r) => r.id === team?.regionId), [competition, team]);
    const matches = useMemo(
        () => competition.matches.filter((m) => m.assignments.some((a) => a.teamId === teamId)),
        [competition, teamId]
    );
    const pointsAdjustments = useMemo(() => team?.pointsAdjustments ?? [], [team]);

    const rankings = useRankings(competition);

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
                    columns={4}
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
                        {
                            label: "League Rank",
                            value: rankings ? rankings[team?.id ?? ""] : "...",
                        },
                    ]}
                />
            </Container>

            <MatchesTable matchesPending={false} matches={matches} competitionId={competitionId} />
            {team && <PointsAdjustmentsTable pointsAdjustments={pointsAdjustments} teamId={team.id} />}
        </SpaceBetween>
    );
}

