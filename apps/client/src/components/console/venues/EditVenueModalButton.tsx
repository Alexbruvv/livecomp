import { Box, Button, Form, Modal, SpaceBetween } from "@cloudscape-design/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../../../utils/trpc";
import { Venue } from "@livecomp/server/src/db/schema/venues";
import VenueFormFields, { venueFormSchema } from "./VenueFormFields";

const formSchema = venueFormSchema;
type FormData = z.infer<typeof formSchema>;

export default function EditVenueModalButton({ venue }: { venue: Venue }) {
    const [visible, setVisible] = useState(false);

    const { mutate: updateVenue, isPending } = api.venues.update.useMutation({
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
            ...venue,
        },
    });

    useEffect(() => {
        form.reset({
            ...venue,
        });
    }, [form, venue]);

    const onSubmit = (data: FormData) => {
        updateVenue({ id: venue.id, data });
    };

    return (
        <>
            <Button iconName="edit" variant="icon" onClick={() => setVisible(true)} />

            <Modal visible={visible} onDismiss={() => setVisible(false)} header="Edit venue">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Form>
                        <SpaceBetween direction="vertical" size="s">
                            <VenueFormFields form={form} />

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

