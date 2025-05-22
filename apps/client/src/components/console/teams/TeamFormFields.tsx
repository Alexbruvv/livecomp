import { Input, Select, SpaceBetween } from "@cloudscape-design/components";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { insertTeamSchema } from "@livecomp/server/src/db/schema/teams";
import ControlledFormField from "../form/ControlledFormField";
import { useMemo } from "react";
import { api } from "../../../utils/trpc";
import { Competition } from "@livecomp/server/src/db/schema/competitions";

export const teamFormSchema = insertTeamSchema.omit({ competitionId: true });
type FormData = z.infer<typeof teamFormSchema>;

export default function TeamFormFields({
    form,
    competition,
}: {
    form: UseFormReturn<FormData>;
    competition: Competition;
}) {
    const { data: regions, isPending: regionsPending } = api.regions.fetchAll.useQuery({
        filters: { venueId: competition.venueId },
    });

    const regionOptions = useMemo(
        () => regions?.map((region) => ({ label: region.name, value: region.id })) ?? [],
        [regions]
    );

    return (
        <SpaceBetween direction="vertical" size="s">
            <ControlledFormField
                label="Name"
                form={form}
                name="name"
                render={({ field }) => <Input placeholder="Name" {...field} />}
            />

            <ControlledFormField
                label="Short name"
                form={form}
                name="shortName"
                render={({ field }) => <Input placeholder="Name" {...field} />}
            />

            <ControlledFormField
                label="Region"
                form={form}
                name="regionId"
                render={({ field }) => (
                    <Select
                        {...field}
                        options={regionOptions}
                        selectedOption={regionOptions.find((option) => option.value === field.value) ?? null}
                        onChange={(e) => {
                            form.setValue("regionId", e.detail.selectedOption.value ?? "");
                        }}
                        loadingText="Loading regions"
                        statusType={regionsPending ? "loading" : undefined}
                    />
                )}
            />
        </SpaceBetween>
    );
}

