import React from "react";
import Head from "next/head";
import { withAuth, withAuthComponent } from "../utils/auth";
import Home from "../components/Home/Home";
import AccountSettings from "../components/Home/AccountSettings/AccountSettings";

const LandingPage = () => {
    return (
        <>
            <Head>
                <title>OHQ | Account Settings</title>
            </Head>
            <Home>
                <AccountSettings />
            </Home>
        </>
    );
};

export const getServerSideProps = withAuth(async () => ({ props: {} }));

export default withAuthComponent(LandingPage);
