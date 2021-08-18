import { GetServerSidePropsContext, Redirect } from "next";

export default function nextRedirect(
    ctx: GetServerSidePropsContext,
    condition: (url: string) => boolean,
    redirectUrl: string
): { redirect: Redirect } | undefined {
    if (condition(ctx.resolvedUrl)) {
        return {
            redirect: {
                destination: redirectUrl,
                permanent: false,
            },
        };
    }
    return undefined;
}
