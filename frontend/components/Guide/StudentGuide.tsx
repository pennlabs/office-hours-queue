import { Segment, List } from "semantic-ui-react";

import {
    EnrollCourse,
    Notifications,
    JoiningOfficeHours,
    WhileInQueue,
    Settings,
} from "./StudentGuideContent";
import { useSection } from "./utils";

export default function StudentGuide() {
    const [EnrollCourseHeader, EnrollCourseBody] = useSection(
        "Enrolling in a Course",
        EnrollCourse
    );
    const [NotificationsHeader, NotificationsBody] = useSection(
        "Setting Up Notifications",
        Notifications
    );
    const [JoiningOHHeader, JoiningOHBody] = useSection(
        "Joining Office Hours",
        JoiningOfficeHours
    );
    const [WhileInQueueHeader, WhileInQueueBody] = useSection(
        "While In Stack...",
        WhileInQueue
    );
    const [SettingsHeader, SettingsBody] = useSection("Settings", Settings);
    return (
        <>
            <Segment basic>
                Hi there! 🎉
                <br />
                Welcome to OHS, a centralized online office hours system that
                helps instructors like you manage office hours easily and
                intuitively, so you can focus on teaching and your students can
                focus on learning in office hours. This guide will walk you
                through using OHS, so your experience holding office hours can
                be as easy and straightforward as possible.
            </Segment>

            <Segment basic>
                <b>Jump to:</b>
                <List bulleted>
                    <EnrollCourseHeader />
                    <NotificationsHeader />
                    <JoiningOHHeader />
                    <WhileInQueueHeader />
                    <SettingsHeader />
                </List>
            </Segment>

            <EnrollCourseBody />
            <NotificationsBody />
            <JoiningOHBody />
            <WhileInQueueBody />
            <SettingsBody />
            <p>
                Have any lingering questions? Please email us at contact@ohs.io
                - we&apos;re happy to help!
            </p>
        </>
    );
}
