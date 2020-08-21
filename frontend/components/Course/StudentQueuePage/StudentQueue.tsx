import React, { useState } from "react";
import { Segment, Label, Header, Grid, Message, Icon } from "semantic-ui-react";
import QuestionForm from "./QuestionForm";
import QuestionCard from "./QuestionCard";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import { Queue, Course } from "../../../types";
import { useQuestions } from "../../../hooks/data-fetching/course";

interface StudentQueueProps {
    course: Course;
    queue: Queue;
}

const StudentQueue = (props: StudentQueueProps) => {
    const [toast, setToast] = useState({ message: "", success: true });
    const [toastOpen, setToastOpen] = useState(false);
    // TODO: initial props for this
    const [questions, error, isValidating, mutateQuestions] = useQuestions(
        props.course.id,
        props.queue.id,
        3000
    );
    const updateToast = (success: string, error) => {
        toast.success = success !== null;
        toast.message = success ? success : errorMessage(error);
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
                {props.queue.name}
                <Header.Subheader>{props.queue.description}</Header.Subheader>
            </Header>
            {(props.queue.active || props.queue.questionsAsked) && (
                <Label
                    content={
                        (props.queue.questionsAsked || 0) +
                        ` user${
                            props.queue.questionsAsked === 1 ? "" : "s"
                        } in queue`
                    }
                    color="blue"
                    icon="users"
                />
            )}
            {(props.queue.active || props.queue.questionsActive) && (
                <Label
                    content={
                        (props.queue.questionsActive || 0) +
                        ` user${
                            props.queue.questionsActive === 1 ? "" : "s"
                        } currently being helped`
                    }
                    icon="user"
                />
            )}

            {/* TODO: figure out estimated wait time */}
            <Label
                content={`${props.queue.estimatedWaitTime} mins`}
                color="blue"
                icon="clock"
            />

            {props.queue.active && (
                <Label
                    content={(props.queue.staffActive || 0) + ` staff active`}
                    icon={<Icon name={"sync"} loading={true} />}
                />
            )}
            <Grid.Row>
                {questions.length !== 0 && (
                    <QuestionCard
                        // TODO: this is probably safe but feels wrong
                        question={questions[0]}
                        course={props.course}
                        queue={props.queue}
                        mutate={mutateQuestions}
                        toastFunc={updateToast}
                    />
                )}
                {!props.queue.active && questions.length === 0 && (
                    <Message
                        style={{ marginTop: "10px" }}
                        header="Queue Closed"
                        error
                        icon="calendar times outline"
                        content="This queue is currently closed. Contact course staff if you think this is an error."
                    />
                )}
                {props.queue.active && questions.length === 0 && (
                    <QuestionForm
                        course={props.course}
                        queueId={props.queue.id}
                        mutate={mutateQuestions}
                        toastFunc={updateToast}
                    />
                )}
                {/* TODO: figure out this check */}
                {props.queue.active &&
                    props.hasQuestion &&
                    questions.length === 0 && (
                        <Message
                            style={{ marginTop: "10px" }}
                            info
                            header="Question already in queue"
                            icon="comment alternate outline"
                            content="You already have asked a question in another queue"
                        />
                    )}
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
