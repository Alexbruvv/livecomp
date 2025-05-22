import { Box, Button, Form, Modal, SpaceBetween } from "@cloudscape-design/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../../../utils/trpc";
import RegionFormFields, { regionFormSchema } from "./RegionFormFields";

const formSchema = regionFormSchema;
type FormData = z.infer<typeof formSchema>;

export default function CreateRegionModalButton({ venueId }: { venueId: string }) {
    const [visible, setVisible] = useState(false);

    const { mutate: createRegion, isPending } = api.regions.create.useMutation({
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
        createRegion({ data: { ...data, venueId } });
    };

    return (
        <>
            <Button variant="primary" onClick={() => setVisible(true)}>
                Create region
            </Button>

            <Modal visible={visible} onDismiss={() => setVisible(false)} header="Create region">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Form>
                        <SpaceBetween direction="vertical" size="s">
                            <RegionFormFields form={form} />

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

