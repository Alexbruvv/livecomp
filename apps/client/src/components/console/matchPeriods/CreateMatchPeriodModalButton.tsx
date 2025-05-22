import { Box, Button, Form, Modal, SpaceBetween } from "@cloudscape-design/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Competition } from "@livecomp/server/src/db/schema/competitions";
import { api } from "../../../utils/trpc";
import MatchPeriodFormFields, { matchPeriodFormSchema } from "./MatchPeriodFormFields";

const formSchema = matchPeriodFormSchema;
type FormData = z.infer<typeof formSchema>;

export default function CreateMatchPeriodModalButton({ competition }: { competition: Competition }) {
    const [visible, setVisible] = useState(false);

    const { mutate: createMatchPeriod, isPending } = api.matchPeriods.create.useMutation({
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
        createMatchPeriod({
            data: {
                ...data,
                competitionId: competition.id,
            },
        });
    };

    return (
        <>
            <Button variant="primary" onClick={() => setVisible(true)}>
                Create match period
            </Button>

            <Modal visible={visible} onDismiss={() => setVisible(false)} header="Create match period">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Form>
                        <SpaceBetween direction="vertical" size="s">
                            <MatchPeriodFormFields form={form} />

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

