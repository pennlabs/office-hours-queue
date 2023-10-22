import "semantic-ui-css/semantic.min.css";
import "../styles/index.css";

import { useEffect } from "react";
import { SWRConfig } from "swr";

import { doApiRequest } from "../utils/fetch";
import withGA from "../utils/ga/withGA";
import { askNotificationPermissions } from "../utils/notifications";

const MyApp = ({ Component, pageProps }) => {
    useEffect(() => {
        askNotificationPermissions();
    }, []);
    return (
        <SWRConfig
            value={{
                fetcher: (path, ...args) =>
                    doApiRequest(path, ...args).then((res) => res.json()),
                refreshWhenHidden: true,
            }}
        >
            {/* This is necessary for generic HOC */}
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <Component {...pageProps} />
        </SWRConfig>
    );
};

export default withGA(MyApp);
