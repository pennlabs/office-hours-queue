import React, { useEffect } from "react";
import { NextPage } from "next";
import { initGA, logPageView } from "./googleAnalytics";

export default function withGA<T>(WrappedComponent: NextPage<T>) {
    const GAComponent = ({ ...props }: T) => {
        useEffect(() => {
            // @ts-ignore - this hacks the window object and is apparently recommended
            // https://coderrocketfuel.com/article/add-google-analytics-to-a-next-js-and-react-website
            if (!window.GA_INITIALIZED) {
                initGA();
                // @ts-ignore
                window.GA_INITIALIZED = true;
            }
            logPageView();
        }, []);
        // eslint-disable-next-line
        return <WrappedComponent {...props} />;
    };

    return GAComponent;
}
