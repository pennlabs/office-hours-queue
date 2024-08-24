import { Segment, Divider, List } from "semantic-ui-react";

import { CenteredImage } from "./utils";

export const CreateCourse = ({ ref }) => (
    <div ref={ref}>
        <Segment basic>
            <h3>Create Your Course</h3>
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
            <h3>Invite Students and Instructors</h3>
            <Divider />
            <p>
                Now that you&apos;ve created the course, you need to help your
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
            <h3>Create a Queue</h3>
            <Divider />
            <p>
                Your instructors must be invited to the course. Follow the
                instructions above to invite instructors via email.
            </p>
            <List>
                <List.Item>
                    After clicking into your course from the central
                    &apos;Dashboard&apos; page, click &apos;Queues&apos; on the
                    left. Then, click &apos;Create&apos;. Choose a name and
                    description for your queue.
                    <List.List>
                        <List.Item>
                            🤔 Not sure what to name your queue?
                        </List.Item>
                        <List.Item>
                            Here are queue names we&apos;ve seen from some
                            current courses:
                            <ul>
                                <li>Professor Office Hours</li>
                                <li>TA Office Hours</li>
                                <li>Quick Questions Queue</li>
                                <li>Conceptual Questions</li>
                                <li>Homework Questions</li>
                            </ul>
                        </List.Item>
                    </List.List>
                </List.Item>
            </List>
            <p>
                You can change the name and description of the queue at any
                time.
            </p>
            <p>
                Once you&apos;ve created the queue, you are ready to open the
                queue and start holding office hours! 🙌
            </p>
        </Segment>
    </div>
);

export const Calendar = ({ ref }) => (
    <div ref={ref}>
        <Segment basic>
            <h3>Editing a Course Calendar</h3>
            <p>
                You can add events to your course calendar by visiting the
                Calendar page on the Course page sidebar. Simply drag on the
                Calendar to indicate the time of the event and fill in any
                relevant information. You can only edit the course calendar via
                the Calendar page reached from the course home page (the
                instructor view).The Calendar linked from the dashboard is a
                read-only view of all courses you are enrolled in (i.e. the
                student view).
            </p>
            <p>
                If the event is recurring, select so and make sure to indicate
                the end date of the event! If you need to edit the event after
                the fact, you can select whether to edit every event of the
                recurrence or only the selected one (e.g. if a room changed).
                You can also cancel a single occurrence of the evnet.
            </p>
            <p>
                Note that the Calendar uses your local time as its time zone
                (not Penn time).
            </p>
        </Segment>
    </div>
);

export const HoldOfficeHours = ({ ref }) => (
    <div ref={ref}>
        <Segment basic>
            <h3>Hold Office Hours</h3>
            <h5>Opening the Queue</h5>
            <Divider />
            <p>
                To start your office hours, open the queue to students by
                clicking &apos;Open&apos;.
            </p>
            <CenteredImage
                src="/open-queue-1.png"
                alt="Before opening any queues."
            />
            <p style={{ color: "grey", textAlign: "center" }}>
                Before opening any queues.
            </p>
            <CenteredImage
                src="/open-queue-2.png"
                alt="After opening both queues"
            />
            <p style={{ color: "grey", textAlign: "center" }}>
                After opening both queues.
            </p>
            <p>Now students will be able to join the queue!🖥️</p>
            <br />
            <h5>Answering Questions</h5>
            <Divider />
            <p>
                When students join the queue, you will see their names appear
                along with a short description of their question or problem.
                Click &apos;Answer&apos; to join the student&apos;s call. Any
                instructor can answer a question, and multiple instructors can
                join a student&apos;s call if needed.
            </p>
            <CenteredImage
                src="/answer-queue-1.png"
                alt="Before opening any queues."
            />
            <br />
            <h5>Putting Students Back in the Queue</h5>
            <Divider />
            <p>
                If you want to another instructor to answer the question, click
                &apos;Undo&apos; to put the question back at the top of the
                queue.
            </p>
            <CenteredImage
                src="/put-queue-1.png"
                alt="Before opening any queues."
            />
            <br />
            <h5>Removing Students from the Queue</h5>
            <Divider />
            <p>
                Once you&apos;ve finished helping a student, click
                &apos;Finish&apos; to remove them from the queue. Students can
                also click &apos;Finish&apos; to remove themselves from the
                queue.
            </p>
            <p>
                If you are unable to reach a student via their meeting link, you
                can remove them from the queue and leave them a message.
            </p>
            <CenteredImage
                src="/remove-queue-1.png"
                alt="Before opening any queues."
            />
            <p style={{ color: "grey", textAlign: "center" }}>
                The options you will see when you click &apos;Reject&apos;.
            </p>
            <br />
            <h5>Closing the Queue</h5>
            <Divider />
            <p>
                To close the queue, click &apos;Close&apos;. Closing the queue
                will prevent students from joining the queue, but it will not
                remove students already in the queue.
            </p>
            <p>
                To remove all of the students currently on the queue, click
                &apos;Clear&apos; after closing the queue.
            </p>
            <p>Now your office hours are over. Nicely done! 🎉</p>
        </Segment>
    </div>
);

export const Analytics = ({ ref }) => (
    <div ref={ref}>
        <Segment basic>
            <h3>Analytics</h3>
            <Divider />
            <p>
                As an instructor, you can use OHQ&apos;s analytics to learn what
                your students are asking and assess how you&apos;re performing
                in office hours.
            </p>
            <p>
                As a head TA or professor, analytics can help you predict demand
                and identify problem spots, helping you schedule office hours
                and assign TAs to match demand more effectively.
            </p>
            <p>
                From your course, click &apos;Analytics&apos; on the left. From
                here, you can see see both aggregate statistics and heat maps of
                the most busy office hours sessions.
            </p>
        </Segment>
    </div>
);

export const Settings = ({ ref }) => (
    <div ref={ref}>
        <Segment basic>
            <h3>Settings</h3>
            <Divider />
            <p>
                To change the settings of a queue, navigate to the queue and
                click the &apos;Edit&apos; button.
            </p>
            <p>
                To change the settings of a course, navigate to the course and
                click &apos;Course Settings&apos; in the left menu.
            </p>
            <p>
                To change your account settings, go to the OHQ landing page and
                click &apos;Account Settings&apos; in the left menu.
            </p>
        </Segment>
    </div>
);
