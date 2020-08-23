import React from "react";
import { Grid } from "semantic-ui-react";
import { NextPageContext } from "next";
import CourseWrapper from "../../../components/Course/CourseWrapper";
import { withAuth } from "../../../context/auth";
import { doApiRequest } from "../../../utils/fetch";
import { isLeadershipRole } from "../../../utils/enums";
import {
    CoursePageProps,
    Queue,
    Course,
    Membership,
    Question,
    QuestionMap,
} from "../../../types";
import InstructorQueuePage from "../../../components/Course/InstructorQueuePage/InstructorQueuePage";
import StudentQueuePage from "../../../components/Course/StudentQueuePage/StudentQueuePage";

interface QueuePageProps extends CoursePageProps {
    queues: Queue[];
    questionmap: QuestionMap;
}

const QueuePage = (props: QueuePageProps) => {
    const { course, leadership, queues, questionmap } = props;
    return (
        <Grid columns="equal" divided style={{ width: "100%" }} stackable>
            <CourseWrapper
                course={course}
                leadership={leadership}
                render={(staff: boolean) => {
                    return (
                        <>
                            {staff && (
                                <InstructorQueuePage
                                    courseId={course.id}
                                    queues={queues}
                                    questionmap={questionmap}
                                />
                            )}
                            {!staff && (
                                <StudentQueuePage
                                    course={course}
                                    queues={queues}
                                    questionmap={questionmap}
                                />
                            )}
                        </>
                    );
                }}
            />
        </Grid>
    );
};

QueuePage.getInitialProps = async (
    context: NextPageContext
): Promise<QueuePageProps> => {
    const { query, req } = context;
    const data = {
        headers: req ? { cookie: req.headers.cookie } : undefined,
    };
    const [course, leadership, queues]: [
        Course,
        Membership[],
        Queue[]
    ] = await Promise.all([
        doApiRequest(`/courses/${query.course}/`, data).then((res) =>
            res.json()
        ),
        doApiRequest(`/courses/${query.course}/members/`, data).then((res) =>
            res.json()
        ),
        doApiRequest(`/courses/${query.course}/queues/`, data).then((res) =>
            res.json()
        ),
    ]);
    // Generate a new questions object that's a map from queue id to a
    // list of questions in the queue. The API calls are wrapped in a
    // Promise.all to ensure those calls are made simultaneously
    const rawQuestions: Question[][] = await Promise.all(
        queues.map((queue) =>
            doApiRequest(
                `/courses/${query.course}/queues/${queue.id}/questions/`,
                data
            ).then((res) => res.json())
        )
    );
    const questionmap: QuestionMap = rawQuestions
        .map((questions, index) => ({
            [queues[index].id]: questions,
        }))
        .reduce((map, questions) => ({ ...map, ...questions }));

    return {
        course,
        leadership: leadership.filter((m) => isLeadershipRole(m.kind)),
        queues,
        questionmap,
    };
};
export default withAuth(QueuePage);
