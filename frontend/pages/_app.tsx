import React from "react";
import "semantic-ui-css/semantic.min.css";
import "../styles/index.css";
import { AppProps } from "next/app";
import { SWRConfig } from "swr";

const MyApp = ({ Component, pageProps }) => {
    return (
        <SWRConfig
            value={{
                fetcher: (...args) => fetch(...args).then((res) => res.json()),
            }}
        >
            <Component {...pageProps} />
        </SWRConfig>
    );
};

export default MyApp;
