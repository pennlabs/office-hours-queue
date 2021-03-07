import React, { useContext, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { AuthUserContext, withAuth } from "../context/auth";
import Home from "../components/Home/Home";
import AuthPrompt from "../components/Auth/AuthPrompt";
import Dashboard from "../components/Home/Dashboard/Dashboard";
import ModalRedirectAddCourse from "../components/Home/Dashboard/Modals/ModalRedirectAddCourse";
import { useCourse } from "../hooks/data-fetching/course";
import { Toast } from "../types";

const LandingPage = () => {
    const { user } = useContext(AuthUserContext);
    const { query } = useRouter();

    const [toast, setToast] = useState<Toast>({ message: "", success: true });
    const [toastOpen, setToastOpen] = useState(false);

    const [signUpCourse] = useCourse(Number(query.signup), undefined);

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

export default withAuth(LandingPage);
