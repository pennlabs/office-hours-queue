import React, { useEffect } from "react";
import Head from "next/head";
import "semantic-ui-css/semantic.min.css";
import "../styles/index.css";
import { SWRConfig } from "swr";
import { doApiRequest } from "../utils/fetch";
import withGA from "../utils/ga/withGA";
import { askNotificationPermissions } from "../hooks/notifcation";

const MyApp = ({ Component, pageProps }) => {
    useEffect(() => {
        askNotificationPermissions();
    });
    return (
        <SWRConfig
            value={{
                fetcher: (path, ...args) =>
                    doApiRequest(path, ...args).then((res) => res.json()),
                refreshWhenHidden: true,
            }}
        >
            <Head>
                <link
                    rel="stylesheet"
                    href="https://use.fontawesome.com/releases/v5.6.3/css/all.css"
                    integrity="sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/"
                    crossOrigin="anonymous"
                />
            </Head>
            {/* This is necessary for generic HOC */}
            {/* eslint-disable-next-line */}
            <Component {...pageProps} />
        </SWRConfig>
    );
};

export default withGA(MyApp);
