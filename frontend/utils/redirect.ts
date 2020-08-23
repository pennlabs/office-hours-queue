import Router from "next/router";
import { NextPageContext } from "next";

export default function nextRedirect(
    { req, res }: NextPageContext,
    condition: (url: string) => boolean,
    redirectUrl: string
) {
    if (typeof window === "undefined") {
        if (condition(req.url)) {
            res.writeHead(302, { Location: redirectUrl });
            res.end();
        }
    } else if (condition(window.location.pathname)) {
        Router.replace(redirectUrl);
    }

    return { user: null };
}
