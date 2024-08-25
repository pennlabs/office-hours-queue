import { Segment, List } from "semantic-ui-react";

import { CenteredImage } from "./utils";

export const EnrollCourse = ({ ref }) => (
    <div ref={ref}>
        <Segment basic>
            <h3>Enrolling in a Course</h3>
            <p>Courses on OHQ are either invite-only or not invite-only.</p>
            <p>
                If your course is invite-only, reach out to your course&apos;s
                teaching team to request an invitation. All they need to invite
                you is a Penn email address that starts with a Pennkey (e.g.
                <i>agutmann@upenn.edu</i>).
            </p>
            <List>
                <List.Item>
                    If your course is not invite-only, follow the steps below to
                    join the course.
                </List.Item>
                <List.Item>
                    <ul>
                        <li>
                            From the dashboard, click the green &quot;Join
                            Course&quot; option under &quot;Student
                            Courses:&quot;
                            <CenteredImage
                                src="/join-course-1.png"
                                alt="Joining a course"
                            />
                        </li>
                        <li>
                            Search for the course you want to join. Click on the
                            course, and click the blue &quot;Join&quot; button.
                            <CenteredImage
                                src="/join-course-2.png"
                                alt="Joining a course modal"
                            />
                        </li>
                    </ul>
                </List.Item>
            </List>
            <p>
                Nicely done! 👏 Now you&apos;ve joined the course, and
                you&apos;re ready to join its office hours!
            </p>
        </Segment>
    </div>
);

export const Calendar = ({ ref }) => (
    <div ref={ref}>
        <Segment basic>
            <h3>Viewing your Calendar</h3>
            <p>
                Your instructor may have placed your office hours on the course
                calendar. You can view the calendar either on the sidebar on the
                Dashboard (on desktop ony) or the Calendar page linked on the
                navbar. You can also see additional information such as event
                location by clicking on the event card.
            </p>
            <p>
                You can filter the courses that you see events for by visiting
                the Calendar page and selecting only the courses you are
                interested in.
            </p>
            <p>
                Note that the Calendar uses your local time as its time zone
                (not Penn time).
            </p>
        </Segment>
    </div>
);

export const Notifications = ({ ref }) => (
    <div ref={ref}>
        <Segment basic>
            <h3>Setting Up Notifications</h3>
            <p>
                Make sure you&apos;re ready to talk to the instructor by
                enabling notifications when you reach the top of the line!
            </p>
            <p>
                OHQ will give you an audio notification ( you&apos;ll hear a
                &quot;ding&quot;) when you reach the top of the queue. You can
                also enable SMS notifications.
            </p>
            <p>To enable SMS notifications:</p>
            <List bulleted>
                <List.Item>
                    Navigate to the OHQ home page, and on the left menu, click
                    into &quot;Account Settings.&quot;
                </List.Item>
                <List.Item>
                    Check the &quot;Enable SMS Notifications&quot; box, fill in
                    your cell phone number, and click &quot;Save.&quot;
                </List.Item>

                <List.Item>
                    Verify your phone number with an SMS verification code
                    that&apos;ll be sent to you.
                </List.Item>
            </List>
            <CenteredImage
                src="/notifications-1.png"
                alt="Setting Notifications"
            />
            <p>
                Verify your phone number with an SMS verification code
                that&apos;ll be sent to you.
            </p>
            <p>
                🔕 Getting too many notifications? You can turn notifications on
                or off by course! To turn notifications on or off for a
                particular course, click into that course. Then, in the upper
                right-hand corner of your screen, click on the bell to toggle
                your notifications on or off.
            </p>
        </Segment>
    </div>
);

export const JoiningOfficeHours = ({ ref }) => (
    <div ref={ref}>
        <Segment basic>
            <h3>Joining Office Hours</h3>
            <p>
                Once you click into your course, you can see if there are any
                queues open. If there is:
            </p>
            <List bulleted>
                <List.Item>
                    Put a brief description of your question in the
                    &apos;Question&apos; box.
                </List.Item>
                <List.Item>
                    Create a Zoom meeting and link it in the &apos;Video Chat
                    URL&apos; box
                </List.Item>
            </List>
            <CenteredImage src="/joining-oh-1.png" alt="Joining office hours" />
            <p>
                You&apos;re all set! A TA will see your question and join your
                Zoom meeting once it&apos;s your turn.
            </p>
        </Segment>
    </div>
);

export const WhileInQueue = ({ ref }) => (
    <div ref={ref}>
        <Segment basic>
            <h3>While in Queue...</h3>
            <List bulleted>
                <List.Item>
                    While in the queue, you can see your position in the queue,
                    as well as far you are in line!
                </List.Item>
                <List.Item>
                    To edit your question, you can click the green
                    &quot;Edit&quot; button and update your question. You
                    won&apos;t lose your place in line!
                </List.Item>
                <List.Item>
                    To delete your question, click on the red
                    &quot;Withdraw&quot; button. You&apos;ll be automatically
                    removed from the queue.
                </List.Item>
                <CenteredImage
                    src="/while-in-queue-1.png"
                    alt="Waiting in queue"
                />
            </List>
        </Segment>
    </div>
);

export const Settings = ({ ref }) => (
    <div ref={ref}>
        <Segment basic>
            <h3>Settings</h3>
            <p>
                To change your profile information and notification settings, go
                to the OHQ landing page and click &apos;Account Setting&apos; in
                the left menu.
            </p>
        </Segment>
    </div>
);
