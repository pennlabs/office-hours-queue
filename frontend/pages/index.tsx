import React, { useContext } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { AuthUserContext, withAuth } from "../context/auth";
import Home from "../components/Home/Home";
import AuthPrompt from "../components/Auth/AuthPrompt";
import Dashboard from "../components/Home/Dashboard/Dashboard";
import ModalRedirectAddCourse from "../components/Home/Dashboard/Modals/ModalRedirectAddCourse";
import { useCourse } from "../hooks/data-fetching/course";

const LandingPage = () => {
    const { user } = useContext(AuthUserContext);
    const { query } = useRouter();

    const [signUpCourse] = useCourse(Number(query.signup), undefined);

    return (
        <>
            {signUpCourse && !signUpCourse.inviteOnly && (
                <ModalRedirectAddCourse course={signUpCourse} />
            )}
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
