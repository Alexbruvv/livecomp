import { SpaceBetween, Input } from "@cloudscape-design/components";
import { insertRegionSchema } from "@livecomp/server/src/db/schema/venues";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import ControlledFormField from "../form/ControlledFormField";

export const regionFormSchema = insertRegionSchema.omit({ venueId: true });

export default function RegionFormFields({ form }: { form: UseFormReturn<z.infer<typeof regionFormSchema>> }) {
    return (
        <SpaceBetween direction="vertical" size="s">
            <ControlledFormField
                label="Name"
                form={form}
                name="name"
                render={({ field }) => <Input placeholder="Name" {...field} />}
            />
        </SpaceBetween>
    );
}

