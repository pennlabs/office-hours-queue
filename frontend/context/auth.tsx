import React, { createContext } from "react";
import Router from "next/router";
import { doApiRequest } from "../utils/fetch";
import { User } from "../types";

export const AuthUserContext: React.Context<{ user: User }> = createContext();

export const withAuth = (WrappedComponent) => {
    const AuthedComponent = ({ children, user, ...props }) => {
        return (
            <AuthUserContext.Provider value={{ user }}>
                {/* eslint-disable-next-line */}
                <WrappedComponent {...props}>{children}</WrappedComponent>
            </AuthUserContext.Provider>
        );
    };

    AuthedComponent.getInitialProps = async (ctx) => {
        const headers = {
            credentials: "include",
            headers: ctx.req ? { cookie: ctx.req.headers.cookie } : undefined,
        };

        const res = await doApiRequest("/accounts/me/", headers);
        let user: User = null;
        if (res.ok) {
            user = await res.json();
        } else {
            // redirect if authentication fails
            // checks for whether this was called client-side or server-side
            if (typeof window === "undefined") {
                if (ctx.req.originalUrl !== "/") {
                    ctx.res.writeHead(301, { Location: "/" });
                    ctx.res.end();
                }
            } else if (window.location.pathname !== "/") {
                Router.replace("/");
            }

            return { user: null };
        }

        const props =
            WrappedComponent.getInitialProps &&
            (await WrappedComponent.getInitialProps(ctx));

        return { ...props, user };
    };

    return AuthedComponent;
};
