import { FormField, Input, Select, SelectProps, SpaceBetween } from "@cloudscape-design/components";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import ControlledFormField from "../form/ControlledFormField";
import { insertDisplaySchema } from "@livecomp/server/src/db/schema/displays";
import { api } from "../../../utils/trpc";
import { useMemo } from "react";

export const displayFormSchema = insertDisplaySchema.omit({ competitionId: true, identifier: true });
type FormData = z.infer<typeof displayFormSchema>;

const MODE_OPTIONS: SelectProps.Options = [
    {
        label: "Identify",
        value: "identify",
    },
    {
        label: "Outside",
        value: "outside",
    },
    {
        label: "Staging",
        value: "staging",
    },
    {
        label: "Arena",
        value: "arena",
    },
    {
        label: "Empty",
        value: "empty",
    },
];

export default function DisplayFormFields({
    form,
    competitionId,
}: {
    form: UseFormReturn<FormData>;
    competitionId: string;
}) {
    const { data: competition } = api.competitions.fetchById.useQuery({ id: competitionId });
    const startingZoneOptions = useMemo(
        () => competition?.game.startingZones.map((zone) => ({ label: `Zone ${zone.name}`, value: zone.id })) ?? [],
        [competition]
    );

    const configuration = form.watch("configuration");

    return (
        <SpaceBetween direction="vertical" size="s">
            <ControlledFormField
                label="Name"
                form={form}
                name="name"
                render={({ field }) => <Input placeholder="Name" {...field} />}
            />

            <FormField label="Mode">
                <Select
                    options={MODE_OPTIONS}
                    selectedOption={
                        MODE_OPTIONS.find((option) => option.value === configuration?.mode) ?? MODE_OPTIONS[0]
                    }
                    onChange={(e) => {
                        switch (e.detail.selectedOption.value) {
                            case "identify":
                                form.setValue("configuration", { mode: "identify" });
                                break;
                            case "outside":
                                form.setValue("configuration", { mode: "outside" });
                                break;
                            case "arena":
                                form.setValue("configuration", {
                                    mode: "arena",
                                    startingZoneId: startingZoneOptions[0].value ?? "",
                                });
                                break;
                            case "staging":
                                form.setValue("configuration", { mode: "staging" });
                                break;
                            case "empty":
                                form.setValue("configuration", {
                                    mode: "empty",
                                });
                        }
                    }}
                />
            </FormField>

            {configuration?.mode === "arena" && (
                <FormField label="Starting zone">
                    <Select
                        options={startingZoneOptions}
                        selectedOption={
                            startingZoneOptions.find((option) => option.value === configuration.startingZoneId) ?? null
                        }
                        onChange={(e) => {
                            if (!e.detail.selectedOption.value) return;

                            form.setValue("configuration", {
                                mode: "arena",
                                startingZoneId: e.detail.selectedOption.value,
                            });
                        }}
                    />
                </FormField>
            )}
        </SpaceBetween>
    );
}

