import React, { useContext, useState, useEffect } from "react";
import { Grid, Header, Segment, Message } from "semantic-ui-react";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import InstructorCourses from "./InstructorCourses";
import StudentCourses from "./StudentCourses";
import Footer from "../../common/Footer";
import { AuthUserContext } from "../../../utils/auth";
import { Kind, UserMembership } from "../../../types";
import { useMemberships } from "../../../hooks/data-fetching/dashboard";
import { isLeadershipRole } from "../../../utils/enums";
import { ANALYTICS_SURVEY_SHOWN_SPRING_2021_END_TOKEN } from "../../../constants";

// TODO: try to readd new user stuff, rip out loading stuff
const Dashboard = () => {
    const { user: initialUser } = useContext(AuthUserContext);
    if (initialUser === undefined) {
        throw new Error("Must be logged-in");
    }
    const [messageDisp, setMessageDisp] = useState(false);
    useEffect(() => {
        const state = localStorage.getItem(
            ANALYTICS_SURVEY_SHOWN_SPRING_2021_END_TOKEN
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

    return (
        <Grid.Column
            width={13}
            style={{ display: "flex", flexDirection: "column" }}
        >
            {memberships && (
                <Grid padded stackable>
                    <Grid.Row>
                        <Segment basic padded>
                            <Header as="h2">
                                <Header.Content>Student Courses</Header.Content>
                            </Header>
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
                                            ANALYTICS_SURVEY_SHOWN_SPRING_2021_END_TOKEN,
                                            "true"
                                        );
                                    }}
                                    size="mini"
                                    header="The semester is ending..."
                                    content={
                                        <>
                                            and we want to hear from you! Help
                                            us improve OHQ by filling
                                            <br />
                                            out our{" "}
                                            <a
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                href="https://airtable.com/shrFrWqkc6vVNziIa"
                                            >
                                                end-of-semester survey
                                            </a>{" "}
                                            today!
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
                                <Segment basic padded>
                                    <Header as="h2">
                                        <Header.Content>
                                            Instructor Courses
                                        </Header.Content>
                                    </Header>
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
            <Footer />
        </Grid.Column>
    );
};

export default Dashboard;
