import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";

interface Context {
    title: string;
}

export const Route = createRootRouteWithContext<Context>()({
    component: RootComponent,
});

function RootComponent() {
    return <Outlet />;
}

