import React from "react";
import { Segment, Grid, Message } from "semantic-ui-react";
import StudentQueue from "./StudentQueue";
import LastQuestionCard from "./LastQuestionCard";
import { Queue, Course } from "../../../types";

interface StudentQueuesProps {
    queues: Queue[];
    course: Course;
}
const StudentQueues = (props: StudentQueuesProps) => {
    const showQuestion = (question) => {
        return question.state === "ACTIVE" || question.state === "STARTED";
    };

    return (
        <>
            {props.queues && (
                <Grid.Row columns="equal" stackable>
                    {props.queues.length !== 0 &&
                        props.queues.map((queue) => (
                            <Grid.Column>
                                <StudentQueue
                                    key={queue.id}
                                    course={props.course}
                                    queue={queue}
                                />
                            </Grid.Column>
                        ))}
                    {props.queues.length === 0 && (
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
            <Grid.Row columns={1}>
                {props.question && !showQuestion(props.question) && (
                    <Grid.Column>
                        <LastQuestionCard question={props.question} />
                    </Grid.Column>
                )}
            </Grid.Row>
            ,
        </>
    );
};

export default StudentQueues;
