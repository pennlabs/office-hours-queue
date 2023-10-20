import { useState } from "react";
import { Segment, Header, Grid, Menu } from "semantic-ui-react";

import InstructorGuide from "./InstructorGuide";
import StudentGuide from "./StudentGuide";
import Footer from "../common/Footer";

enum Page {
    Instructor = "Instructor",
    Student = "Student",
}

export default function Guide() {
    const [tab, setTab] = useState(Page.Instructor);

    const handleClick = (e, { name }) => setTab(name);

    return (
        <Grid.Column
            width={13}
            style={{
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Grid.Row>
                <Segment basic>
                    <Header as="h2">Frequently Asked Questions</Header>
                    <p>
                        Hi there! 🎉
                        <br />
                        <br />
                        Welcome to OHQ, a centralized online office hours system
                        that helps instructors like you manage office hours
                        easily and intuitively, so you can focus on teaching and
                        your students can focus on learning in office hours.
                        This guide will walk you through using OHQ, so your
                        experience holding office hours can be as easy and
                        straightforward as possible.
                    </p>
                    <Menu attached="top" tabular>
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
                    <Segment attached="bottom" basic>
                        {tab === Page.Instructor && <InstructorGuide />}
                        {tab === Page.Student && <StudentGuide />}
                    </Segment>
                </Segment>
            </Grid.Row>
            <Footer />
        </Grid.Column>
    );
}
