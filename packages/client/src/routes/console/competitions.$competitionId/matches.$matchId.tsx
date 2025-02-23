import { api } from "../../../utils/trpc";
import { RoutedLink } from "../../../components/console/util/RoutedLink";
import EditMatchAssignmentsModalButton from "../../../components/console/matches/EditMatchAssignmentsModalButton";
import { createFileRoute } from "@tanstack/react-router";
import { SpaceBetween, Header, Container, KeyValuePairs } from "@cloudscape-design/components";
import EditMatchModalButton from "../../../components/console/matches/EditMatchModalButton";
import useCompetitionClock from "../../../hooks/useCompetitionClock";
import { DateTime } from "luxon";
import MatchStatusIndicator from "../../../components/console/matches/MatchStatusIndicator";
import NuclearCleanupScorer from "../../../components/console/scorer/NuclearCleanupScorer";

export const Route = createFileRoute("/console/competitions/$competitionId/matches/$matchId")({
    component: RouteComponent,
    beforeLoad: () => ({
        title: "Manage match",
    }),
});

function RouteComponent() {
    const { matchId, competitionId } = Route.useParams();

    const { data: match } = api.matches.fetchById.useQuery({ id: matchId });
    const { data: competition } = api.competitions.fetchById.useQuery({
        id: competitionId,
    });

    const competitionClock = useCompetitionClock(competition);

    return (
        <SpaceBetween size="s">
            <Header variant="h1">{match?.name ?? "..."}</Header>

            <Container
                header={
                    <Header
                        actions={
                            <SpaceBetween size="s" direction="horizontal">
                                {match && <EditMatchModalButton match={match} />}
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
                            value: match?.name ?? "...",
                        },
                        {
                            label: "Type",
                            value: match ? (match.type === "league" ? "League" : "Knockout") : "...",
                        },
                        {
                            label: "Sequence number",
                            value: match?.sequenceNumber ?? "...",
                        },
                        {
                            label: "Status",
                            value: match ? (
                                <MatchStatusIndicator status={competitionClock?.getMatchStatus(match.id)} />
                            ) : (
                                "???"
                            ),
                        },
                        {
                            label: "Buffer",
                            value: match?.buffer ?? "...",
                        },
                    ]}
                />
            </Container>

            <Container
                header={
                    <Header
                        actions={
                            <SpaceBetween direction="horizontal" size="xs">
                                {match && competition && (
                                    <EditMatchAssignmentsModalButton match={match} competition={competition} />
                                )}
                            </SpaceBetween>
                        }
                    >
                        Assignments
                    </Header>
                }
            >
                {competition && (
                    <KeyValuePairs
                        columns={competition.game.startingZones.length}
                        items={competition.game.startingZones.map((zone) => {
                            const assignment = match?.assignments.find(
                                (assignment) => assignment.startingZoneId === zone.id
                            );
                            const team = assignment?.team;

                            const mode = team ? "team" : assignment?.autoConfig ? "auto" : "empty";

                            return {
                                label: `Zone ${zone.name}`,
                                value:
                                    mode === "team" ? (
                                        <RoutedLink
                                            to="/console/competitions/$competitionId/teams/$teamId"
                                            params={{ competitionId, teamId: team!.id }}
                                        >
                                            {team!.shortName}
                                        </RoutedLink>
                                    ) : mode === "auto" ? (
                                        <>
                                            Position {assignment!.autoConfig!.position} (
                                            {assignment!.autoConfig!.targetMatchId
                                                ? competition.matches.find(
                                                      (match) => match.id === assignment!.autoConfig!.targetMatchId
                                                  )?.name
                                                : "League"}
                                            )
                                        </>
                                    ) : (
                                        "None"
                                    ),
                            };
                        })}
                    />
                )}
            </Container>

            <Container header={<Header>Timings</Header>}>
                <KeyValuePairs
                    columns={4}
                    items={[
                        {
                            label: "Staging open",
                            value:
                                competitionClock
                                    ?.getMatchTimings(matchId)
                                    ?.stagingOpensAt?.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS) ?? "...",
                        },
                        {
                            label: "Staging close",
                            value:
                                competitionClock
                                    ?.getMatchTimings(matchId)
                                    ?.stagingClosesAt?.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS) ?? "...",
                        },
                        {
                            label: "Match start",
                            value:
                                competitionClock
                                    ?.getMatchTimings(matchId)
                                    ?.startsAt?.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS) ?? "...",
                        },
                        {
                            label: "Match end",
                            value:
                                competitionClock
                                    ?.getMatchTimings(matchId)
                                    ?.endsAt?.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS) ?? "...",
                        },
                    ]}
                />
            </Container>

            <Container header={<Header>Scorer</Header>}>
                {match && competition?.game.scorer === "nuclear_cleanup" && (
                    <NuclearCleanupScorer match={match} game={competition.game} />
                )}
            </Container>
        </SpaceBetween>
    );
}

