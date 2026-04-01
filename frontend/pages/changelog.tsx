import React from "react";
import Head from "next/head";
import Home from "../components/Home/Home";
import Changelog from "../components/Changelog";
import { SITE_NAME } from "../utils/branding";

const LandingPage = () => {
    return (
        <>
            <Head>
                <title>{`${SITE_NAME} | Changelog`}</title>
            </Head>
            <Home>
                <Changelog />
            </Home>
        </>
    );
};

export default LandingPage;
