import React, { useContext, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { AuthUserContext, withAuth } from "../context/auth";
import Home from "../components/Home/Home";
import AuthPrompt from "../components/Auth/AuthPrompt";
import Dashboard from "../components/Home/Dashboard/Dashboard";
import ModalRedirectAddCourse from "../components/Home/Dashboard/Modals/ModalRedirectAddCourse";

const LandingPage = () => {
    const { user } = useContext(AuthUserContext);
    const { query } = useRouter();

    return (
        <>
            <ModalRedirectAddCourse signup={query.signup as string}/>
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
