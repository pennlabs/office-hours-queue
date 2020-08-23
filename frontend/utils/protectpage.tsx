import React from "react";
import { NextPageContext, NextPage } from "next";
import { AuthProps } from "../context/auth";
import { User } from "../types";
import nextRedirect from "./redirect";

export function withProtectPage<T extends AuthProps>(
    WrappedComponent: NextPage<T>,
    condition: (user: User, ctx: NextPageContext) => boolean
) {
    const ProtectedComponent = ({ ...props }) => {
        // eslint-disable-next-line
        return <WrappedComponent {...(props as T)} />;
    };

    ProtectedComponent.getInitialProps = async (ctx: NextPageContext) => {
        const wrappedProps = await WrappedComponent.getInitialProps(ctx);
        const { user } = wrappedProps;
        if (user && !condition(user, ctx)) {
            nextRedirect(ctx, () => true, "/404");
        }

        return wrappedProps;
    };

    return ProtectedComponent;
}
