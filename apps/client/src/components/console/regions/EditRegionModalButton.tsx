import { Box, Button, Form, Modal, SpaceBetween } from "@cloudscape-design/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../../../utils/trpc";
import { Region } from "@livecomp/server/src/db/schema/venues";
import RegionFormFields, { regionFormSchema } from "./RegionFormFields";

const formSchema = regionFormSchema;
type FormData = z.infer<typeof formSchema>;

export default function EditRegionModalButton({ region }: { region: Region }) {
    const [visible, setVisible] = useState(false);

    const { mutate: updateRegion, isPending } = api.regions.update.useMutation({
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
        defaultValues: region,
    });

    useEffect(() => {
        form.reset(region);
    }, [form, region]);

    const onSubmit = (data: FormData) => {
        updateRegion({ id: region.id, data });
    };

    return (
        <>
            <Button onClick={() => setVisible(true)}>Edit</Button>

            <Modal visible={visible} onDismiss={() => setVisible(false)} header="Edit region">
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

