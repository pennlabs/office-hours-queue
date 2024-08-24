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
        "While In Queue...",
        WhileInQueue
    );
    const [SettingsHeader, SettingsBody] = useSection("Settings", Settings);
    return (
        <>
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
                Have any lingering questions? Please email us at contact@ohq.io
                - we&apos;re happy to help!
            </p>
        </>
    );
}
