import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/console/competitions")({
    component: RouteComponent,
    beforeLoad: () => ({
        title: "Competitions",
    }),
});

function RouteComponent() {
    return <Outlet />;
}

