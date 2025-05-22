import { Box, Button, Form, Modal, SpaceBetween } from "@cloudscape-design/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Competition } from "@livecomp/server/src/db/schema/competitions";
import { api } from "../../../utils/trpc";
import TeamFormFields, { teamFormSchema } from "./TeamFormFields";

const formSchema = teamFormSchema;
type FormData = z.infer<typeof formSchema>;

export default function CreateTeamModalButton({ competition }: { competition: Competition }) {
    const [visible, setVisible] = useState(false);

    const { mutate: createTeam, isPending } = api.teams.create.useMutation({
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
        createTeam({
            data: {
                ...data,
                competitionId: competition.id,
            },
        });
    };

    return (
        <>
            <Button variant="primary" onClick={() => setVisible(true)}>
                Create team
            </Button>

            <Modal visible={visible} onDismiss={() => setVisible(false)} header="Create team">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Form>
                        <SpaceBetween direction="vertical" size="s">
                            <TeamFormFields form={form} competition={competition} />

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

