import { Alert, Box, Button, Header, Modal, SpaceBetween } from "@cloudscape-design/components";
import { useState } from "react";
import { api } from "../../../utils/trpc";
import { Team } from "@livecomp/server/src/db/schema/teams";

export default function DeleteTeamButton({ team }: { team: Team }) {
    const [modalVisible, setModalVisible] = useState(false);

    const { mutate: deleteTeam } = api.teams.delete.useMutation({
        onSuccess: async () => {
            setModalVisible(false);
        },
    });

    return (
        <>
            <Button onClick={() => setModalVisible(true)}>Delete</Button>

            <Modal
                visible={modalVisible}
                onDismiss={() => setModalVisible(false)}
                header={<Header>Delete team</Header>}
                footer={
                    <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button onClick={() => setModalVisible(false)}>Cancel</Button>
                            <Button variant="primary" onClick={() => deleteTeam({ id: team.id })}>
                                Confirm
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            >
                <SpaceBetween size="s">
                    <span>
                        Permanently delete <b>{team.name}</b>? You can't undo this action.
                    </span>
                    <Alert>
                        This operation will fail if there is any data associated with this team. This is for safety
                        reasons. Ensure teams are not scheduled to play in any matches before deleting them.
                    </Alert>
                </SpaceBetween>
            </Modal>
        </>
    );
}

