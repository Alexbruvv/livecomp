import { Input, Select, SpaceBetween } from "@cloudscape-design/components";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import ControlledFormField from "../form/ControlledFormField";
import { insertMatchSchema } from "@livecomp/server/src/db/schema/matches";

export const matchFormSchema = insertMatchSchema.omit({ competitionId: true });
type FormData = z.infer<typeof matchFormSchema>;

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

export default function MatchFormFields({ form }: { form: UseFormReturn<FormData> }) {
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
                label="Sequence number"
                form={form}
                name="sequenceNumber"
                render={({ field }) => (
                    <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="Sequence number"
                        {...field}
                        value={field.value.toString()}
                        onChange={(e) => {
                            form.setValue(field.name, parseInt(e.detail.value));
                        }}
                    />
                )}
            />

            <ControlledFormField
                label="Buffer (seconds)"
                form={form}
                name="buffer"
                render={({ field }) => (
                    <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="Buffer"
                        {...field}
                        value={field.value !== undefined ? field.value.toString() : "0"}
                        onChange={(e) => {
                            form.setValue(field.name, parseInt(e.detail.value));
                        }}
                    />
                )}
            />
        </SpaceBetween>
    );
}

