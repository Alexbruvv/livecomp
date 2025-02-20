import { Input, Select, SelectProps, SpaceBetween } from "@cloudscape-design/components";
import { insertGameSchema, Scorer } from "@livecomp/server/src/db/schema/games";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import ControlledFormField from "../form/ControlledFormField";

export const gameFormSchema = insertGameSchema;
type FormData = z.infer<typeof insertGameSchema>;

const scorerOptions: SelectProps.Options = [
    { value: undefined, label: "None" },
    { value: "nuclear_cleanup", label: "Nuclear Cleanup" },
];

export default function GameFormFields({ form }: { form: UseFormReturn<FormData> }) {
    return (
        <SpaceBetween direction="vertical" size="s">
            <ControlledFormField
                label="Name"
                form={form}
                name="name"
                render={({ field }) => <Input placeholder="Name" {...field} />}
            />

            <ControlledFormField
                label="Match duration"
                form={form}
                name="matchDuration"
                render={({ field }) => (
                    <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="Match duration"
                        {...field}
                        value={field.value.toString()}
                        onChange={(e) => {
                            form.setValue(field.name, parseInt(e.detail.value));
                        }}
                    />
                )}
            />

            <ControlledFormField
                label="Default match spacing"
                form={form}
                name="defaultMatchSpacing"
                render={({ field }) => (
                    <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="Default match spacing"
                        {...field}
                        value={field.value.toString()}
                        onChange={(e) => {
                            form.setValue(field.name, parseInt(e.detail.value));
                        }}
                    />
                )}
            />

            <ControlledFormField
                label="Staging open offset"
                form={form}
                name="stagingOpenOffset"
                render={({ field }) => (
                    <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="Staging open offset"
                        {...field}
                        value={field.value?.toString() ?? "0"}
                        onChange={(e) => {
                            form.setValue(field.name, parseInt(e.detail.value));
                        }}
                    />
                )}
            />

            <ControlledFormField
                label="Staging close offset"
                form={form}
                name="stagingCloseOffset"
                render={({ field }) => (
                    <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="Staging close offset"
                        {...field}
                        value={field.value?.toString() ?? "0"}
                        onChange={(e) => {
                            form.setValue(field.name, parseInt(e.detail.value));
                        }}
                    />
                )}
            />

            <ControlledFormField
                label="Scorer"
                form={form}
                name="scorer"
                render={({ field }) => (
                    <Select
                        options={scorerOptions}
                        selectedOption={scorerOptions.find((opt) => opt.value === (field.value ?? undefined)) ?? null}
                        onChange={(e) =>
                            form.setValue(
                                field.name,
                                (e.detail.selectedOption.value ?? undefined) as Scorer | undefined
                            )
                        }
                    />
                )}
            />
        </SpaceBetween>
    );
}

