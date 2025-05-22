import { Input, SpaceBetween } from "@cloudscape-design/components";
import { insertStartingZoneSchema } from "@livecomp/server/src/db/schema/games";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import ControlledFormField from "../form/ControlledFormField";

export const startingZoneFormSchema = insertStartingZoneSchema.omit({ gameId: true });

export default function StartingZoneFormFields({
    form,
}: {
    form: UseFormReturn<z.infer<typeof startingZoneFormSchema>>;
}) {
    return (
        <SpaceBetween direction="vertical" size="s">
            <ControlledFormField
                label="Name"
                form={form}
                name="name"
                render={({ field }) => <Input placeholder="Name" {...field} />}
            />

            <ControlledFormField
                label="Color"
                description="This should be a valid CSS color string. For example, 'red' or '#ff0000'."
                form={form}
                name="color"
                render={({ field }) => <Input placeholder="Color" {...field} />}
            />
        </SpaceBetween>
    );
}

