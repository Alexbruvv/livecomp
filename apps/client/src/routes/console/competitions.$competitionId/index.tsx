import { SpaceBetween, Header, Container, KeyValuePairs, Grid } from "@cloudscape-design/components";
import { createFileRoute } from "@tanstack/react-router";
import EditCompetitionModalButton from "../../../components/console/competitions/EditCompetitionModalButton";
import { RoutedLink } from "../../../components/console/util/RoutedLink";
import { DateTime } from "luxon";
import Restricted from "../../../components/console/util/Restricted";
import TeamsTable from "../../../components/console/teams/TeamsTable";
import MatchPeriodsTable from "../../../components/console/matchPeriods/MatchPeriodsTable";
import MatchesTable from "../../../components/console/matches/MatchesTable";
import ImportScheduleModalButton from "../../../components/console/competitions/ImportScheduleModalButton";
import { useCompetition } from "../../../data/competition";
import { useMemo } from "react";

export const Route = createFileRoute("/console/competitions/$competitionId/")({
    component: RouteComponent,
    beforeLoad: () => ({
        title: "Overview",
    }),
});

function RouteComponent() {
    const { competitionId } = Route.useParams();

    const competition = useCompetition();
    const matches = useMemo(() => competition.matches, [competition]);
    const teams = useMemo(() => competition.teams, [competition]);
    const matchPeriods = useMemo(() => competition.matchPeriods, [competition]);

    return (
        <SpaceBetween size="s">
            <Header variant="h1">{competition?.name ?? "..."}</Header>

            <Container
                header={
                    <Header
                        actions={
                            <Restricted permissions={{ competition: ["configure"] }}>
                                <SpaceBetween direction="horizontal" size="s">
                                    {competition && <ImportScheduleModalButton competition={competition} />}
                                    {competition && <EditCompetitionModalButton competition={competition} />}
                                </SpaceBetween>
                            </Restricted>
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
                            value: competition.name,
                        },
                        {
                            label: "Short name",
                            value: competition.shortName,
                        },
                        {
                            label: "Starts at",
                            value: DateTime.fromJSDate(competition.startsAt).toLocaleString(DateTime.DATETIME_SHORT),
                        },
                        {
                            label: "Ends at",
                            value: DateTime.fromJSDate(competition.endsAt).toLocaleString(DateTime.DATETIME_SHORT),
                        },
                        {
                            label: "Game",
                            value: (
                                <RoutedLink to="/console/games/$gameId" params={{ gameId: competition.game.id }}>
                                    {competition.game.name}
                                </RoutedLink>
                            ),
                        },
                        {
                            label: "Venue",
                            value: (
                                <RoutedLink to="/console/venues/$venueId" params={{ venueId: competition.venue.id }}>
                                    {competition.venue.name}
                                </RoutedLink>
                            ),
                        },
                        {
                            label: "Match hold offset",
                            value: competition.matchHoldOffset,
                        },
                        {
                            label: "Teams",
                            value: teams.length,
                        },
                    ]}
                />
            </Container>

            <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                <div>{competition && <TeamsTable teams={teams} teamsPending={false} competition={competition} />}</div>
                <div>
                    {competition && (
                        <MatchPeriodsTable
                            matchPeriods={matchPeriods}
                            matchPeriodsPending={false}
                            competition={competition}
                        />
                    )}
                </div>
            </Grid>

            <MatchesTable competitionId={competitionId} matchesPending={false} matches={matches} />
        </SpaceBetween>
    );
}

