import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/console/users")({
    component: RouteComponent,
    beforeLoad: () => ({
        title: "Users",
    }),
});

function RouteComponent() {
    return <Outlet />;
}

