import { Button, Checkbox, ColumnLayout, Input, SpaceBetween } from "@cloudscape-design/components";
import { AppRouterInput, AppRouterOutput } from "@livecomp/server";
import { ExcludeNull } from "../../../utils/types";
import { useState } from "react";
import { api } from "../../../utils/trpc";
import { showFlashbar } from "../../../state/flashbars";

type InputData = AppRouterInput["scores"]["submitNuclearCleanupScores"]["data"];

export default function NuclearCleanupScorer({
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
                leftStartingZone: false,
            })),
            zoneTokenCounts: {
                outerWest: 0,
                innerWest: 0,
                innerEast: 0,
                outerEast: 0,
            },
        }
    );

    const { mutate: submitScores, isPending } = api.scores.submitNuclearCleanupScores.useMutation({
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

                            <ColumnLayout columns={2}>
                                <Checkbox
                                    checked={
                                        state.teams.find((team) => team.teamId === assignment?.teamId)?.present ?? false
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
                                            ?.leftStartingZone ?? false
                                    }
                                    onChange={(e) =>
                                        setState((state) => ({
                                            ...state,
                                            teams: state.teams.map((team) =>
                                                team.teamId === assignment?.teamId
                                                    ? {
                                                          ...team,
                                                          leftStartingZone: e.detail.checked,
                                                      }
                                                    : team
                                            ),
                                        }))
                                    }
                                >
                                    Left starting zone
                                </Checkbox>
                            </ColumnLayout>
                        </div>
                    );
                })}
            </ColumnLayout>

            <h3>Token counts</h3>
            <ColumnLayout columns={4}>
                {["outerWest", "innerWest", "innerEast", "outerEast"].map((zone) => (
                    <div key={zone}>
                        <Input
                            type="number"
                            value={state.zoneTokenCounts[zone as keyof InputData["zoneTokenCounts"]].toString()}
                            onChange={(e) =>
                                setState((state) => ({
                                    ...state,
                                    zoneTokenCounts: {
                                        ...state.zoneTokenCounts,
                                        [zone]: parseInt(e.detail.value),
                                    },
                                }))
                            }
                        />
                    </div>
                ))}
            </ColumnLayout>

            <Button loading={isPending} onClick={() => submitScores({ matchId: match.id, data: state })}>
                Save
            </Button>
        </SpaceBetween>
    );
}

