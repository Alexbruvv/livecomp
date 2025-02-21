import {
    Box,
    Button,
    ColumnLayout,
    Form,
    FormField,
    Header,
    Input,
    Modal,
    Select,
    SpaceBetween,
} from "@cloudscape-design/components";
import { Fragment, useEffect, useState } from "react";
import { AppRouterOutput } from "@livecomp/server";
import { ExcludeNull } from "../../../utils/types";
import { api } from "../../../utils/trpc";
import { showFlashbar } from "../../../state/flashbars";

type FormData = Record<
    string,
    | { type: "none" }
    | { type: "team"; teamId: string }
    | { type: "auto"; targetMatchId: string | undefined; position: number }
>;

const TYPE_OPTIONS = [
    { label: "None", value: "none" },
    { label: "Team", value: "team" },
    { label: "Auto", value: "auto" },
];

function generateDefaultData(
    match: ExcludeNull<AppRouterOutput["matches"]["fetchById"]>,
    competition: ExcludeNull<AppRouterOutput["competitions"]["fetchById"]>
): FormData {
    return Object.fromEntries(
        competition.game.startingZones.map((startingZone) => {
            const assignment = match.assignments.find((a) => a.startingZoneId === startingZone.id);
            let assignmentConfig: FormData[string] = { type: "none" };

            if (assignment) {
                if (assignment.team) {
                    assignmentConfig = { type: "team", teamId: assignment.team.id };
                } else if (assignment.autoConfig) {
                    assignmentConfig = {
                        type: "auto",
                        targetMatchId: assignment.autoConfig.targetMatchId ?? undefined,
                        position: assignment.autoConfig.position,
                    };
                }
            }

            return [startingZone.id, assignmentConfig];
        })
    );
}

export default function EditMatchAssignmentsModalButton({
    match,
    competition,
}: {
    match: ExcludeNull<AppRouterOutput["matches"]["fetchById"]>;
    competition: ExcludeNull<AppRouterOutput["competitions"]["fetchById"]>;
}) {
    const [visible, setVisible] = useState(false);

    const { mutate: updateAssignments, isPending } = api.matches.updateAssignments.useMutation({
        onError: (error) => {
            showFlashbar({ type: "error", content: error.message });
        },
        onSettled: () => setVisible(false),
    });

    const { data: teams } = api.teams.fetchAll.useQuery({ filters: { competitionId: competition.id } });
    const { data: matches } = api.matches.fetchAll.useQuery({ filters: { competitionId: competition.id } });

    const teamOptions = (teams ?? []).map((team) => ({ label: team.shortName, value: team.id }));
    const matchOptions = [
        { label: "League", value: undefined },
        ...(matches ?? []).map((m) => ({ label: m.name, value: m.id })),
    ];

    const [formState, setFormState] = useState<FormData>(generateDefaultData(match, competition));

    useEffect(() => {
        setFormState(generateDefaultData(match, competition));
    }, [match, competition]);

    const onSubmit = () => {
        updateAssignments({
            id: match.id,
            assignments: Object.fromEntries(
                Object.entries(formState).map(([zoneId, config]) => {
                    if (config.type !== "auto") return [zoneId, config];

                    return [
                        zoneId,
                        {
                            ...config,
                            targetMatchId: config.targetMatchId ?? null,
                        },
                    ];
                })
            ),
        });
    };

    return (
        <>
            <Button iconName="edit" variant="icon" onClick={() => setVisible(true)} />

            <Modal visible={visible} size="large" onDismiss={() => setVisible(false)} header="Update match assignments">
                <Form>
                    <SpaceBetween direction="vertical" size="s">
                        <ColumnLayout columns={2} borders="horizontal">
                            {competition.game.startingZones.map((startingZone) => {
                                const formValue = formState[startingZone.id];

                                return (
                                    <Fragment key={startingZone.id}>
                                        <div>
                                            <SpaceBetween direction="vertical" size="xs">
                                                <Header variant="h3">Zone {startingZone.name}</Header>

                                                <FormField label="Type">
                                                    <Select
                                                        selectedOption={
                                                            TYPE_OPTIONS.find(
                                                                (option) =>
                                                                    option.value === formState[startingZone.id].type
                                                            ) ?? null
                                                        }
                                                        onChange={(e) => {
                                                            const currentValue = formState[startingZone.id];
                                                            const defaultData = generateDefaultData(match, competition)[
                                                                startingZone.id
                                                            ];

                                                            if (currentValue.type === e.detail.selectedOption.value) {
                                                                return;
                                                            }

                                                            if (e.detail.selectedOption.value === defaultData.type) {
                                                                setFormState({
                                                                    ...formState,
                                                                    [startingZone.id]: defaultData,
                                                                });
                                                            } else {
                                                                switch (e.detail.selectedOption.value) {
                                                                    case "none":
                                                                        setFormState({
                                                                            ...formState,
                                                                            [startingZone.id]: { type: "none" },
                                                                        });
                                                                        break;
                                                                    case "team":
                                                                        setFormState({
                                                                            ...formState,
                                                                            [startingZone.id]: {
                                                                                type: "team",
                                                                                teamId: "",
                                                                            },
                                                                        });
                                                                        break;
                                                                    case "auto":
                                                                        setFormState({
                                                                            ...formState,
                                                                            [startingZone.id]: {
                                                                                type: "auto",
                                                                                targetMatchId: undefined,
                                                                                position: 0,
                                                                            },
                                                                        });
                                                                        break;
                                                                }
                                                            }
                                                        }}
                                                        options={TYPE_OPTIONS}
                                                    />
                                                </FormField>
                                            </SpaceBetween>
                                        </div>
                                        <div>
                                            <SpaceBetween direction="vertical" size="xs">
                                                <Header variant="h3">Configuration</Header>
                                                {formValue.type === "team" && teams && (
                                                    <FormField label="Team">
                                                        <Select
                                                            selectedOption={
                                                                teamOptions.find(
                                                                    (option) => option.value === formValue.teamId
                                                                ) ?? null
                                                            }
                                                            onChange={(e) => {
                                                                setFormState({
                                                                    ...formState,
                                                                    [startingZone.id]: {
                                                                        type: "team",
                                                                        teamId: e.detail.selectedOption.value ?? "",
                                                                    },
                                                                });
                                                            }}
                                                            options={teamOptions}
                                                        />
                                                    </FormField>
                                                )}

                                                {formValue.type === "auto" && matches && (
                                                    <>
                                                        <FormField label="Match">
                                                            <Select
                                                                selectedOption={
                                                                    matchOptions.find(
                                                                        (option) =>
                                                                            option.value === formValue.targetMatchId
                                                                    ) ?? null
                                                                }
                                                                onChange={(e) => {
                                                                    setFormState({
                                                                        ...formState,
                                                                        [startingZone.id]: {
                                                                            type: "auto",
                                                                            targetMatchId:
                                                                                e.detail.selectedOption.value ??
                                                                                undefined,
                                                                            position: formValue.position,
                                                                        },
                                                                    });
                                                                }}
                                                                options={matchOptions}
                                                            />
                                                        </FormField>

                                                        <FormField label="Position">
                                                            <Input
                                                                type="number"
                                                                value={formValue.position.toString()}
                                                                onChange={(e) => {
                                                                    setFormState({
                                                                        ...formState,
                                                                        [startingZone.id]: {
                                                                            type: "auto",
                                                                            targetMatchId: formValue.targetMatchId,
                                                                            position: parseInt(e.detail.value),
                                                                        },
                                                                    });
                                                                }}
                                                            />
                                                        </FormField>
                                                    </>
                                                )}
                                            </SpaceBetween>
                                        </div>
                                    </Fragment>
                                );
                            })}
                        </ColumnLayout>

                        <Box float="right">
                            <SpaceBetween direction="horizontal" size="xs">
                                <Button variant="link" onClick={() => setVisible(false)}>
                                    Cancel
                                </Button>

                                <Button variant="primary" onClick={onSubmit} loading={isPending}>
                                    Save
                                </Button>
                            </SpaceBetween>
                        </Box>
                    </SpaceBetween>
                </Form>
            </Modal>
        </>
    );
}

