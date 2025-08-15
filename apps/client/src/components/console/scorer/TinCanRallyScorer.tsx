import { Button, Checkbox, ColumnLayout, Input, SpaceBetween } from "@cloudscape-design/components";
import { AppRouterInput, AppRouterOutput } from "@livecomp/server";
import { ExcludeNull } from "../../../utils/types";
import { useEffect, useState } from "react";
import { api } from "../../../utils/trpc";
import { showFlashbar } from "../../../state/flashbars";

type InputData = AppRouterInput["scores"]["submitTinCanRallyScores"]["data"];

const VALID_TOKEN_EXPR = /^[CIX]*$/;

export default function TinCanRallyScorer({
    match,
    game,
}: {
    match: ExcludeNull<AppRouterOutput["matches"]["fetchById"]>;
    game: ExcludeNull<AppRouterOutput["competitions"]["fetchById"]>["game"];
}) {
    const [state, setState] = useState<InputData>(
        (match.scoreEntry?.scoreData as InputData) ?? {
            teams: match.assignments.map((assignment) => ({
                teamId: assignment.teamId,
                present: false,
                disqualified: false,
                actions: "",
            })),
        }
    );

    useEffect(() => {
        if (match.scoreEntry) {
            setState(match.scoreEntry.scoreData as InputData);
        }
    }, [match]);

    const { mutate: submitScores, isPending } = api.scores.submitTinCanRallyScores.useMutation({
        onError: (error) => showFlashbar({ type: "error", content: error.message }),
    });

    return (
        <SpaceBetween size="s">
            <ColumnLayout columns={2}>
                {game.startingZones.map((startingZone) => {
                    const assignment = match.assignments.find(
                        (assignment) => assignment.startingZoneId === startingZone.id
                    );

                    return (
                        <div key={startingZone.id}>
                            <h3>
                                Zone {startingZone.name} ({assignment?.team?.shortName ?? "No team"})
                            </h3>

                            <SpaceBetween direction="vertical" size="s">
                                <ColumnLayout columns={2}>
                                    <Checkbox
                                        checked={
                                            state.teams.find((team) => team.teamId === assignment?.teamId)?.present ??
                                            false
                                        }
                                        onChange={(e) =>
                                            setState((state) => ({
                                                ...state,
                                                teams: state.teams.map((team) =>
                                                    team.teamId === assignment?.teamId
                                                        ? {
                                                              ...team,
                                                              present: e.detail.checked,
                                                          }
                                                        : team
                                                ),
                                            }))
                                        }
                                    >
                                        Present
                                    </Checkbox>

                                    <Checkbox
                                        checked={
                                            state.teams.find((team) => team.teamId === assignment?.teamId)
                                                ?.disqualified ?? false
                                        }
                                        onChange={(e) =>
                                            setState((state) => ({
                                                ...state,
                                                teams: state.teams.map((team) =>
                                                    team.teamId === assignment?.teamId
                                                        ? {
                                                              ...team,
                                                              disqualified: e.detail.checked,
                                                          }
                                                        : team
                                                ),
                                            }))
                                        }
                                    >
                                        Disqualified
                                    </Checkbox>
                                </ColumnLayout>

                                <div>
                                    <b>Actions</b> (C = knocked over can, I = crossed line, X = reversed over line)
                                    <Input
                                        value={
                                            state["teams"].find((team) => team.teamId === assignment?.teamId)
                                                ?.actions ?? ""
                                        }
                                        onChange={(e) => {
                                            e.detail.value = e.detail.value.toUpperCase();

                                            if (!VALID_TOKEN_EXPR.test(e.detail.value)) {
                                                showFlashbar({
                                                    type: "error",
                                                    content: "Invalid token. Only C, I, and X are allowed.",
                                                });
                                                return;
                                            }

                                            setState((state) => ({
                                                ...state,
                                                teams: state.teams.map((team) =>
                                                    team.teamId === assignment?.teamId
                                                        ? {
                                                              ...team,
                                                              actions: e.detail.value,
                                                          }
                                                        : team
                                                ),
                                            }));
                                        }}
                                    />
                                </div>
                            </SpaceBetween>
                        </div>
                    );
                })}
            </ColumnLayout>

            <Button loading={isPending} onClick={() => submitScores({ matchId: match.id, data: state })}>
                Save
            </Button>
        </SpaceBetween>
    );
}

