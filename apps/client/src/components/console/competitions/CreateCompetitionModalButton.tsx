import { Box, Button, Form, Modal, SpaceBetween } from "@cloudscape-design/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../../../utils/trpc";
import CompetitionFormFields, { competitionFormSchema } from "./CompetitionFormFields";

const formSchema = competitionFormSchema;
type FormData = z.infer<typeof formSchema>;

export default function CreateCompetitionModalButton() {
    const [visible, setVisible] = useState(false);

    const { mutate: createCompetition, isPending } = api.competitions.create.useMutation({
        onSuccess: async () => {
            setVisible(false);
        },
        onError: (error) => {
            form.setError("root", { message: error.message });
        },
        onSettled: () => {
            form.reset({
                startsAt: new Date(),
                endsAt: new Date(),
            });
        },
    });

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            startsAt: new Date(),
            endsAt: new Date(),
        },
    });

    useEffect(() => {
        form.reset({
            startsAt: new Date(),
            endsAt: new Date(),
        });
    }, [form]);

    const onSubmit = (data: FormData) => {
        createCompetition({ data });
    };

    return (
        <>
            <Button variant="primary" onClick={() => setVisible(true)}>
                Create
            </Button>

            <Modal visible={visible} onDismiss={() => setVisible(false)} header="Create competition">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Form>
                        <SpaceBetween direction="vertical" size="s">
                            <CompetitionFormFields form={form} />

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

