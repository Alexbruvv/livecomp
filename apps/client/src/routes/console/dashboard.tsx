import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/console/dashboard")({
    component: RouteComponent,
    beforeLoad: () => ({
        title: "Dashboard",
    }),
});

function RouteComponent() {
    return <Outlet />;
}

