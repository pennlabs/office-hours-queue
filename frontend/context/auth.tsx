import { createContext } from "react";
import * as React from "react";
import { NextPageContext, NextPage } from "next";
import nextRedirect from "../utils/redirect";
import { doApiRequest } from "../utils/fetch";
import { User } from "../types";
import { GIPPage } from "../utils/gippage";

export const AuthUserContext: React.Context<{ user?: User }> = createContext(
    {}
);

export interface AuthProps {
    user?: User;
}

export function withAuth<T>(
    WrappedComponent: NextPage<T>
): GIPPage<T & AuthProps> {
    const AuthedComponent = ({ user, ...props }: T & AuthProps) => {
        return (
            // eslint-disable-next-line react/jsx-no-constructed-context-values
            <AuthUserContext.Provider value={{ user }}>
                {/* eslint-disable */}
                {/* @ts-ignore */}
                <WrappedComponent {...(props as T)} />
                {/* eslint-enable */}
            </AuthUserContext.Provider>
        );
    };

    AuthedComponent.getInitialProps = async (ctx: NextPageContext) => {
        const headers = {
            credentials: "include",
            headers: ctx.req ? { cookie: ctx.req.headers.cookie } : undefined,
        };

        const res = await doApiRequest("/api/accounts/me/", headers);
        let user: User | undefined;
        if (res.ok) {
            user = await res.json();
        } else {
            nextRedirect(
                ctx,
                (url) => url !== "/",
                `/api/accounts/login/?next=${ctx.asPath}`
            );
        }

        if (WrappedComponent.getInitialProps) {
            const props = await WrappedComponent.getInitialProps(ctx);
            return { ...props, user };
        } else {
            // Cast is sound: if WrappedComponent doesn't have
            // getInitialProps, then T : {}
            return { user } as T & AuthProps;
        }
    };

    return AuthedComponent;
}
