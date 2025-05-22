import { Box, Button, Form, Modal, SpaceBetween } from "@cloudscape-design/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../../../utils/trpc";
import CompetitionFormFields, { competitionFormSchema } from "./CompetitionFormFields";
import { Competition } from "@livecomp/server/src/db/schema/competitions";

const formSchema = competitionFormSchema;
type FormData = z.infer<typeof formSchema>;

export default function EditCompetitionModalButton({ competition }: { competition: Competition }) {
    const [visible, setVisible] = useState(false);

    const { mutate: updateCompetition, isPending } = api.competitions.update.useMutation({
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
            ...competition,
        },
    });

    useEffect(() => {
        form.reset({
            ...competition,
        });
    }, [form, competition]);

    const onSubmit = (data: FormData) => {
        updateCompetition({ id: competition.id, data });
    };

    return (
        <>
            <Button iconName="edit" variant="icon" onClick={() => setVisible(true)} />

            <Modal visible={visible} onDismiss={() => setVisible(false)} header="Edit competition">
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

