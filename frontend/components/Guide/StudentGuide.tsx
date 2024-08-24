import { Segment, List } from "semantic-ui-react";

import {
    EnrollCourse,
    Calendar,
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
    const [CalendarHeader, CalendarBody] = useSection(
        "Viewing your Calendar",
        Calendar
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
                    <CalendarHeader />
                    <SettingsHeader />
                </List>
            </Segment>

            <EnrollCourseBody />
            <NotificationsBody />
            <JoiningOHBody />
            <WhileInQueueBody />
            <CalendarBody />
            <SettingsBody />
        </>
    );
}
