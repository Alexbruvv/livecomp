import { Box, Button, Form, Input, Modal, SpaceBetween } from "@cloudscape-design/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ControlledFormField from "../form/ControlledFormField";
import { Game, insertGameSchema } from "@livecomp/server/src/db/schema/games";
import { api } from "../../utils/trpc";

const formSchema = insertGameSchema;

type FormData = z.infer<typeof formSchema>;

export default function EditGameModalButton({ game }: { game: Game }) {
    const utils = api.useUtils();

    const [visible, setVisible] = useState(false);

    const { mutate: updateGame, isPending } = api.games.update.useMutation({
        onSuccess: async () => {
            await utils.games.fetchAll.invalidate();
            await utils.games.fetchById.invalidate({ id: game.id });
            setVisible(false);
        },
        onSettled: () => form.reset(),
    });

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ...game,
        },
    });

    useEffect(() => {
        form.reset({
            ...game,
        });
    }, [form, game]);

    const onSubmit = (data: FormData) => {
        updateGame({ id: game.id, data });
    };

    return (
        <>
            <Button iconName="edit" variant="icon" onClick={() => setVisible(true)} />

            <Modal visible={visible} onDismiss={() => setVisible(false)} header="Update game">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Form>
                        <SpaceBetween direction="vertical" size="s">
                            <ControlledFormField
                                label="Name"
                                form={form}
                                name="name"
                                render={({ field }) => <Input placeholder="Name" {...field} />}
                            />

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

