import React, { createContext } from "react";
import { NextPageContext, NextPage } from "next";
import nextRedirect from "../utils/redirect";
import { doApiRequest } from "../utils/fetch";
import { User } from "../types";

export const AuthUserContext: React.Context<{ user: User }> = createContext({
    user: null,
});

export interface AuthProps {
    user?: User;
}

export function withAuth<T>(
    WrappedComponent: NextPage<T>
): NextPage<T & AuthProps> {
    const AuthedComponent = ({ user, ...props }: T & AuthProps) => {
        return (
            <AuthUserContext.Provider value={{ user }}>
                {/* eslint-disable-next-line */}
                <WrappedComponent {...(props as T)} />
            </AuthUserContext.Provider>
        );
    };

    AuthedComponent.getInitialProps = async (ctx: NextPageContext) => {
        const headers = {
            credentials: "include",
            headers: ctx.req ? { cookie: ctx.req.headers.cookie } : undefined,
        };

        const res = await doApiRequest("/accounts/me/", headers);
        let user: User = null;
        if (res.ok) {
            user = await res.json();
        } else {
            nextRedirect(ctx, (url) => url !== "/", "/");
        }

        const props =
            WrappedComponent.getInitialProps &&
            (await WrappedComponent.getInitialProps(ctx));

        return { ...props, user };
    };

    return AuthedComponent;
}
