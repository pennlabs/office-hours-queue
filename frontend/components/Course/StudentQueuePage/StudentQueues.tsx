import React from "react";
import { Segment, Grid, Message } from "semantic-ui-react";
import StudentQueue from "./StudentQueue";
// import LastQuestionCard from "./LastQuestionCard";
import { Queue, Course, mutateResourceListFunction } from "../../../types";

interface StudentQueuesProps {
    queues: Queue[];
    course: Course;
    queueMutate: mutateResourceListFunction<Queue>;
}
const StudentQueues = (props: StudentQueuesProps) => {
    const { queues, course, queueMutate } = props;
    // const showQuestion = (question) => {
    //     return question.state === "ACTIVE" || question.state === "STARTED";
    // };

    return (
        <>
            {queues && (
                <Grid.Row columns="equal" stackable>
                    {queues.length !== 0 &&
                        queues.map((queue) => (
                            <Grid.Column>
                                <StudentQueue
                                    key={queue.id}
                                    course={course}
                                    queue={queue}
                                    queueMutate={queueMutate}
                                />
                            </Grid.Column>
                        ))}
                    {queues.length === 0 && (
                        <Grid.Column>
                            <Segment basic>
                                <Message info>
                                    <Message.Header>No Queues</Message.Header>
                                    This course currently has no queues!
                                </Message>
                            </Segment>
                        </Grid.Column>
                    )}
                </Grid.Row>
            )}
            {/* // TODO: replace this with a user-level canAskQuestions check */}
            {/* <Grid.Row columns={1}>
                {question && !showQuestion(question) && (
                    <Grid.Column>
                        <LastQuestionCard question={question} />
                    </Grid.Column>
                )}
            </Grid.Row> */}
        </>
    );
};

export default StudentQueues;
