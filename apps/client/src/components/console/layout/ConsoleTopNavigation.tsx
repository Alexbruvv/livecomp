import { TopNavigation } from "@cloudscape-design/components";
import { useNavigate } from "@tanstack/react-router";
import useDateTime from "../../../hooks/useDateTime";
import { DateTime } from "luxon";
import { followHandler, route } from "../../../utils/followHandler";
import { authClient, useSession } from "../../../utils/auth";

export default function ConsoleTopNavigtion({
    darkMode,
    setDarkMode,
}: {
    darkMode: boolean;
    setDarkMode: (darkMode: boolean | ((prev: boolean) => boolean)) => void;
}) {
    const navigate = useNavigate();
    const now = useDateTime();

    const session = useSession();

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
                    text: session.data?.user.name,
                    onItemFollow: async (e) => {
                        if (e.detail.id === "logout") {
                            await authClient.signOut();
                            navigate({ to: "/auth/login" });
                            return;
                        }

                        followHandler(navigate)(e);
                    },
                    description: session.data?.user.username ?? "",
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

