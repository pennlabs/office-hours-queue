import React, { useContext, useState } from "react";
import { Grid, Header, Segment } from "semantic-ui-react";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import InstructorCourses from "./InstructorCourses";
import StudentCourses from "./StudentCourses";
import Footer from "../../common/Footer";
import { AuthUserContext } from "../../../context/auth";
import { Course, Kind, UserMembership, mutateFunction } from "../../../types";
import { useMemberships } from "../../../hooks/data-fetching/dashboard";
import { isLeadershipRole } from "../../../utils/enums";

// TODO: try to readd new user stuff, rip out loading stuff
const Dashboard = () => {
    const { user: initalUser } = useContext(AuthUserContext);

    const [memberships, , , mutate]: [
        UserMembership[],
        any,
        boolean,
        mutateFunction<UserMembership[]>
    ] = useMemberships(initalUser);

    const getMemberships = (isStudent: boolean): UserMembership[] => {
        return memberships.filter((membership) => {
            return (
                (isStudent && membership.kind === Kind.STUDENT) ||
                (!isStudent && membership.kind !== Kind.STUDENT)
            );
        });
    };

    const canCreateCourse: boolean =
        memberships.findIndex((membership) =>
            isLeadershipRole(membership.kind)
        ) !== -1;

    /* STATE */
    // const [newUserModalOpen, setNewUserModalOpen] = useState(props.newUser);
    const hasInstructorCourses = getMemberships(false).length > 0;
    const [toast] = useState({ message: "", success: true });
    const [toastOpen, setToastOpen] = useState(false);

    return (
        <Grid.Column
            width={13}
            style={{ display: "flex", flexDirection: "column" }}
        >
            {/* {props.user && (
                <NewUserModal
                    open={newUserModalOpen}
                    closeFunc={() => {
                        props.setNewUser(false);
                        setNewUserModalOpen(false);
                    }}
                    user={props.user}
                    setToast={(d) => {
                        setToast(d);
                        setToastOpen(true);
                    }}
                    mutate={props.mutate}
                />
            )} */}
            {memberships && (
                <Grid padded stackable>
                    <Grid.Row>
                        <Segment basic padded>
                            <Header as="h2">
                                <Header.Content>Student Courses</Header.Content>
                            </Header>
                        </Segment>
                    </Grid.Row>
                    {/* {props.loading ? (
                        <Grid style={{ width: "100%" }} stackable>
                            <Grid.Row padded="true" stackable>
                                {_.times(3, () => (
                                    <Grid.Column
                                        style={{
                                            width: "280px",
                                            height: "120px",
                                        }}
                                    >
                                        <Segment basic>
                                            <Segment raised>
                                                <Placeholder>
                                                    <Placeholder.Header>
                                                        <Placeholder.Line />
                                                        <Placeholder.Line />
                                                    </Placeholder.Header>
                                                    <Placeholder.Paragraph>
                                                        <Placeholder.Line length="medium" />
                                                        <Placeholder.Line length="short" />
                                                    </Placeholder.Paragraph>
                                                </Placeholder>
                                            </Segment>
                                        </Segment>
                                    </Grid.Column>
                                ))}
                            </Grid.Row>
                        </Grid>
                    ) : ( */}
                    <StudentCourses
                        memberships={getMemberships(true)}
                        mutate={mutate}
                    />
                    {/* )} */}
                    {/* {!props.loading && */}
                    {hasInstructorCourses && (
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
