import React from "react";
import "semantic-ui-css/semantic.min.css";
import "../styles/index.css";
import { SWRConfig } from "swr";
import { doApiRequest } from "../utils/fetch";

const MyApp = ({ Component, pageProps }) => {
    return (
        <SWRConfig
            value={{
                fetcher: (path, ...args) =>
                    doApiRequest(path, ...args).then((res) => res.json()),
            }}
        >
            {/* This is necessary for generic HOC */}
            {/* eslint-disable-next-line */}
            <Component {...pageProps} />
        </SWRConfig>
    );
};

export default MyApp;
