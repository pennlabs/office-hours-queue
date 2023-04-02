import Head from "next/head";
import { withAuth } from "../context/auth";
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

export default withAuth(LandingPage);
