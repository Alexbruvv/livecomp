import { Box, Button, Form, Modal, SpaceBetween } from "@cloudscape-design/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../../../utils/trpc";
import { Region, Shepherd } from "@livecomp/server/src/db/schema/venues";
import ShepherdFormFields, { shepherdFormSchema } from "./ShepherdFormFields";

const formSchema = shepherdFormSchema;
type FormData = z.infer<typeof formSchema>;

export default function EditShepherdModalButton({ shepherd, regions }: { shepherd: Shepherd; regions: Region[] }) {
    const [visible, setVisible] = useState(false);

    const { mutate: updateShepherd, isPending } = api.shepherds.update.useMutation({
        onSuccess: async () => {
            setVisible(false);
        },
        onError: (error) => {
            form.setError("root", { message: error.message });
        },
        onSettled: () => form.reset(shepherd),
    });

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: shepherd,
    });

    useEffect(() => {
        form.reset(shepherd);
    }, [form, shepherd]);

    const onSubmit = (data: FormData) => {
        updateShepherd({ id: shepherd.id, data: { ...data } });
    };

    return (
        <>
            <Button onClick={() => setVisible(true)}>Edit</Button>

            <Modal visible={visible} onDismiss={() => setVisible(false)} header="Edit shepherd">
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

