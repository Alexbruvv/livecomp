import { Box, Button, Form, Modal, SpaceBetween } from "@cloudscape-design/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../../../utils/trpc";
import StartingZoneFormFields, { startingZoneFormSchema } from "./StartingZoneFormFields";

const formSchema = startingZoneFormSchema;
type FormData = z.infer<typeof formSchema>;

export default function CreateStartingZoneModalButton({ gameId }: { gameId: string }) {
    const [visible, setVisible] = useState(false);

    const { mutate: createStartingZone, isPending } = api.startingZones.create.useMutation({
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
    });

    useEffect(() => {
        form.reset();
    }, [form]);

    const onSubmit = (data: FormData) => {
        createStartingZone({ data: { ...data, gameId } });
    };

    return (
        <>
            <Button variant="primary" onClick={() => setVisible(true)}>
                Create starting zone
            </Button>

            <Modal visible={visible} onDismiss={() => setVisible(false)} header="Create starting zone">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Form>
                        <SpaceBetween direction="vertical" size="s">
                            <StartingZoneFormFields form={form} />

                            <Box float="right">
                                <SpaceBetween direction="horizontal" size="xs">
                                    <Button variant="link" onClick={() => setVisible(false)}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" formAction="submit" loading={isPending}>
                                        Create
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

