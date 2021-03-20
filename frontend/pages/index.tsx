import React, { useContext, useState } from "react";
import Head from "next/head";
import { Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { NextPageContext } from "next";
import { AuthUserContext, withAuth } from "../context/auth";
import Home from "../components/Home/Home";
import AuthPrompt from "../components/Auth/AuthPrompt";
import Dashboard from "../components/Home/Dashboard/Dashboard";
import ModalRedirectAddCourse from "../components/Home/Dashboard/Modals/ModalRedirectAddCourse";
import { Course, Toast } from "../types";
import { doApiRequest } from "../utils/fetch";

interface LandingPageProps {
    signUpCourse?: Course;
}

const LandingPage = ({ signUpCourse }: LandingPageProps) => {
    const { user } = useContext(AuthUserContext);

    const [toast, setToast] = useState<Toast>({ message: "", success: true });
    const [toastOpen, setToastOpen] = useState(false);

    return (
        <>
            {signUpCourse && signUpCourse.id && !signUpCourse.isMember && (
                <ModalRedirectAddCourse
                    course={signUpCourse}
                    toastFunc={(newToast: Toast) => {
                        setToast(newToast);
                        setToastOpen(true);
                    }}
                />
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
            <Snackbar
                open={toastOpen}
                autoHideDuration={2000}
                onClose={() => setToastOpen(false)}
            >
                <Alert
                    severity={toast.success ? "success" : "error"}
                    onClose={() => setToastOpen(false)}
                >
                    <span>{toast.message}</span>
                </Alert>
            </Snackbar>
        </>
    );
};

LandingPage.getInitialProps = async (
    context: NextPageContext
): Promise<LandingPageProps> => {
    const { query, req } = context;
    const data = {
        headers: req ? { cookie: req.headers.cookie } : undefined,
    };

    const signUpId = Number(query.signup);
    let signUpCourse: Course | undefined;
    if (signUpId) {
        signUpCourse = await doApiRequest(
            `/courses/${signUpId}`,
            data
        ).then((res) => res.json());
    }
    return { signUpCourse };
};

export default withAuth(LandingPage);
