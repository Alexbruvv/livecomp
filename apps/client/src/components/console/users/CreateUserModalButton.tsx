import { Box, Button, Form, Modal, SpaceBetween } from "@cloudscape-design/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { showFlashbar } from "../../../state/flashbars";
import UserFormFields, { userFormSchema } from "./UserFormFields";
import { authClient } from "@livecomp/shared";
import { queryClient } from "../../../utils/trpc";

const formSchema = userFormSchema;
type FormData = z.infer<typeof formSchema>;

export default function CreateUserModalButton() {
    const [visible, setVisible] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const createUser = (data: FormData) => {
        setIsPending(true);

        const password = (Math.random() + 1).toString(36).substring(2, 10);
        authClient.admin.createUser(
            { ...data, password },
            {
                onResponse: () => setIsPending(false),
                onSuccess: async () => {
                    await queryClient.invalidateQueries({ queryKey: ["users", "list"] });
                    setVisible(false);
                    showFlashbar(
                        {
                            type: "info",
                            content: (
                                <span>
                                    User{" "}
                                    <b>
                                        {data.name} ({data.email})
                                    </b>{" "}
                                    created successfully. Password: <b>{password}</b>
                                </span>
                            ),
                        },
                        15000
                    );
                },
                onError: (error) => {
                    form.setError("root", { message: error.error.message });
                },
            }
        );
    };

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        form.reset({
            role: "viewer",
        });
    }, [form]);

    const onSubmit = (data: FormData) => {
        createUser(data);
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

