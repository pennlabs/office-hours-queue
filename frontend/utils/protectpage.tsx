import React from "react";
import { NextPageContext } from "next";
import { User } from "../types";
import nextRedirect from "./redirect";

export const withProtectPage = (
    WrappedComponent,
    condition: (user: User, ctx: NextPageContext) => boolean
) => {
    const ProtectedComponent = ({ children, ...props }) => {
        return <WrappedComponent {...props}>{children}</WrappedComponent>;
    };

    ProtectedComponent.getInitialProps = async (ctx: NextPageContext) => {
        // TODO: add types to enforce that the wrapped component
        // implements getInitialProps that returns an object with
        // a user object
        const wrappedProps = await WrappedComponent.getInitialProps(ctx);
        const { user } = wrappedProps;
        if (user && !condition(user, ctx)) {
            return nextRedirect(ctx, () => true, "/404");
        }

        return wrappedProps;
    };

    return ProtectedComponent;
};
