import React, { useContext } from "react";
import Head from "next/head";
import { AuthUserContext, withAuth } from "../context/auth";
import Home from "../components/Home/Home";
import AuthPrompt from "../components/Auth/AuthPrompt";
import Dashboard from "../components/Home/Dashboard/Dashboard";

const LandingPage = () => {
    const { user } = useContext(AuthUserContext);
    return (
        <>
            <Head>
                <title>OHQ</title>
            </Head>
            {user ? (
                <Home>
                    <Dashboard />
                </Home>
            ) : (
                <AuthPrompt />
            )}
        </>
    );
};

export default withAuth(LandingPage);
