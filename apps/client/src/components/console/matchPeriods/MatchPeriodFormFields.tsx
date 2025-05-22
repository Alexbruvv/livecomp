import { Input, Select, SpaceBetween } from "@cloudscape-design/components";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import ControlledFormField from "../form/ControlledFormField";
import { insertMatchPeriodSchema } from "@livecomp/server/src/db/schema/matches";
import DateTimeInput from "../form/DateTimeInput";

export const matchPeriodFormSchema = insertMatchPeriodSchema.omit({ competitionId: true });
type FormData = z.infer<typeof matchPeriodFormSchema>;

const typeOptions = [
    {
        label: "League",
        value: "league",
    },
    {
        label: "Knockout",
        value: "knockout",
    },
];

export default function MatchPeriodFormFields({ form }: { form: UseFormReturn<FormData> }) {
    return (
        <SpaceBetween direction="vertical" size="s">
            <ControlledFormField
                label="Name"
                form={form}
                name="name"
                render={({ field }) => <Input placeholder="Name" {...field} />}
            />

            <ControlledFormField
                form={form}
                name="type"
                label="Type"
                render={({ field }) => (
                    <Select
                        {...field}
                        options={typeOptions}
                        selectedOption={typeOptions.find((option) => option.value === field.value) ?? null}
                        onChange={(e) => {
                            form.setValue("type", e.detail.selectedOption.value as "league" | "knockout");
                        }}
                    />
                )}
            />

            <ControlledFormField
                label="Starts at"
                form={form}
                name="startsAt"
                render={({ field }) => (
                    <DateTimeInput value={field.value} onChange={(e) => form.setValue(field.name, e.detail.value)} />
                )}
            />

            <ControlledFormField
                label="Ends at"
                form={form}
                name="endsAt"
                render={({ field }) => (
                    <DateTimeInput value={field.value} onChange={(e) => form.setValue(field.name, e.detail.value)} />
                )}
            />

            <ControlledFormField
                label="Ends at (latest)"
                form={form}
                name="endsAtLatest"
                render={({ field }) => (
                    <DateTimeInput value={field.value} onChange={(e) => form.setValue(field.name, e.detail.value)} />
                )}
            />
        </SpaceBetween>
    );
}

