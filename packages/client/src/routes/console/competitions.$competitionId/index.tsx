import { SpaceBetween, Header, Container, KeyValuePairs, Grid } from "@cloudscape-design/components";
import { createFileRoute } from "@tanstack/react-router";
import EditCompetitionModalButton from "../../../components/console/competitions/EditCompetitionModalButton";
import TeamsTable from "../../../components/console/competitions/teams/TeamsTable";
import { RoutedLink } from "../../../components/console/util/RoutedLink";
import { api } from "../../../utils/trpc";
import MatchPeriodsTable from "../../../components/console/competitions/matchPeriods/MatchPeriodsTable";
import { DateTime } from "luxon";

export const Route = createFileRoute("/console/competitions/$competitionId/")({
    component: RouteComponent,
    beforeLoad: () => ({
        title: "Overview",
    }),
});

function RouteComponent() {
    const { competitionId } = Route.useParams();

    const { data: competition } = api.competitions.fetchById.useQuery({
        id: competitionId,
    });
    const { data: game } = api.games.fetchById.useQuery({ id: competition?.gameId ?? "" }, { enabled: !!competition });
    const { data: venue } = api.venues.fetchById.useQuery(
        { id: competition?.venueId ?? "" },
        { enabled: !!competition }
    );
    const { data: teams, isPending: teamsPending } = api.teams.fetchAll.useQuery({
        filters: { competitionId: competitionId },
    });
    const { data: matchPeriods, isPending: matchPeriodsPending } = api.matchPeriods.fetchAll.useQuery({
        filters: { competitionId: competitionId },
    });

    return (
        <SpaceBetween size="s">
            <Header variant="h1">{competition?.name ?? "..."}</Header>

            <Container
                header={
                    <Header
                        actions={
                            <SpaceBetween direction="horizontal" size="s">
                                {competition && <EditCompetitionModalButton competition={competition} />}
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
                            value: competition?.name ?? "...",
                        },
                        {
                            label: "Short name",
                            value: competition?.shortName ?? "...",
                        },
                        {
                            label: "Starts at",
                            value: competition
                                ? DateTime.fromJSDate(competition.startsAt).toLocaleString(DateTime.DATETIME_SHORT)
                                : "...",
                        },
                        {
                            label: "Ends at",
                            value: competition
                                ? DateTime.fromJSDate(competition.endsAt).toLocaleString(DateTime.DATETIME_SHORT)
                                : "...",
                        },
                        {
                            label: "Game",
                            value: game ? (
                                <RoutedLink to="/console/games/$gameId" params={{ gameId: game.id }}>
                                    {game.name}
                                </RoutedLink>
                            ) : (
                                "..."
                            ),
                        },
                        {
                            label: "Venue",
                            value: venue ? (
                                <RoutedLink to="/console/venues/$venueId" params={{ venueId: venue.id }}>
                                    {venue.name}
                                </RoutedLink>
                            ) : (
                                "..."
                            ),
                        },
                        {
                            label: "Teams",
                            value: teams ? teams.length : "...",
                        },
                    ]}
                />
            </Container>

            <Grid gridDefinition={[{ colspan: 8 }, { colspan: 4 }]}>
                <div>
                    {competition && <TeamsTable teams={teams} teamsPending={teamsPending} competition={competition} />}
                </div>
                <div>
                    {competition && (
                        <MatchPeriodsTable
                            matchPeriods={matchPeriods}
                            matchPeriodsPending={matchPeriodsPending}
                            competition={competition}
                        />
                    )}
                </div>
            </Grid>
        </SpaceBetween>
    );
}

