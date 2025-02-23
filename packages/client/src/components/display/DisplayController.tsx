import type { DisplayMessage } from "@livecomp/server/src/modules/displays/messages";
import { api } from "../../utils/trpc";
import { useEffect, useState } from "react";
import DisplayOverlay from "./DisplayOverlay";
import { useNavigate } from "@tanstack/react-router";
import { useCookies } from "react-cookie";
import useInterval from "../../hooks/useInterval";

export default function DisplayController({ displayId }: { displayId: string }) {
    const navigate = useNavigate();
    const [text, setText] = useState<string | null>(null);

    const [cookies, , removeCookie] = useCookies(["display-id"]);

    const { mutate: heartbeat } = api.displays.heartbeat.useMutation();

    const { data: display, status } = api.displays.fetchById.useQuery(
        { id: displayId },
        {
            retry: true,
        }
    );

    useEffect(() => {
        if (cookies["display-id"] && status === "success" && !display) {
            removeCookie("display-id");
        }
    }, [display, cookies, removeCookie, status]);

    useInterval(() => heartbeat({ id: displayId }), 5000);

    useEffect(() => {
        if (!display) return;

        if (display.configuration.mode === "identify") {
            navigate({
                to: "/display/$competitionId/identify",
                params: { competitionId: display.competitionId },
            });
        } else if (display.configuration.mode === "arena") {
            navigate({
                to: "/display/$competitionId/arena",
                params: { competitionId: display.competitionId },
                search: { startingZoneId: display.configuration.startingZoneId },
            });
        } else if (display.configuration.mode === "outside") {
            navigate({
                to: "/display/$competitionId/leaderboard",
                params: { competitionId: display.competitionId },
            });
        } else if (display.configuration.mode === "staging") {
            navigate({
                to: "/display/$competitionId/staging",
                params: { competitionId: display.competitionId },
            });
        } else if (display.configuration.mode === "empty") {
            navigate({
                to: "/display/$competitionId/empty",
                params: { competitionId: display.competitionId },
            });
        }
    }, [display, navigate]);

    api.displays.onStreamMessage.useSubscription(
        { id: displayId },
        {
            onData: (message: DisplayMessage) => {
                if (message.type === "showText") {
                    setText(message.text);
                    setTimeout(() => setText(null), message.durationMs);
                } else if (message.type === "refresh") {
                    window.location.reload();
                }
            },
        }
    );

    return (
        <>
            {text && (
                <DisplayOverlay>
                    <h1 className="text-6xl text-white font-bold text-center whitespace-pre-line">{text}</h1>
                </DisplayOverlay>
            )}
        </>
    );
}

