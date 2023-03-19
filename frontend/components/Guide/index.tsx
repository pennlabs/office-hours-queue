import { useState } from "react";
import { Grid, Header, Menu } from "semantic-ui-react";

import InstructorGuide from "./InstructorGuide";
import StudentGuide from "./StudentGuide";

enum Page {
    Instructor = "Instructor",
    Student = "Student",
}

export default function Guide() {
    const [tab, setTab] = useState(Page.Instructor);

    const handleClick = (e, { name }) => setTab(name);

    return (
        <Grid.Column width={13} style={{ padding: "2rem" }}>
            <Grid.Row>
                <Header as="h2">
                    <Header.Content>Frequently Asked Questions</Header.Content>
                </Header>
                <Menu>
                    <Menu.Item
                        name={Page.Instructor}
                        active={tab === Page.Instructor}
                        onClick={handleClick}
                    >
                        For Instructors
                    </Menu.Item>
                    <Menu.Item
                        name={Page.Student}
                        active={tab === Page.Student}
                        onClick={handleClick}
                    >
                        For Students
                    </Menu.Item>
                </Menu>
            </Grid.Row>
            <Grid.Row style={{ marginTop: "2rem" }}>
                {tab === Page.Instructor && <InstructorGuide />}
                {tab === Page.Student && <StudentGuide />}
            </Grid.Row>
        </Grid.Column>
    );
}
