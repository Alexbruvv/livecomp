import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/console/competitions/$competitionId")({
    component: RouteComponent,
    beforeLoad: () => ({
        title: "Manage competition",
    }),
});

function RouteComponent() {
    return <Outlet />;
}

