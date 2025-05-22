import { Box, Button, Form, Modal, SpaceBetween } from "@cloudscape-design/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../../../utils/trpc";
import MatchFormFields, { matchFormSchema } from "./MatchFormFields";
import { Match } from "@livecomp/server/src/db/schema/matches";
import { showFlashbar } from "../../../state/flashbars";

const formSchema = matchFormSchema;
type FormData = z.infer<typeof formSchema>;

export default function EditMatchModalButton({ match }: { match: Match }) {
    const [visible, setVisible] = useState(false);

    const { mutate: updateMatch, isPending } = api.matches.update.useMutation({
        onError: (error) => {
            showFlashbar({ type: "error", content: error.message });
        },
        onSettled: () => {
            setVisible(false);
            form.reset();
        },
    });

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ...match,
        },
    });

    useEffect(() => {
        form.reset({
            ...match,
        });
    }, [form, match]);

    const onSubmit = (data: FormData) => {
        updateMatch({ id: match.id, data });
    };

    return (
        <>
            <Button iconName="edit" variant="icon" onClick={() => setVisible(true)} />

            <Modal visible={visible} onDismiss={() => setVisible(false)} header="Edit match">
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

