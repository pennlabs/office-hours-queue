import { NextPageContext } from "next";
import { AuthProps } from "../context/auth";
import { User } from "../types";
import nextRedirect from "./redirect";
import { GIPPage } from "./gippage";

export function withProtectPage<T extends AuthProps>(
    // this enforces that WrappedComponent has a
    // getInitialProps that contains a user object
    WrappedComponent: GIPPage<T>,
    condition: (user: User, ctx: NextPageContext) => boolean
) {
    const ProtectedComponent = ({ ...props }: T) => {
        // eslint-disable-next-line
        return <WrappedComponent {...props} />;
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
