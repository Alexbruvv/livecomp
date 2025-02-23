import { Box, Button, Form, Modal, SpaceBetween } from "@cloudscape-design/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../../../utils/trpc";
import MatchFormFields, { matchFormSchema } from "./MatchFormFields";

const formSchema = matchFormSchema;
type FormData = z.infer<typeof formSchema>;

export default function CreateMatchModalButton({ competitionId }: { competitionId: string }) {
    const [visible, setVisible] = useState(false);

    const { mutate: createMatch, isPending } = api.matches.create.useMutation({
        onSuccess: async () => {
            setVisible(false);
        },
        onError: (error) => {
            form.setError("root", { message: error.message });
        },
        onSettled: () =>
            form.reset({
                sequenceNumber: 0,
                buffer: 0,
            }),
    });

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            sequenceNumber: 0,
            buffer: 0,
        },
    });

    useEffect(() => {
        form.reset();
    }, [form]);

    const onSubmit = (data: FormData) => {
        createMatch({
            data: {
                ...data,
                competitionId,
            },
        });
    };

    return (
        <>
            <Button variant="primary" onClick={() => setVisible(true)}>
                Create
            </Button>

            <Modal visible={visible} onDismiss={() => setVisible(false)} header="Create match">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Form>
                        <SpaceBetween direction="vertical" size="s">
                            <MatchFormFields form={form} />

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

