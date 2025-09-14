import { Box, Button, Form, Modal, SpaceBetween } from "@cloudscape-design/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import UserFormFields, { userFormSchema } from "./UserFormFields";
import { authClient, User } from "@livecomp/shared";
import { queryClient } from "../../../utils/trpc";

const formSchema = userFormSchema;
type FormData = z.infer<typeof formSchema>;

export default function EditUserModalButton({ user }: { user: User }) {
    const [visible, setVisible] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const editUser = (data: FormData) => {
        setIsPending(true);

        authClient.admin.updateUser(
            { userId: user.id, data },
            {
                onResponse: () => setIsPending(false),
                onSuccess: async () => {
                    await queryClient.invalidateQueries({ queryKey: ["users", "list"] });
                    await queryClient.invalidateQueries({ queryKey: ["users", "fetch", user.id] });
                    setVisible(false);
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
            name: user.name,
            email: user.email,
            role: (user.role ?? "viewer") as FormData["role"],
        });
    }, [form, user.email, user.name, user.role]);

    const onSubmit = (data: FormData) => {
        editUser(data);
    };

    return (
        <>
            <Button variant="icon" iconName="edit" onClick={() => setVisible(true)} />

            <Modal visible={visible} onDismiss={() => setVisible(false)} header="Edit user">
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

