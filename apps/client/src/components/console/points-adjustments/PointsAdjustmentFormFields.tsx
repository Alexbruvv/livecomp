import { Input, SpaceBetween } from "@cloudscape-design/components";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import ControlledFormField from "../form/ControlledFormField";
import { insertManualPointsAdjustmentSchema } from "@livecomp/server/src/db/schema/scores";

export const pointsAdjustmentFormSchema = insertManualPointsAdjustmentSchema.omit({
    teamId: true,
});
type FormData = z.infer<typeof pointsAdjustmentFormSchema>;

export default function PointsAdjustmentFormFields({ form }: { form: UseFormReturn<FormData> }) {
    return (
        <SpaceBetween direction="vertical" size="s">
            <ControlledFormField
                label="League points change"
                form={form}
                name="leaguePoints"
                render={({ field }) => (
                    <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="League points change"
                        {...field}
                        value={field.value?.toString() ?? "0"}
                        onChange={(e) => {
                            form.setValue(field.name, parseInt(e.detail.value));
                        }}
                    />
                )}
            />

            <ControlledFormField
                form={form}
                name="reason"
                label="Reason"
                render={({ field }) => <Input placeholder="Reason" {...field} />}
            />
        </SpaceBetween>
    );
}

