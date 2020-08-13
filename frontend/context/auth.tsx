import React, { createContext } from "react";
import Router from "next/router";

export const AuthUserContext = createContext();

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
            headers: { cookie: ctx.req.headers.cookie },
        };

        // TODO: Fix route for prod here
        const res = await fetch(
            "http://localhost:3000/api/accounts/me/",
            headers
        );
        let user = null;
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
