import { Input, Select, SpaceBetween } from "@cloudscape-design/components";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import ControlledFormField from "../form/ControlledFormField";
import { roles } from "@livecomp/shared";

export const userFormSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1),
    role: z.enum(Object.keys(roles) as [keyof typeof roles, ...Array<keyof typeof roles>]),
});
type FormData = z.infer<typeof userFormSchema>;

export default function UserFormFields({ form }: { form: UseFormReturn<FormData> }) {
    const roleOptions = Object.keys(roles).map((role) => ({ label: role, value: role }));

    return (
        <SpaceBetween direction="vertical" size="s">
            <ControlledFormField
                label="Email"
                form={form}
                name="email"
                render={({ field }) => <Input placeholder="Email" {...field} />}
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
                            form.setValue("role", e.detail.selectedOption.value as keyof typeof roles);
                        }}
                    />
                )}
            />
        </SpaceBetween>
    );
}

