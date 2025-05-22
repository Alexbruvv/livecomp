import { Input, Select, SpaceBetween } from "@cloudscape-design/components";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import ControlledFormField from "../form/ControlledFormField";
import { insertUserSchema, Role, roleSchema } from "@livecomp/server/src/db/schema/auth";

export const userFormSchema = insertUserSchema;
type FormData = z.infer<typeof userFormSchema>;

export default function UserFormFields({ form }: { form: UseFormReturn<FormData> }) {
    const roleOptions = roleSchema.options.map((role) => ({ label: role, value: role }));

    return (
        <SpaceBetween direction="vertical" size="s">
            <ControlledFormField
                label="Username"
                form={form}
                name="username"
                render={({ field }) => <Input placeholder="Username" {...field} />}
            />

            <ControlledFormField
                label="Name"
                form={form}
                name="name"
                render={({ field }) => <Input placeholder="Name" {...field} />}
            />

            <ControlledFormField
                label="Role"
                form={form}
                name="role"
                render={({ field }) => (
                    <Select
                        {...field}
                        options={roleOptions}
                        selectedOption={roleOptions.find((option) => option.value === field.value) ?? null}
                        onChange={(e) => {
                            form.setValue("role", e.detail.selectedOption.value as Role);
                        }}
                    />
                )}
            />
        </SpaceBetween>
    );
}

