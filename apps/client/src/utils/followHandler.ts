import { UseNavigateResult } from "@tanstack/react-router";
import { FileRoutesByTo } from "../routeTree.gen";

export const followHandler = (navigate: UseNavigateResult<string>) => (e: CustomEvent<object>) => {
    e.preventDefault();
    navigate({ to: (e.detail as { href: string }).href as never });
};

export function route(route: keyof FileRoutesByTo) {
    return route;
}
