import React, { useContext, useState } from "react";
import Head from "next/head";
import { Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { GetServerSidePropsContext } from "next";
import Home from "../components/Home/Home";
import AuthPrompt from "../components/Auth/AuthPrompt";
import Dashboard from "../components/Home/Dashboard/Dashboard";
import ModalRedirectAddCourse from "../components/Home/Dashboard/Modals/ModalRedirectAddCourse";
import { Course, Toast } from "../types";
import { doApiRequest } from "../utils/fetch";
import { AuthUserContext, withAuth, withAuthComponent } from "../utils/auth";

interface LandingPageProps {
    signUpCourse: Course | null;
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

async function getServerSidePropsInner(context: GetServerSidePropsContext) {
    const { query, req } = context;
    const data = {
        headers: { cookie: req.headers.cookie },
    };

    const signUpId = Number(query.signup);
    let signUpCourse: Course | null = null;
    if (signUpId) {
        signUpCourse = await doApiRequest(
            `/api/courses/${signUpId}`,
            data
        ).then((res) => res.json());
    }

    return { props: { signUpCourse } };
}

export const getServerSideProps = withAuth(getServerSidePropsInner);

export default withAuthComponent(LandingPage);
