import React, { useState, useContext } from "react";
import { Segment, Header, Grid, Placeholder } from "semantic-ui-react";
import InstructorCourses from "./InstructorCourses";
import StudentCourses from "./StudentCourses";
import _ from "lodash";
import NewUserModal from "./Modals/NewUserModal";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import { AuthUserContext } from "../../../context/auth";
import { getMemberships, Course, Membership } from "./DashboardRequests"

const Dashboard = (props) => {
    const { user: initalUser } = useContext(AuthUserContext);

    const [memberships, error, loading, mutate]: [Membership[], any, boolean, (data: any, shouldRevalidate: boolean) => Promise<any>] = getMemberships(initalUser);

    const getCourses = (isStudent: boolean): Course[] => {
        return memberships.filter((membership) => {
            return (
                (isStudent && membership.kind === "STUDENT") ||
                (!isStudent && membership.kind !== "STUDENT")
            );
        }).map((membership) => membership.course);
    };

    /* STATE */
    const [newUserModalOpen, setNewUserModalOpen] = useState(props.newUser);
    const [hasInstructorCourses, setHasInstructorCourses] = useState(
        getCourses(false).length > 0
    );
    const [toast, setToast] = useState({ message: "", success: true });
    const [toastOpen, setToastOpen] = useState(false);

    return (
        <Grid.Column width={13}>
            {props.user && (
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
                    refetch={props.refetch}
                />
            )}
            {memberships && (
                <Grid padded stackable>
                    <Grid.Row>
                        <Segment basic padded>
                            <Header as="h2">
                                <Header.Content>Student Courses</Header.Content>
                            </Header>
                        </Segment>
                    </Grid.Row>
                    {props.loading ? (
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
                    ) : (
                            <StudentCourses
                                courses={getCourses(true)}
                                refetch={mutate}
                            />
                        )}
                    {!props.loading &&
                        hasInstructorCourses && [
                            <Grid.Row>
                                <Segment basic padded>
                                    <Header as="h2">
                                        <Header.Content>
                                            Instructor Courses
                                        </Header.Content>
                                    </Header>
                                </Segment>
                            </Grid.Row>,
                            <InstructorCourses
                                courses={getCourses(false)}
                                refetch={mutate}
                            />,
                        ]}
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
        </Grid.Column>
    );
};

export default Dashboard;
