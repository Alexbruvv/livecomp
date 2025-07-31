import { createFileRoute } from "@tanstack/react-router";
import { api } from "../../../utils/trpc";
import { Button, ColumnLayout, Container, Header, KeyValuePairs, SpaceBetween } from "@cloudscape-design/components";
import MatchesTable from "../../../components/console/matches/MatchesTable";
import useCompetitionClock from "../../../hooks/use-competition-clock";
import { useCompetition } from "../../../data/competition";
import { useMemo } from "react";

export const Route = createFileRoute("/console/competitions/$competitionId/control")({
    component: RouteComponent,
    beforeLoad: () => ({
        title: "Control",
    }),
});

function RouteComponent() {
    const { competitionId } = Route.useParams();

    const competition = useCompetition();
    const competitionClock = useCompetitionClock(competition);

    const { mutate: pause, isPending: pausePending } = api.competitions.pause.useMutation();
    const { mutate: unpause, isPending: unpausePending } = api.competitions.unpause.useMutation();
    const { mutate: editMatch, isPending: editMatchPending } = api.matches.update.useMutation();

    const nextMatchId = competitionClock.getNextMatchId();
    const nextMatch = useMemo(
        () => competition.matches.find((match) => match.id === nextMatchId),
        [nextMatchId, competition]
    );

    return (
        <SpaceBetween size="s">
            <Container header={<Header description={competition.name}>Match Control</Header>}>
                {competition && (
                    <ColumnLayout columns={2}>
                        <div>
                            <ColumnLayout columns={3}>
                                <Button
                                    iconName="play"
                                    fullWidth
                                    disabled={!competitionClock.isPaused()}
                                    loading={unpausePending}
                                    onClick={() => unpause({ id: competitionId })}
                                >
                                    Play
                                </Button>
                                <Button
                                    iconName="pause"
                                    fullWidth
                                    disabled={competitionClock.isPaused()}
                                    loading={pausePending}
                                    onClick={() => pause({ id: competitionId })}
                                >
                                    Pause
                                </Button>
                                <Button
                                    iconName="check"
                                    fullWidth
                                    disabled={
                                        !nextMatchId ||
                                        competition.matches.find((match) => match.id === nextMatchId)?.released
                                    }
                                    loading={editMatchPending}
                                    onClick={() => {
                                        if (nextMatchId) {
                                            editMatch({
                                                id: nextMatchId,
                                                data: {
                                                    released: true,
                                                },
                                            });
                                        }
                                    }}
                                >
                                    Release {nextMatch ? nextMatch.name : "next match"}
                                </Button>
                            </ColumnLayout>
                        </div>
                        <div>
                            <KeyValuePairs
                                columns={2}
                                items={[
                                    {
                                        label: "Match Period",
                                        value: competitionClock.getCurrentMatchPeriod()?.name ?? "None",
                                    },
                                    {
                                        label: "Status",
                                        value: competitionClock.isPaused() ? "Paused" : "Running",
                                    },
                                    {
                                        label: "Staging matches",
                                        value:
                                            competition.matches
                                                .filter(
                                                    (match) => competitionClock?.getMatchStatus(match.id) === "staging"
                                                )
                                                .map((match) => match.name)
                                                .join(", ") || "None",
                                    },
                                    {
                                        label: "In progress matches",
                                        value:
                                            competition.matches
                                                .filter(
                                                    (match) =>
                                                        competitionClock?.getMatchStatus(match.id) === "inProgress"
                                                )
                                                .map((match) => match.name)
                                                .join(", ") || "None",
                                    },
                                ]}
                            />
                        </div>
                    </ColumnLayout>
                )}
            </Container>

            {competition && (
                <MatchesTable competitionId={competitionId} matches={competition.matches} matchesPending={false} />
            )}
        </SpaceBetween>
    );
}

