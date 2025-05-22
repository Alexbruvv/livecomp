import { Box, Button, Form, Modal, SpaceBetween } from "@cloudscape-design/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Competition } from "@livecomp/server/src/db/schema/competitions";
import { api } from "../../../utils/trpc";
import TeamFormFields, { teamFormSchema } from "./TeamFormFields";
import { Team } from "@livecomp/server/src/db/schema/teams";

const formSchema = teamFormSchema;
type FormData = z.infer<typeof formSchema>;

export default function EditTeamModalButton({ team, competition }: { team: Team; competition: Competition }) {
    const [visible, setVisible] = useState(false);

    const { mutate: updateTeam, isPending } = api.teams.update.useMutation({
        onSuccess: async () => {
            setVisible(false);
        },
        onError: (error) => {
            form.setError("root", { message: error.message });
        },
        onSettled: () => form.reset(team),
    });

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: team,
    });

    useEffect(() => {
        form.reset(team);
    }, [form, team]);

    const onSubmit = (data: FormData) => {
        updateTeam({
            id: team.id,
            data: {
                ...data,
            },
        });
    };

    return (
        <>
            <Button iconName="edit" variant="icon" onClick={() => setVisible(true)} />

            <Modal visible={visible} onDismiss={() => setVisible(false)} header="Edit team">
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

