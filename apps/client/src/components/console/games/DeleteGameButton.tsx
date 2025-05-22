import { Alert, Box, Button, Header, Modal, SpaceBetween } from "@cloudscape-design/components";
import { useState } from "react";
import type { Game } from "@livecomp/server/src/db/schema/games";
import { api } from "../../../utils/trpc";

export default function DeleteGameButton({ game }: { game: Game }) {
    const [modalVisible, setModalVisible] = useState(false);

    const { mutate: deleteGame } = api.games.delete.useMutation({
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
                header={<Header>Delete game</Header>}
                footer={
                    <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button onClick={() => setModalVisible(false)}>Cancel</Button>
                            <Button variant="primary" onClick={() => deleteGame({ id: game.id })}>
                                Confirm
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            >
                <SpaceBetween size="s">
                    <span>
                        Permanently delete <b>{game.name}</b>? You can't undo this action.
                    </span>
                    <Alert>
                        This will fail if competitions exist using this game. To delete the game, first ensure no
                        competitions are using it.
                    </Alert>
                </SpaceBetween>
            </Modal>
        </>
    );
}

