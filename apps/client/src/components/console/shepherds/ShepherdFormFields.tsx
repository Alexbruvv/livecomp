import { SpaceBetween, Input, Checkbox } from "@cloudscape-design/components";
import { insertShepherdSchema, Region } from "@livecomp/server/src/db/schema/venues";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import ControlledFormField from "../form/ControlledFormField";

export const shepherdFormSchema = insertShepherdSchema.omit({ venueId: true });

export default function ShepherdFormFields({
    form,
    regions,
}: {
    form: UseFormReturn<z.infer<typeof shepherdFormSchema>>;
    regions: Region[];
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
                label="Regions"
                form={form}
                name="regionIds"
                render={({ field }) => (
                    <>
                        {regions.map((region) => (
                            <Checkbox
                                key={region.id}
                                checked={field.value?.includes(region.id) ?? false}
                                onChange={(e) => {
                                    if (e.detail.checked) {
                                        form.setValue("regionIds", [...(field.value ?? []), region.id]);
                                    } else {
                                        form.setValue(
                                            "regionIds",
                                            field.value?.filter((id) => id !== region.id)
                                        );
                                    }
                                }}
                            >
                                {region.name}
                            </Checkbox>
                        ))}
                    </>
                )}
            />
        </SpaceBetween>
    );
}

