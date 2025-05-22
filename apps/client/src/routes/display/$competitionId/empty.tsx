import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/display/$competitionId/empty")({
    component: RouteComponent,
});

function RouteComponent() {
    return <></>;
}

