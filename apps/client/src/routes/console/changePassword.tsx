import { Button, Form, Grid, Header, Input, SpaceBetween } from "@cloudscape-design/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import FormRootError from "../../components/console/form/FormRootError";
import ControlledFormField from "../../components/console/form/ControlledFormField";
import { api } from "../../utils/trpc";
import { showFlashbar } from "../../state/flashbars";

export const Route = createFileRoute("/console/changePassword")({
    component: RouteComponent,
});

const formSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string(),
});
type FormData = z.infer<typeof formSchema>;

function RouteComponent() {
    const { mutate: changePassword, isPending } = api.auth.changePassword.useMutation({
        onSettled: () => form.reset(),
        onSuccess: () => {
            showFlashbar({
                type: "success",
                content: "Password changed successfully.",
            });
        },
        onError: (error) => {
            showFlashbar({
                type: "error",
                content: error.message,
            });
        },
    });

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = (data: FormData) => {
        changePassword(data);
    };

    return (
        <Grid gridDefinition={[{ colspan: { default: 12, l: 4 }, offset: { default: 0, l: 4 } }]}>
            <SpaceBetween size="s">
                <Header variant="h1">Change password</Header>

                <Form>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <SpaceBetween size="s">
                            <FormRootError form={form} />

                            <ControlledFormField
                                form={form}
                                name="currentPassword"
                                label="Current password"
                                render={({ field }) => (
                                    <Input placeholder="Current password" type="password" {...field} />
                                )}
                            />

                            <ControlledFormField
                                form={form}
                                name="newPassword"
                                label="New password"
                                render={({ field }) => <Input placeholder="New password" type="password" {...field} />}
                            />

                            <Button variant="primary" formAction="submit" loading={isPending}>
                                Change password
                            </Button>
                        </SpaceBetween>
                    </form>
                </Form>
            </SpaceBetween>
        </Grid>
    );
}

