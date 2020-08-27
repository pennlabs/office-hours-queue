import React, { ReactElement } from "react";
import NextErrorComponent from "next/error";
import { NextPageContext } from "next";

import { logMessage } from "../utils/sentry";

// Inspired by https://leerob.io/blog/configuring-sentry-for-nextjs-apps
// TODO: clean this up/add a custom error page
const Error = ({
    statusCode = 500,
    message = "Something went wrong",
}: ErrorProps): ReactElement => {
    return <NextErrorComponent statusCode={statusCode} />;
};

Error.getInitialProps = ({ res, err }: NextPageContext) => {
    const statusCode =
        (res && res.statusCode) || (err && err.statusCode) || 404;
    let message = (err && err.message) || undefined;

    if (!message) {
        if (statusCode === 404) {
            message = "The page you were looking for does not exist.";
        } else {
            message = "Something went wrong.";
        }
    } else {
        logMessage(`${statusCode}: ${message}`);
    }

    return { statusCode, message };
};

type ErrorProps = {
    statusCode?: number;
    message?: string;
};

export default Error;
