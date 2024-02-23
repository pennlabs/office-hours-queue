import { Segment, List } from "semantic-ui-react";

import {
    EnrollCourse,
    Notifications,
    JoiningOfficeHours,
    WhileInQueue,
    Settings,
    Feedback,
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
    const [FeedbackHeader, FeedbackBody] = useSection("Feedback", Feedback);

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
                    <FeedbackHeader />
                </List>
            </Segment>

            <EnrollCourseBody />
            <NotificationsBody />
            <JoiningOHBody />
            <WhileInQueueBody />
            <SettingsBody />
            <FeedbackBody />
        </>
    );
}
