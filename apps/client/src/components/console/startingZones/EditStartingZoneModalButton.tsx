import { Box, Button, Form, Modal, SpaceBetween } from "@cloudscape-design/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { StartingZone } from "@livecomp/server/src/db/schema/games";
import { api } from "../../../utils/trpc";
import StartingZoneFormFields, { startingZoneFormSchema } from "./StartingZoneFormFields";

const formSchema = startingZoneFormSchema;
type FormData = z.infer<typeof formSchema>;

export default function EditStartingZoneModalButton({ startingZone }: { startingZone: StartingZone }) {
    const [visible, setVisible] = useState(false);

    const { mutate: updateStartingZone, isPending } = api.startingZones.update.useMutation({
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
        defaultValues: startingZone,
    });

    useEffect(() => {
        form.reset(startingZone);
    }, [form, startingZone]);

    const onSubmit = (data: FormData) => {
        updateStartingZone({ id: startingZone.id, data });
    };

    return (
        <>
            <Button onClick={() => setVisible(true)}>Edit</Button>

            <Modal visible={visible} onDismiss={() => setVisible(false)} header="Edit starting zone">
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

