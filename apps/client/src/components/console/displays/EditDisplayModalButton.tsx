import { Box, Button, Form, Modal, SpaceBetween } from "@cloudscape-design/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../../../utils/trpc";
import { showFlashbar } from "../../../state/flashbars";
import DisplayFormFields, { displayFormSchema } from "./DisplayFormFields";
import { Display } from "@livecomp/server/src/db/schema/displays";

const formSchema = displayFormSchema;
type FormData = z.infer<typeof formSchema>;

export default function EditDisplayModalButton({ display }: { display: Display }) {
    const [visible, setVisible] = useState(false);

    const { mutate: updateDisplay, isPending } = api.displays.update.useMutation({
        onSuccess: async () => {
            setVisible(false);
        },
        onError: (error) => {
            showFlashbar({ type: "error", content: error.message });
            setVisible(false);
        },
        onSettled: () => form.reset(),
    });

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ...display,
        },
    });

    useEffect(() => {
        form.reset({
            ...display,
        });
    }, [form, display]);

    const onSubmit = (data: FormData) => {
        updateDisplay({ id: display.id, data });
    };

    return (
        <>
            <Button variant="normal" onClick={() => setVisible(true)}>
                Edit
            </Button>

            <Modal visible={visible} onDismiss={() => setVisible(false)} header="Edit display">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Form>
                        <SpaceBetween direction="vertical" size="s">
                            <DisplayFormFields form={form} competitionId={display.competitionId} />

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

