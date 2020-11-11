import React from "react";
import Head from "next/head";
import Home from "../components/Home/Home";
import Guide from "../components/Guide";

const GuidePage = () => {
    return (
        <>
            <Head>
                <title>OHQ | FAQ</title>
            </Head>
            <Home>
                <Guide />
            </Home>
        </>
    );
};

export default GuidePage;
