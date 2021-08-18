import React, { createContext } from "react";
import {
    NextPage,
    GetServerSidePropsContext,
    GetServerSidePropsResult,
    Redirect,
} from "next";
import nextRedirect from "./redirect";
import { doApiRequest } from "./fetch";
import { User } from "../types";

export const AuthUserContext: React.Context<{ user?: User }> = createContext(
    {}
);

export interface AuthProps {
    user?: User;
}

type GetServerSidePropsResultDiscUnion<T> =
    | { tag: "props"; props: T }
    | { tag: "redirect"; redirect: Redirect }
    | { tag: "notFound"; notFound: true };

function convertGetServerSidePropsResult<T>(
    r: GetServerSidePropsResult<T>
): GetServerSidePropsResultDiscUnion<T> {
    if (Object.prototype.hasOwnProperty.call(r, "props")) {
        const casted = r as { props: T };
        return { tag: "props", props: casted.props };
    } else if (Object.prototype.hasOwnProperty.call(r, "redirect")) {
        const casted = r as { redirect: Redirect };
        return { tag: "redirect", redirect: casted.redirect };
    } else if (Object.prototype.hasOwnProperty.call(r, "notFound")) {
        return { tag: "notFound", notFound: true };
    }

    throw new Error("NextJS typing information incorrect");
}

type GetServerSidePropsFunc<T> = (
    ctx: GetServerSidePropsContext
) => Promise<GetServerSidePropsResult<T>>;

export function withAuth<T>(getServerSidePropsFunc: GetServerSidePropsFunc<T>) {
    return async (
        ctx: GetServerSidePropsContext
    ): Promise<GetServerSidePropsResult<T & AuthProps>> => {
        const headers = {
            credentials: "include",
            headers: { cookie: ctx.req.headers.cookie },
        };

        const res = await doApiRequest("/api/accounts/me/", headers);
        let user: User | undefined;
        if (res.ok) {
            user = await res.json();
        } else {
            const redirectObj = nextRedirect(
                ctx,
                (url) => url !== "/",
                `/api/accounts/login/?next=${ctx.resolvedUrl}`
            );

            if (redirectObj) {
                return redirectObj;
            }
        }

        const wrapped = await getServerSidePropsFunc(ctx);
        const casted = convertGetServerSidePropsResult(wrapped);

        if (casted.tag === "props") {
            return {
                props: { ...casted.props, user },
            };
        } else {
            return wrapped;
        }
    };
}

export function withAuthComponent<T>(WrappedComponent: NextPage<T>) {
    const AuthedComponent = ({ user, ...props }) => {
        return (
            <AuthUserContext.Provider value={{ user }}>
                {/* eslint-disable-next-line */}
                <WrappedComponent {...(props as T)} />
            </AuthUserContext.Provider>
        );
    };

    return AuthedComponent;
}

export function withProtectPage<T extends AuthProps>(
    getServerSidePropsFunc: GetServerSidePropsFunc<T>,
    condition: (user: User, ctx: GetServerSidePropsContext) => boolean
) {
    return async (ctx: GetServerSidePropsContext) => {
        const wrapped = await getServerSidePropsFunc(ctx);
        const casted = convertGetServerSidePropsResult(wrapped);

        if (casted.tag === "props") {
            const {
                props: { user },
            } = casted;
            if (user && !condition(user, ctx)) {
                const redirectObj = nextRedirect(ctx, () => true, "/404");
                if (redirectObj) {
                    return redirectObj;
                }
            }
        }

        return wrapped;
    };
}
