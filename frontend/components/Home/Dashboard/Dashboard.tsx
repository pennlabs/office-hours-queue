import { useContext, useState, useEffect } from "react";
import { Grid, Header, Segment, Message } from "semantic-ui-react";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import { useMediaQuery } from "@material-ui/core";
import InstructorCourses from "./InstructorCourses";
import StudentCourses from "./StudentCourses";
import Footer from "../../common/Footer";
import { AuthUserContext } from "../../../context/auth";
import { Kind, UserMembership } from "../../../types";
import { useMemberships } from "../../../hooks/data-fetching/dashboard";
import { isLeadershipRole } from "../../../utils/enums";
import {
    CHANGELOG_TOKEN,
    SPRING_2023_TRANSITION_MESSAGE_TOKEN,
    MOBILE_BP,
} from "../../../constants";
import ModalShowNewChanges from "./Modals/ModalShowNewChanges";
import updatedMd from "../../Changelog/changelogfile.md";

// TODO: try to readd new user stuff, rip out loading stuff
const Dashboard = () => {
    const { user: initialUser } = useContext(AuthUserContext);
    if (initialUser === undefined) {
        throw new Error("Must be logged-in");
    }
    const [messageDisp, setMessageDisp] = useState(false);
    useEffect(() => {
        const state = localStorage.getItem(
            SPRING_2023_TRANSITION_MESSAGE_TOKEN
        );
        setMessageDisp(state !== "true");
    }, []);

    const { memberships, mutate } = useMemberships(initialUser);

    const getMemberships = (isStudent: boolean): UserMembership[] => {
        return memberships.filter((membership) => {
            return (
                (isStudent && membership.kind === Kind.STUDENT) ||
                (!isStudent && membership.kind !== Kind.STUDENT)
            );
        });
    };

    const isFaculty = initialUser.groups.includes("platform_faculty");

    const canCreateCourse: boolean =
        memberships.findIndex((membership) =>
            isLeadershipRole(membership.kind)
        ) !== -1 || isFaculty;

    /* STATE */
    // const [newUserModalOpen, setNewUserModalOpen] = useState(props.newUser);
    const showInstructorCourses =
        getMemberships(false).length > 0 || canCreateCourse;
    const [toast] = useState({ message: "", success: true });
    const [toastOpen, setToastOpen] = useState(false);

    const [logToast] = useState({
        message: "View new changes to OHQ.io",
        success: true,
    });
    const [logOpen, setLogOpen] = useState(false);
    const [logModal, setLogModal] = useState(false);

    useEffect(() => {
        const savedMd = `${window.localStorage.getItem(CHANGELOG_TOKEN)}`;
        if (updatedMd !== savedMd) setLogOpen(true);
    }, []);

    return (
        <Grid.Column
            width={13}
            style={{ display: "flex", flexDirection: "column" }}
        >
            {memberships && (
                <Grid padded stackable container>
                    <Grid.Row>
                        <Segment basic>
                            <Segment basic>
                                <Header as="h2">Student Courses</Header>
                            </Segment>
                        </Segment>
                        {messageDisp && (
                            <div
                                style={{
                                    position: "absolute",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                }}
                            >
                                <Message
                                    onDismiss={() => {
                                        setMessageDisp(false);
                                        localStorage.setItem(
                                            SPRING_2023_TRANSITION_MESSAGE_TOKEN,
                                            "true"
                                        );
                                    }}
                                    size="mini"
                                    header="Welcome back!"
                                    content={
                                        <>
                                            Fall 2022 courses have been archived
                                            in preparation for Spring 2023.
                                            <br />
                                            Please contact us at contact@ohq.io
                                            if this is an error.
                                        </>
                                    }
                                />
                            </div>
                        )}
                    </Grid.Row>
                    <StudentCourses
                        memberships={getMemberships(true)}
                        mutate={mutate}
                    />
                    {showInstructorCourses && (
                        <>
                            <Grid.Row>
                                <Segment basic>
                                    <Segment basic>
                                        <Header as="h2">
                                            Instructor Courses
                                        </Header>
                                    </Segment>
                                </Segment>
                            </Grid.Row>
                            <InstructorCourses
                                memberships={getMemberships(false)}
                                mutate={mutate}
                                canCreateCourse={canCreateCourse}
                            />
                        </>
                    )}
                </Grid>
            )}
            <Snackbar
                open={toastOpen}
                autoHideDuration={6000}
                onClose={() => setToastOpen(false)}
            >
                <Alert
                    severity={toast.success ? "success" : "error"}
                    onClose={() => setToastOpen(false)}
                >
                    {toast.message}
                </Alert>
            </Snackbar>

            <Snackbar
                open={logOpen}
                autoHideDuration={10000}
                onClose={() => setLogOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    severity="info"
                    onClose={() => setLogOpen(false)}
                    onClick={() => {
                        setLogOpen(false);
                        setLogModal(true);
                    }}
                    style={{ cursor: "pointer" }}
                >
                    {logToast.message}
                </Alert>
            </Snackbar>

            <Footer showFeedback={useMediaQuery(`(max-width: ${MOBILE_BP})`)} />
            <ModalShowNewChanges openModal={logModal} setOpen={setLogModal} />
        </Grid.Column>
    );
};

export default Dashboard;
