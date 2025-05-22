import { Box, Button, Form, Modal, SpaceBetween } from "@cloudscape-design/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../../../utils/trpc";
import { Region } from "@livecomp/server/src/db/schema/venues";
import ShepherdFormFields, { shepherdFormSchema } from "./ShepherdFormFields";

const formSchema = shepherdFormSchema;
type FormData = z.infer<typeof formSchema>;

export default function CreateShepherdModalButton({ venueId, regions }: { venueId: string; regions: Region[] }) {
    const [visible, setVisible] = useState(false);

    const { mutate: createShepherd, isPending } = api.shepherds.create.useMutation({
        onSuccess: async () => {
            setVisible(false);
        },
        onError: (error) => {
            form.setError("root", { message: error.message });
        },
        onSettled: () =>
            form.reset({
                regionIds: [],
            }),
    });

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            regionIds: [],
        },
    });

    useEffect(() => {
        form.reset();
    }, [form]);

    const onSubmit = (data: FormData) => {
        createShepherd({ data: { ...data, venueId } });
    };

    return (
        <>
            <Button variant="primary" onClick={() => setVisible(true)}>
                Create shepherd
            </Button>

            <Modal visible={visible} onDismiss={() => setVisible(false)} header="Create shepherd">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Form>
                        <SpaceBetween direction="vertical" size="s">
                            <ShepherdFormFields form={form} regions={regions} />

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

