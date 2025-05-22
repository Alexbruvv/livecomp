import { Box, Button, Form, Modal, SpaceBetween } from "@cloudscape-design/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../../../utils/trpc";
import UserFormFields, { userFormSchema } from "./UserFormFields";
import { showFlashbar } from "../../../state/flashbars";

const formSchema = userFormSchema;
type FormData = z.infer<typeof formSchema>;

export default function CreateUserModalButton() {
    const [visible, setVisible] = useState(false);

    const { mutate: createUser, isPending } = api.users.create.useMutation({
        onSuccess: async (response) => {
            setVisible(false);
            showFlashbar(
                {
                    type: "info",
                    content: (
                        <span>
                            User <b>{response.user.name}</b> created successfully. Password: <b>{response.password}</b>
                        </span>
                    ),
                },
                15000
            );
        },
        onError: (error) => {
            form.setError("root", { message: error.message });
        },
        onSettled: () =>
            form.reset({
                role: "viewer",
            }),
    });

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        form.reset({
            role: "viewer",
        });
    }, [form]);

    const onSubmit = (data: FormData) => {
        createUser({ data });
    };

    return (
        <>
            <Button variant="primary" onClick={() => setVisible(true)}>
                Create
            </Button>

            <Modal visible={visible} onDismiss={() => setVisible(false)} header="Create user">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Form>
                        <SpaceBetween direction="vertical" size="s">
                            <UserFormFields form={form} />

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

