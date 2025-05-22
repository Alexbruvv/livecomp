import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/console/venues")({
    component: RouteComponent,
    beforeLoad: () => ({
        title: "Venues",
    }),
});

function RouteComponent() {
    return <Outlet />;
}

