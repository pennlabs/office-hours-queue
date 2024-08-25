import { useContext, useState, useEffect } from "react";
import { Grid, Header, Segment, Message } from "semantic-ui-react";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import { useMediaQuery } from "@material-ui/core";
import InstructorCourses from "./InstructorCourses";
import StudentCourses from "./StudentCourses";
import EventSidebar from "../../Calendar/DashboardCalendar/EventSidebar";
import Footer from "../../common/Footer";
import { AuthUserContext } from "../../../context/auth";
import { Kind, UserMembership } from "../../../types";
import { useMemberships } from "../../../hooks/data-fetching/dashboard";
import { isLeadershipRole } from "../../../utils/enums";
import { CHANGELOG_TOKEN, MOBILE_BP } from "../../../constants";
import ModalShowNewChanges from "./Modals/ModalShowNewChanges";
import updatedMd from "../../Changelog/changelogfile.md";
import tips from "./Messages/tips.json";

// TODO: try to readd new user stuff, rip out loading stuff
const Dashboard = () => {
    const { user: initialUser } = useContext(AuthUserContext);
    if (initialUser === undefined) {
        throw new Error("Must be logged-in");
    }

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

    const [tipDisp, setTipDisp] = useState(false);

    const getTip = () => {
        const filteredTips = canCreateCourse
            ? tips
            : tips.filter((x) => x.student === true);
        const currentDate = new Date();
        const index = currentDate.getDate() % filteredTips.length;
        return filteredTips[index];
    };

    useEffect(() => {
        // Message display based on local storage
        const currentDate = new Date();
        const today = currentDate.toDateString();
        setTipDisp(today !== localStorage.getItem("tipLastSeenDate"));
    }, []);

    useEffect(() => {
        const savedMd = `${window.localStorage.getItem(CHANGELOG_TOKEN)}`;
        if (updatedMd !== savedMd) setLogOpen(true);
    }, []);

    const isMobile = useMediaQuery(`(max-width: ${MOBILE_BP})`);

    return (
        <Grid.Column
            width={13}
            style={{
                display: "flex",
                flexDirection: "row-reverse",
                justifyContent: "space-between",
            }}
        >
            {!isMobile && <EventSidebar memberships={memberships} />}
            <div style={{ minWidth: 0 }}>
                {memberships && (
                    <Grid padded stackable container>
                        <Grid.Row>
                            <Segment basic>
                                <Segment basic>
                                    <Header as="h2">Student Courses</Header>
                                </Segment>
                            </Segment>
                        </Grid.Row>
                        {tipDisp && (
                            <Segment
                                basic
                                style={{
                                    position: "absolute",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                }}
                            >
                                <Message
                                    onDismiss={() => {
                                        const today = new Date().toDateString();
                                        localStorage.setItem(
                                            "tipLastSeenDate",
                                            today
                                        );
                                        setTipDisp(false);
                                    }}
                                    size="mini"
                                    header={`💡Tip of the Day: ${
                                        getTip().title
                                    }`}
                                    content={getTip().description}
                                />
                            </Segment>
                        )}
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
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                    }}
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

                <Footer />
                <ModalShowNewChanges
                    openModal={logModal}
                    setOpen={setLogModal}
                />
            </div>
        </Grid.Column>
    );
};

export default Dashboard;
