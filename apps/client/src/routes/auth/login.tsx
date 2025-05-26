import { ContentLayout, Header, Container, SpaceBetween, Input, Button, Form } from "@cloudscape-design/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import ControlledFormField from "../../components/console/form/ControlledFormField";
import FormRootError from "../../components/console/form/FormRootError";
import { z } from "zod";
import { authClient } from "../../utils/auth";
import { useState } from "react";
import { delay } from "../../utils/promise";

export const Route = createFileRoute("/auth/login")({
    component: RouteComponent,
});

const formSchema = z.object({
    username: z.string(),
    password: z.string(),
});

type FormData = z.infer<typeof formSchema>;

function RouteComponent() {
    const navigate = useNavigate();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
    });

    const [isPending, setIsPending] = useState(false);

    const onSubmit = (data: FormData) => {
        setIsPending(true);
        authClient.signIn.username(data, {
            onSuccess: async (ctx) => {
                const authToken = ctx.response.headers.get("Set-Auth-Token");

                if (authToken) {
                    localStorage.setItem("auth_token", authToken);
                }

                await delay(500); // Delay to ensure session is established before redirecting

                setIsPending(false);
                navigate({ to: "/console" });
            },
            onError: (error) => {
                form.setError("root", { message: error.error.message });
                setIsPending(false);
            },
        });
    };

    return (
        <ContentLayout
            defaultPadding
            headerVariant="high-contrast"
            maxContentWidth={600}
            header={
                <Header variant="h1" description="Login to your Livecomp account here.">
                    Login
                </Header>
            }
        >
            <Container>
                <Form>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <SpaceBetween direction="vertical" size="s">
                            <span>Enter your credentials below to login.</span>

                            <FormRootError form={form} />

                            <ControlledFormField
                                form={form}
                                name="username"
                                render={({ field }) => <Input placeholder="Username" {...field} />}
                            />

                            <ControlledFormField
                                form={form}
                                name="password"
                                render={({ field }) => <Input placeholder="Password" type="password" {...field} />}
                            />

                            <Button variant="primary" formAction="submit" loading={isPending}>
                                Login
                            </Button>
                        </SpaceBetween>
                    </form>
                </Form>
            </Container>
        </ContentLayout>
    );
}

