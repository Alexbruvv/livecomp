import { Input, SpaceBetween } from "@cloudscape-design/components";
import { insertVenueSchema } from "@livecomp/server/src/db/schema/venues";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import ControlledFormField from "../form/ControlledFormField";

export const venueFormSchema = insertVenueSchema;

export default function VenueFormFields({ form }: { form: UseFormReturn<z.infer<typeof venueFormSchema>> }) {
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

