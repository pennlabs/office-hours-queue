import React, { useState } from "react";
import { Segment, Label, Header, Grid, Message, Icon } from "semantic-ui-react";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import QuestionForm from "./QuestionForm";
import QuestionCard from "./QuestionCard";
import { Queue, Course, mutateResourceListFunction } from "../../../types";
import { useQuestions } from "../../../hooks/data-fetching/course";

interface StudentQueueProps {
    course: Course;
    queue: Queue;
    queueMutate: mutateResourceListFunction<Queue>;
}

const StudentQueue = (props: StudentQueueProps) => {
    const { course, queue, queueMutate } = props;
    const [toast, setToast] = useState({ message: "", success: true });
    const [toastOpen, setToastOpen] = useState(false);
    // TODO: initial props for this
    const [questions, , , mutateQuestions] = useQuestions(
        course.id,
        queue.id,
        queue.active ? 3000 : 0
    );
    const updateToast = (success: string, error) => {
        toast.success = success !== null;
        toast.message = success || errorMessage(error);
        setToast(toast);
        setToastOpen(true);
    };

    const errorMessage = (error) => {
        if (!error.message || error.message.split(",").length < 2)
            return "There was an error!";
        return error.message.split(":")[1];
    };

    return (
        <Segment basic>
            <Header as="h3">
                {queue.name}
                <Header.Subheader>{queue.description}</Header.Subheader>
            </Header>
            {(queue.active || queue.questionsAsked) && (
                <Label
                    content={`${queue.questionsAsked || 0} user${
                        queue.questionsAsked === 1 ? "" : "s"
                    } in queue`}
                    color="blue"
                    icon="users"
                />
            )}
            {(queue.active || queue.questionsActive) && (
                <Label
                    content={`${queue.questionsActive || 0} user${
                        queue.questionsActive === 1 ? "" : "s"
                    } currently being helped`}
                    icon="user"
                />
            )}

            {/* TODO: figure out estimated wait time */}
            <Label
                content={`${queue.estimatedWaitTime} mins`}
                color="blue"
                icon="clock"
            />

            {queue.active && (
                <Label
                    content={`${queue.staffActive || 0} staff active`}
                    icon={<Icon name="sync" loading={true} />}
                />
            )}
            <Grid.Row>
                {questions.length !== 0 && (
                    <QuestionCard
                        // TODO: this is probably safe but feels wrong
                        question={questions[0]}
                        course={course}
                        queue={queue}
                        queueMutate={queueMutate}
                        mutate={mutateQuestions}
                        toastFunc={updateToast}
                    />
                )}
                {!queue.active && questions.length === 0 && (
                    <Message
                        style={{ marginTop: "10px" }}
                        header="Queue Closed"
                        error
                        icon="calendar times outline"
                        content="This queue is currently closed. Contact course staff if you think this is an error."
                    />
                )}
                {queue.active && questions.length === 0 && (
                    <QuestionForm
                        course={course}
                        queueId={queue.id}
                        queueMutate={queueMutate}
                        mutate={mutateQuestions}
                        toastFunc={updateToast}
                    />
                )}
                {/* TODO: figure out this check */}
                {/* {queue.active &&
                    hasQuestion &&
                    questions.length === 0 && (
                        <Message
                            style={{ marginTop: "10px" }}
                            info
                            header="Question already in queue"
                            icon="comment alternate outline"
                            content="You already have asked a question in another queue"
                        />
                    )} */}
            </Grid.Row>
            <Snackbar
                open={toastOpen}
                autoHideDuration={6000}
                onClose={() => setToastOpen(false)}
            >
                <Alert
                    severity={toast.success ? "success" : "error"}
                    onClose={() => setToastOpen(false)}
                >
                    <span>{toast.message}</span>
                </Alert>
            </Snackbar>
        </Segment>
    );
};

export default StudentQueue;
