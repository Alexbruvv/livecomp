import { TopNavigation } from "@cloudscape-design/components";
import { useNavigate } from "@tanstack/react-router";
import { useContext } from "react";
import useDateTime from "../../../hooks/useDateTime";
import { DateTime } from "luxon";
import { AuthContext } from "../../../utils/context";
import { api } from "../../../utils/trpc";
import { followHandler, route } from "../../../utils/followHandler";

export default function ConsoleTopNavigtion({
    darkMode,
    setDarkMode,
}: {
    darkMode: boolean;
    setDarkMode: (darkMode: boolean | ((prev: boolean) => boolean)) => void;
}) {
    const navigate = useNavigate();
    const now = useDateTime();
    const utils = api.useUtils();

    const userContext = useContext(AuthContext);

    return (
        <TopNavigation
            identity={{
                href: "#",
                title: "Livecomp",
                onFollow: () => navigate({ to: "/console" }),
            }}
            utilities={[
                {
                    type: "button",
                    text: darkMode ? "Dark mode" : "Light mode",
                    onClick: () => setDarkMode((prev) => !prev),
                },
                {
                    type: "button",
                    text: now.toLocaleString(DateTime.TIME_24_WITH_SECONDS),
                },
                {
                    type: "menu-dropdown",
                    text: userContext.user?.name,
                    onItemFollow: (e) => {
                        if (e.detail.id === "logout") {
                            localStorage.removeItem("accessToken");
                            utils.users.fetchCurrent.invalidate().catch(console.log);
                            navigate({ to: "/auth/login" });
                            return;
                        }

                        followHandler(navigate)(e);
                    },
                    description: userContext.user?.username,
                    iconName: "user-profile",
                    items: [
                        { id: "changePassword", text: "Change password", href: route("/console/changePassword") },
                        { id: "logout", text: "Logout", href: "#" },
                    ],
                },
            ]}
        />
    );
}

