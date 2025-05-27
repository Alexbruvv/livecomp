import {
    AppLayout,
    SideNavigation,
    BreadcrumbGroup,
    Flashbar,
    SideNavigationProps,
} from "@cloudscape-design/components";
import { PropsWithChildren, useEffect, useState } from "react";
import { followHandler, route } from "../../../utils/followHandler";
import { api } from "../../../utils/trpc";
import { Navigate, useLocation, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { flashbarItemsAtom } from "../../../state/flashbars";
import { applyMode, Mode } from "@cloudscape-design/global-styles";
import ConsoleTopNavigtion from "./ConsoleTopNavigation";
import { useQuery } from "@tanstack/react-query";
import { authClient, useSession } from "@livecomp/shared";

export default function ConsoleLayout({ children }: PropsWithChildren) {
    const navigate = useNavigate();
    const location = useLocation();
    const matches = useRouterState({ select: (state) => state.matches });

    const { data: competitions } = api.competitions.fetchAll.useQuery();

    const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");

    useEffect(() => {
        applyMode(darkMode ? Mode.Dark : Mode.Light);

        localStorage.setItem("darkMode", darkMode ? "true" : "false");
    }, [darkMode]);

    const flashbarItems = useAtomValue(flashbarItemsAtom);

    const breadcrumbs = matches
        .filter((match) => match.context.title && match.context.title !== "Livecomp")
        .map(({ pathname, context }) => {
            return {
                text: context.title,
                href: pathname,
            };
        });

    const session = useSession();
    const { data: canListUsers } = useQuery({
        queryKey: ["canListUsers"],
        queryFn: () => authClient.admin.hasPermission({ permission: { user: ["list"] } }),
    });

    if (!session.isPending && !session.data?.user) {
        return <Navigate to="/auth/login" />;
    }

    const sysAdminItems: SideNavigationProps["items"] = [
        { type: "link", text: "Users", href: route("/console/users") },
    ];

    return (
        <>
            <ConsoleTopNavigtion darkMode={darkMode} setDarkMode={setDarkMode} />
            <AppLayout
                breadcrumbs={<BreadcrumbGroup onFollow={followHandler(navigate)} items={breadcrumbs} />}
                navigation={
                    <SideNavigation
                        onFollow={followHandler(navigate)}
                        activeHref={location.pathname}
                        header={{ href: "/", text: "Console" }}
                        items={[
                            {
                                type: "expandable-link-group",
                                text: "Competitions",
                                href: route("/console/competitions"),
                                items: (competitions ?? []).map((competition) => ({
                                    type: "expandable-link-group",
                                    text: competition.name,
                                    href: `/console/competitions/${competition.id}`,
                                    items: [
                                        {
                                            type: "link",
                                            text: "Checks",
                                            href: `/console/competitions/${competition.id}/checks`,
                                        },
                                        {
                                            type: "link",
                                            text: "Control",
                                            href: `/console/competitions/${competition.id}/control`,
                                        },
                                        {
                                            type: "link",
                                            text: "Displays",
                                            href: `/console/competitions/${competition.id}/displays`,
                                        },
                                    ],
                                })),
                            },
                            { type: "link", text: "Games", href: route("/console/games") },
                            { type: "link", text: "Venues", href: route("/console/venues") },
                            ...(canListUsers?.data?.success ? sysAdminItems : []),
                        ]}
                    />
                }
                toolsHide
                notifications={<Flashbar items={flashbarItems} stackItems />}
                content={<>{children}</>}
            />
        </>
    );
}

