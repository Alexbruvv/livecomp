import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/console/games")({
    component: RouteComponent,
    beforeLoad: () => ({
        title: "Games",
    }),
});

function RouteComponent() {
    return <Outlet />;
}

