import React, { useContext, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Button, Modal } from "semantic-ui-react";
import { AuthUserContext, withAuth } from "../context/auth";
import Home from "../components/Home/Home";
import AuthPrompt from "../components/Auth/AuthPrompt";
import Dashboard from "../components/Home/Dashboard/Dashboard";
import { joinCourse } from "../hooks/data-fetching/dashboard";

const LandingPage = () => {
    const { user } = useContext(AuthUserContext);
    const { query } = useRouter();
    const [open, setOpen] = useState(!!query.signup);

    const onJoin = async () => {
        setOpen(false);
        await joinCourse(query.signup as string);
    };

    return (
        <>
            <div>
                <Modal open={open} setOpen={setOpen}>
                    <Modal.Header>Join Course</Modal.Header>
                    <Modal.Content>{query.signup}</Modal.Content>
                    <Modal.Actions>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={onJoin}>Join</Button>
                    </Modal.Actions>
                </Modal>
            </div>
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
