import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { api } from "../../utils/trpc";
import { useCookies } from "react-cookie";
import { useEffect } from "react";

const searchSchema = z.object({
    competitionId: z.string(),
});

export const Route = createFileRoute("/display/controlled")({
    component: RouteComponent,
    validateSearch: zodValidator(searchSchema),
});

function RouteComponent() {
    const { competitionId } = Route.useSearch();
    const [cookies, setCookie] = useCookies(["display-id"]);
    const displayId = cookies["display-id"];

    const { mutate: pair } = api.displays.pair.useMutation({
        onSuccess: (display) => {
            if (!display) return;

            setCookie("display-id", display.id, {
                expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180),
                secure: false,
            });
        },
    });

    useEffect(() => {
        if (!competitionId) return;

        if (!displayId) {
            pair({ competitionId });
        }
    }, [competitionId, displayId, pair]);

    return <></>;
}

