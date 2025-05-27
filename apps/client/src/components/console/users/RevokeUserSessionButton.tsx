import { Box, Button, Header, Modal, SpaceBetween } from "@cloudscape-design/components";
import { useState } from "react";
import { authClient, Session } from "@livecomp/shared";
import { queryClient } from "../../../utils/trpc";

export default function RevokeUserSessionButton({ session }: { session: Session }) {
    const [modalVisible, setModalVisible] = useState(false);

    const deleteUser = () => {
        authClient.admin.revokeUserSession(
            { sessionToken: session.token },
            {
                onSuccess: () => {
                    setModalVisible(false);
                    queryClient.invalidateQueries({
                        queryKey: ["users", "sessions", session.userId],
                    });
                },
            }
        );
    };

    return (
        <>
            <Button onClick={() => setModalVisible(true)}>Revoke</Button>

            <Modal
                visible={modalVisible}
                onDismiss={() => setModalVisible(false)}
                header={<Header>Revoke session</Header>}
                footer={
                    <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button onClick={() => setModalVisible(false)}>Cancel</Button>
                            <Button variant="primary" onClick={() => deleteUser()}>
                                Confirm
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            >
                <SpaceBetween size="s">
                    <span>
                        Are you sure you wish to revoke session <b>{session.id}</b>? You can't undo this action.
                    </span>
                </SpaceBetween>
            </Modal>
        </>
    );
}

