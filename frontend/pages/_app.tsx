import React from "react";
import "semantic-ui-css/semantic.min.css";
import "../styles/index.css";
import { SWRConfig } from "swr";
import { doApiRequest } from "../utils/fetch";
import withGA from "../utils/ga/withGA";

const MyApp = ({ Component, pageProps }) => {
    return (
        <SWRConfig
            value={{
                fetcher: (path, ...args) =>
                    doApiRequest(path, ...args).then((res) => res.json()),
                refreshWhenHidden: true,
            }}
        >
            {/* This is necessary for generic HOC */}
            {/* eslint-disable-next-line */}
            <Component {...pageProps} />
        </SWRConfig>
    );
};

export default withGA(MyApp);
