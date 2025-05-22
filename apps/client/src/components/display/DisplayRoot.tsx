import { PropsWithChildren, useEffect } from "react";

export default function DisplayRoot({ children }: PropsWithChildren) {
    useEffect(() => {
        import("../../styles/display/index.css");
    }, []);

    return <>{children}</>;
}

