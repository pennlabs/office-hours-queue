import Head from "next/head";
import { withAuth } from "../context/auth";
import Home from "../components/Home/Home";
import AccountSettings from "../components/Home/AccountSettings/AccountSettings";
import { SITE_NAME } from "../utils/branding";

const LandingPage = () => {
    return (
        <>
            <Head>
                <title>{`${SITE_NAME} | Account Settings`}</title>
            </Head>
            <Home>
                <AccountSettings />
            </Home>
        </>
    );
};

export default withAuth(LandingPage);
