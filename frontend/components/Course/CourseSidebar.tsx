import React, { useState, useEffect, useContext } from "react";
import {
    Segment,
    Menu,
    Grid,
    Image,
    Header,
    List,
    Icon,
} from "semantic-ui-react";
import { prettifyRole } from "../../utils/enums";

import AboutModal from "../LandingPage/AboutModal";
import { useStaff, useLeadership } from "./CourseRequests";
import { AuthUserContext } from "../../context/auth";

const CourseSidebar = props => {
    const [
        leadership,
        leadershipError,
        leadershipLoading,
        leadershipMutate,
    ] = useLeadership(props.courseId, props.leadership);

    const { user: initialUser } = useContext(AuthUserContext);
    const [leader, staff, leaderError, leaderLoading, leaderMutate] = useStaff(
        props.courseId,
        initialUser
    );

    const noWrapStyle = {
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflow: "hidden",
    };
    const [showAboutModal, setShowAboutModal] = useState(false);

    return (
        <Grid.Column width={3}>
            <Segment basic>
                <Image
                    src="../../../ohq.png"
                    size="tiny"
                    href="/"
                    style={{ marginTop: "10px" }}
                />
                <Menu vertical secondary fluid>
                    <Menu.Item
                        style={noWrapStyle}
                        name="Queues"
                        icon="hourglass one"
                        onClick={() => props.clickFunc("queues")}
                        active={props.active === "queues"}
                        color="blue"
                    />
                    {staff && (
                        <Menu.Item
                            style={noWrapStyle}
                            name="Roster"
                            icon="users"
                            onClick={() => props.clickFunc("roster")}
                            active={props.active === "roster"}
                            color="blue"
                        />
                    )}
                    {staff && (
                        <Menu.Item
                            style={noWrapStyle}
                            name="Analytics"
                            icon="chart bar"
                            onClick={() => props.clickFunc("analytics")}
                            active={props.active === "analytics"}
                            color="blue"
                        />
                    )}
                    {staff && (
                        <Menu.Item
                            style={noWrapStyle}
                            name="Question Summary"
                            icon="list ol"
                            onClick={() => props.clickFunc("summary")}
                            active={props.active === "summary"}
                            color="blue"
                        />
                    )}
                    {leader && (
                        <Menu.Item
                            style={noWrapStyle}
                            name="Course Settings"
                            icon="settings"
                            onClick={() => props.clickFunc("settings")}
                            active={props.active === "settings"}
                            color="blue"
                        />
                    )}
                </Menu>
            </Segment>
            {leadership && (
                <Segment basic>
                    <Header as="h3">Instructors</Header>
                    <List>
                        {leadership.map(membership => {
                            return (
                                <List.Item
                                    key={membership.id}
                                    style={{ marginBottom: "8px" }}
                                >
                                    <Icon name="user" />
                                    <List.Content>
                                        <List.Header as="a" target="_blank">
                                            {`${membership.user.firstName} ${membership.user.lastName}`}
                                        </List.Header>
                                        <List.Description>
                                            {prettifyRole(membership.kind)}
                                        </List.Description>
                                    </List.Content>
                                </List.Item>
                            );
                        })}
                    </List>
                </Segment>
            )}
            <div
                className="about about-dashboard"
                onClick={() => setShowAboutModal(true)}
            >
                <label>Feedback</label>
            </div>
            <AboutModal
                open={showAboutModal}
                closeFunc={() => setShowAboutModal(false)}
            />
        </Grid.Column>
    );
};

export default CourseSidebar;
