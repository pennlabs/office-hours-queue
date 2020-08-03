import React from "react";
import "semantic-ui-css/semantic.min.css";
import "../styles/index.css";
import { AppProps } from "next/app";
import { AuthProvider } from "../context/auth";

const MyApp = ({ Component, pageProps }) => {
    return (
        <AuthProvider>
            <Component {...pageProps} />
        </AuthProvider>
    );
};

export default MyApp;
