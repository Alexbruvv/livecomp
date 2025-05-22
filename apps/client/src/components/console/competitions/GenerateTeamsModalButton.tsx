import { Box, Button, Form, Input, Modal, SpaceBetween } from "@cloudscape-design/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../../../utils/trpc";
import ControlledFormField from "../form/ControlledFormField";
import { showFlashbar } from "../../../state/flashbars";

const formSchema = z.object({
    count: z.number().int().min(1).max(100),
});
type FormData = z.infer<typeof formSchema>;

export default function GenerateTeamsModalButton({ competitionId }: { competitionId: string }) {
    const [visible, setVisible] = useState(false);

    const { mutate: generateTeams, isPending } = api.competitions.generateTeams.useMutation({
        onSettled: () => {
            setVisible(false);
            form.reset({ count: 1 });
        },
        onError: (error) => showFlashbar({ type: "error", content: error.message }),
    });

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            count: 1,
        },
    });

    const onSubmit = (data: FormData) => {
        generateTeams({ competitionId, count: data.count });
    };

    return (
        <>
            <Button variant="primary" onClick={() => setVisible(true)}>
                Generate teams
            </Button>

            <Modal visible={visible} onDismiss={() => setVisible(false)} header="Generate teams">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Form>
                        <SpaceBetween direction="vertical" size="s">
                            <span>
                                <b>Note: </b>This will generate the specified number of teams for the competition, in
                                the format T01, T02, etc. It does not check the current teams, so can only be used once,
                                or after removing all teams.
                            </span>
                            <ControlledFormField
                                label="Count"
                                form={form}
                                name="count"
                                render={({ field }) => (
                                    <Input
                                        type="number"
                                        inputMode="numeric"
                                        placeholder="Count"
                                        {...field}
                                        value={field.value.toString()}
                                        onChange={(e) => {
                                            form.setValue(field.name, parseInt(e.detail.value));
                                        }}
                                    />
                                )}
                            />
                            <Box float="right">
                                <SpaceBetween direction="horizontal" size="xs">
                                    <Button variant="link" onClick={() => setVisible(false)}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" formAction="submit" loading={isPending}>
                                        Generate
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

