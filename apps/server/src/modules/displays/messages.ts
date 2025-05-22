interface ShowTextMessage {
    type: "showText";
    text: string;
    durationMs: number;
}

interface RefreshMessage {
    type: "refresh";
}

export type DisplayMessage = ShowTextMessage | RefreshMessage;

