import { Box, Button, Form, Modal, SpaceBetween } from "@cloudscape-design/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../../../utils/trpc";
import PointsAdjustmentFormFields, { pointsAdjustmentFormSchema } from "./PointsAdjustmentFormFields";

const formSchema = pointsAdjustmentFormSchema;
type FormData = z.infer<typeof formSchema>;

export default function AddPointsAdjustmentModalButton({ teamId }: { teamId: string }) {
    const [visible, setVisible] = useState(false);

    const { mutate: addPointsAdjustment, isPending } = api.pointsAdjustments.create.useMutation({
        onSuccess: async () => {
            setVisible(false);
        },
        onError: (error) => {
            form.setError("root", { message: error.message });
        },
    });

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = (data: FormData) => {
        addPointsAdjustment({
            data: {
                ...data,
                teamId,
            },
        });
    };

    return (
        <>
            <Button variant="primary" onClick={() => setVisible(true)}>
                Add
            </Button>

            <Modal visible={visible} onDismiss={() => setVisible(false)} header="Add points adjustment">
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
                                        Add
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

