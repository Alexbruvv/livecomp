import { Box, Button, Header, Modal, SpaceBetween } from "@cloudscape-design/components";
import { useState } from "react";
import { authClient, User } from "@livecomp/shared";
import { queryClient } from "../../../utils/trpc";

export default function DeleteUserButton({ user }: { user: User }) {
    const [modalVisible, setModalVisible] = useState(false);

    const deleteUser = () => {
        authClient.admin.removeUser(
            { userId: user.id },
            {
                onSuccess: () => {
                    setModalVisible(false);
                    queryClient.invalidateQueries({
                        queryKey: ["users", "list"],
                    });
                },
            }
        );
    };

    return (
        <>
            <Button onClick={() => setModalVisible(true)}>Delete</Button>

            <Modal
                visible={modalVisible}
                onDismiss={() => setModalVisible(false)}
                header={<Header>Delete user</Header>}
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
                        Permanently delete <b>{user.name}</b>? You can't undo this action.
                    </span>
                </SpaceBetween>
            </Modal>
        </>
    );
}

