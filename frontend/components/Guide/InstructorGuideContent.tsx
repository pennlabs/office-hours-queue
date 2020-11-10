import React from "react";
import { Segment, Divider, List } from "semantic-ui-react";

import { CenteredImage } from "./utils";

export const CreateCourse = ({ ref }) => (
    <div ref={ref}>
        <Segment basic>
            <b>Create Your Course</b>
            <Divider />
            <p>
                Once you log in to OHQ, click &apos;Dashboard&apos; on the left,
                and then &apos;Create Course&apos; under &apos;Instructor
                Courses&apos;. If you do not see this option, please email
                contact@ohq.io.
            </p>
            <CenteredImage src="/create-course-1.png" alt="Creating a course" />
            <br />
            <p>
                Fill in the relevant information and settings for your course.
                You can modify the information and settings at any time after
                creating the course.
            </p>
            <p>
                OHQ currently supports Zoom, BlueJeans, Google Meet, and Whereby
                meetings links. Please email us at contact@ohq.io to request
                additional link support.
            </p>
            <CenteredImage
                src="/create-course-2.png"
                alt="Creating a course popup"
            />
            <br />
            <p>
                And that&apos;s it! You&apos;ve created your course on OHQ, and
                you&apos;re ready to add students and instructors to the course.
            </p>
        </Segment>
    </div>
);

export const InviteMembers = ({ ref }) => (
    <div ref={ref}>
        <Segment basic>
            <b>Invite Students and Instructors</b>
            <Divider />
            <p>
                Now that you've created the course, you need to help your
                students and fellow instructors access the course!
            </p>
            <List>
                <List.Item>
                    If your course is <b>invite-only</b>:
                    <List.List>
                        <List.Item>
                            Click into your course, and select
                            &apos;Roster&apos; on the left. Click
                            &apos;Invite&apos; on the top right. Now, enter the
                            email addresses of the students or instructors you
                            want to add to your course. Choose their role
                            (either Student, TA, Head TA, or Professor). Click
                            &apos;Invite&apos; to send them their invitations.
                            <List.List>
                                <List.Item>
                                    🚨 Make sure you invite students and
                                    instructors with email addresses that start
                                    with a Pennkey! For example:
                                    <b>agutmann@upenn.edu</b>. Students or
                                    instructors with alternative email address
                                    formats will not be able to log in to OHQ.
                                    🚨
                                </List.Item>
                            </List.List>
                        </List.Item>
                    </List.List>
                </List.Item>
                <List.Item>
                    If your course is <b>not</b> invite-only:
                    <List.List>
                        <List.Item>
                            Your students can join the course directly from
                            https://ohq.io/. When they log in, they can click
                            &apos;Dashboard&apos; on the left and click
                            &apos;Join Course&apos;. From this pop-up, they can
                            search your course, by name or by course code, and
                            join the course.
                        </List.Item>
                        <List.Item>
                            <CenteredImage
                                src="/invite-members-1.png"
                                alt="Invite me"
                            />
                        </List.Item>
                        <List.Item>
                            Your instructors must be invited to the course.
                            Follow the instructions above to invite instructors
                            via email.
                        </List.Item>
                    </List.List>
                </List.Item>
            </List>
        </Segment>
    </div>
);

export const CreateQueue = ({ ref }) => (
    <div ref={ref}>
        <Segment basic>
            <b>Create a Queue</b>
            <Divider />
            <p>
                Your instructors must be invited to the course. Follow the
                instructions above to invite instructors via email.
            </p>
            <p>
                After clicking into your course from the central
                &apos;Dashboard&apos; page, click &apos;Queues&apos; on the
                left. Then, click &apos;Create&apos;. Choose a name and
                description for your queue.
            </p>
        </Segment>
    </div>
);
