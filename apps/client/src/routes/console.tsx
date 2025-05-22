import { createFileRoute, Outlet } from "@tanstack/react-router";
import ConsoleLayout from "../components/console/layout/ConsoleLayout";

export const Route = createFileRoute("/console")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <ConsoleLayout>
            <Outlet />
        </ConsoleLayout>
    );
}

