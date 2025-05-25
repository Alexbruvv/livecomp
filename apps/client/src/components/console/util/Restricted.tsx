import { PropsWithChildren } from "react";
import { authClient } from "../../../utils/auth";
import { useQuery } from "@tanstack/react-query";

export default function Restricted({
    permissions,
    children,
}: { permissions: Parameters<typeof authClient.admin.hasPermission>[0]["permissions"] } & PropsWithChildren) {
    const { data, isPending } = useQuery({
        queryKey: ["hasPermissions", JSON.stringify(permissions)],
        queryFn: () => authClient.admin.hasPermission({ permissions }),
    });

    if (isPending || !data?.data?.success) {
        return null;
    }

    return children;
}

