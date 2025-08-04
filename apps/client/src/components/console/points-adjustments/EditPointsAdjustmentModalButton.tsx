import { Box, Button, Form, Modal, SpaceBetween } from "@cloudscape-design/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../../../utils/trpc";
import PointsAdjustmentFormFields, { pointsAdjustmentFormSchema } from "./PointsAdjustmentFormFields";
import { ManualPointsAdjustment } from "@livecomp/server";

const formSchema = pointsAdjustmentFormSchema;
type FormData = z.infer<typeof formSchema>;

export default function EditPointsAdjustmentModalButton({
    pointsAdjustment,
}: {
    pointsAdjustment: ManualPointsAdjustment;
}) {
    const [visible, setVisible] = useState(false);

    const { mutate: updatePointsAdjustment, isPending } = api.pointsAdjustments.update.useMutation({
        onSuccess: async () => {
            setVisible(false);
        },
        onError: (error) => {
            form.setError("root", { message: error.message });
        },
        onSettled: () => form.reset(),
    });

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ...pointsAdjustment,
        },
    });

    useEffect(() => {
        form.reset({
            ...pointsAdjustment,
        });
    }, [form, pointsAdjustment]);

    const onSubmit = (data: FormData) => {
        updatePointsAdjustment({ id: pointsAdjustment.id, data });
    };

    return (
        <>
            <Button iconName="edit" variant="icon" onClick={() => setVisible(true)} />

            <Modal visible={visible} onDismiss={() => setVisible(false)} header="Edit points adjustment">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Form>
                        <SpaceBetween direction="vertical" size="s">
                            <PointsAdjustmentFormFields form={form} />

                            <Box float="right">
                                <SpaceBetween direction="horizontal" size="xs">
                                    <Button variant="link" onClick={() => setVisible(false)}>
                                        Cancel
                                    </Button>

                                    <Button variant="primary" formAction="submit" loading={isPending}>
                                        Save
                                    </Button>
                                </SpaceBetween>
                            </Box>
                        </SpaceBetween>
                    </Form>
                </form>
            </Modal>
        </>
    );
}

