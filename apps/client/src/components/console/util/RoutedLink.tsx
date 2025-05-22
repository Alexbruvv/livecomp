import { Link, LinkProps } from "@cloudscape-design/components";
import { createLink, LinkComponent, useNavigate } from "@tanstack/react-router";
import React from "react";

type CloudscapeLinkProps = Omit<LinkProps, "href">;

const CloudscapeLinkComponent = React.forwardRef<HTMLAnchorElement, CloudscapeLinkProps>((props, ref) => {
    return <Link ref={ref} {...props} />;
});

const CreatedLinkComponent = createLink(CloudscapeLinkComponent);

export const RoutedLink: LinkComponent<typeof CloudscapeLinkComponent> = (props) => {
    const navigate = useNavigate();

    return (
        <CreatedLinkComponent
            preload="intent"
            href="#"
            onFollow={(e) => {
                e.preventDefault();

                if (props.to) {
                    // @ts-expect-error the types are strange here, but this works
                    navigate({ to: props.to, params: props.params });
                }
            }}
            {...props}
        />
    );
};

