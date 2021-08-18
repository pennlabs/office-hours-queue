import React from "react";
import Head from "next/head";
import { Grid } from "semantic-ui-react";
import { WebsocketProvider } from "@pennlabs/rest-live-hooks";
import { GetServerSidePropsContext } from "next";
import CourseWrapper from "../../../components/Course/CourseWrapper";
import { doMultipleSuccessRequests, doApiRequest } from "../../../utils/fetch";
import { withAuth, withAuthComponent } from "../../../utils/auth";
import { isLeadershipRole } from "../../../utils/enums";
import nextRedirect from "../../../utils/redirect";
import {
    Announcement,
    CoursePageProps,
    Queue,
    Course,
    Tag,
    Membership,
    Question,
    QuestionMap,
    NotificationProps,
} from "../../../types";
import InstructorQueuePage from "../../../components/Course/InstructorQueuePage/InstructorQueuePage";
import StudentQueuePage from "../../../components/Course/StudentQueuePage/StudentQueuePage";

interface QueuePageProps extends CoursePageProps {
    queues: Queue[];
    questionmap: QuestionMap;
    tags: Tag[];
    announcements: Announcement[];
}

const QueuePage = (props: QueuePageProps) => {
    const {
        course,
        leadership,
        queues,
        questionmap,
        tags,
        announcements,
    } = props;
    return (
        <WebsocketProvider
            url="/api/ws/subscribe/"
            findOrigin={
                process.env.NODE_ENV === "development"
                    ? () => "ws://localhost:8000"
                    : undefined
            }
        >
            <Head>
                <title>{`OHQ | ${course.department} ${course.courseCode}`}</title>
            </Head>
            <Grid columns="equal" divided style={{ width: "100%" }} stackable>
                <CourseWrapper
                    course={course}
                    leadership={leadership}
                    notificationUI={true}
                    render={(
                        staff: boolean,
                        play: NotificationProps,
                        notifs: boolean,
                        setNotifs: (status: boolean) => void
                    ) => {
                        return (
                            <div>
                                {staff && (
                                    <InstructorQueuePage
                                        announcements={announcements}
                                        courseId={course.id}
                                        queues={queues}
                                        questionmap={questionmap}
                                        play={play}
                                        notifs={notifs}
                                        setNotifs={setNotifs}
                                        tags={tags}
                                    />
                                )}
                                {!staff && (
                                    <StudentQueuePage
                                        announcements={announcements}
                                        course={course}
                                        queues={queues}
                                        questionmap={questionmap}
                                        play={play}
                                        tags={tags}
                                    />
                                )}
                            </div>
                        );
                    }}
                />
            </Grid>
        </WebsocketProvider>
    );
};

async function getServerSidePropsInner(context: GetServerSidePropsContext) {
    const { query, req } = context;
    const data = {
        headers: req ? { cookie: req.headers.cookie } : undefined,
    };

    let course: Course;
    let leadership: Membership[];
    let queues: Queue[];
    let tags: Tag[];
    let announcements: Announcement[];

    const response = await doMultipleSuccessRequests([
        { path: `/api/courses/${query.course}/`, data },
        { path: `/api/courses/${query.course}/members/`, data },
        { path: `/api/courses/${query.course}/queues/`, data },
        { path: `/api/courses/${query.course}/tags/`, data },
        { path: `/api/courses/${query.course}/announcements/`, data },
    ]);

    if (response.success) {
        [course, leadership, queues, tags, announcements] = response.data;
        if (course.archived) {
            nextRedirect(
                context,
                () => true,
                `/courses/${query.course}/roster`
            );
        }
    } else {
        return {
            redirect: {
                destination: `/?signup=${query.course}`,
                permanent: false,
            },
        };
    }

    // Generate a new questions object that's a map from queue id to a
    // list of questions in the queue. The API calls are wrapped in a
    // Promise.all to ensure those calls are made simultaneously
    const rawQuestions: Question[][] = await Promise.all(
        queues.map((queue) =>
            doApiRequest(
                `/api/courses/${query.course}/queues/${queue.id}/questions/`,
                data
            ).then((res) => res.json())
        )
    );
    const questionmap: QuestionMap = rawQuestions
        .map((questions, index) => ({
            [queues[index].id]: questions,
        }))
        .reduce((map, questions) => ({ ...map, ...questions }), {});

    return {
        props: {
            course,
            leadership: leadership.filter((m) => isLeadershipRole(m.kind)),
            queues,
            questionmap,
            tags,
            announcements,
        },
    };
}

export const getServerSideProps = withAuth(getServerSidePropsInner);

export default withAuthComponent(QueuePage);
