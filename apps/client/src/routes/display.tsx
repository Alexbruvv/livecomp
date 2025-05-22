import { createFileRoute, Outlet } from "@tanstack/react-router";
import DisplayRoot from "../components/display/DisplayRoot";
import DisplayController from "../components/display/DisplayController";
import { useCookies } from "react-cookie";

export const Route = createFileRoute("/display")({
    component: RouteComponent,
    beforeLoad: () => ({
        title: "Livecomp Displays",
    }),
});

function RouteComponent() {
    const [cookies] = useCookies(["display-id"]);
    const displayId = cookies["display-id"];

    return (
        <>
            {displayId && <DisplayController displayId={displayId} />}
            <DisplayRoot>
                <Outlet />
            </DisplayRoot>
        </>
    );
}

