import { Box, Button, Form, Modal, SpaceBetween } from "@cloudscape-design/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../../../utils/trpc";
import MatchPeriodFormFields, { matchPeriodFormSchema } from "./MatchPeriodFormFields";
import { MatchPeriod } from "@livecomp/server/src/db/schema/matches";

const formSchema = matchPeriodFormSchema;
type FormData = z.infer<typeof formSchema>;

export default function EditMatchPeriodModalButton({ matchPeriod }: { matchPeriod: MatchPeriod }) {
    const [visible, setVisible] = useState(false);

    const { mutate: updateMatchPeriod, isPending } = api.matchPeriods.update.useMutation({
        onSuccess: async () => {
            setVisible(false);
        },
        onError: (error) => {
            form.setError("root", { message: error.message });
        },
        onSettled: () => form.reset(matchPeriod),
    });

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: matchPeriod,
    });

    useEffect(() => {
        form.reset(matchPeriod);
    }, [form, matchPeriod]);

    const onSubmit = (data: FormData) => {
        updateMatchPeriod({
            id: matchPeriod.id,
            data: {
                ...data,
            },
        });
    };

    return (
        <>
            <Button iconName="edit" variant="icon" onClick={() => setVisible(true)} />

            <Modal visible={visible} onDismiss={() => setVisible(false)} header="Edit match period">
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

