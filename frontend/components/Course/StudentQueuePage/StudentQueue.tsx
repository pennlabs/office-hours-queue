import React, { useState } from "react";
import {
    Segment,
    Label,
    Header,
    Grid,
    Message,
    Icon,
    Dimmer,
    Loader,
} from "semantic-ui-react";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import QuestionForm from "./QuestionForm";
import QuestionCard from "./QuestionCard";
import {
    Queue,
    Course,
    mutateResourceListFunction,
    Question,
} from "../../../types";
import {
    useQuestions,
    useLastQuestions,
} from "../../../hooks/data-fetching/course";
import LastQuestionCard from "./LastQuestionCard";

interface StudentQueueProps {
    course: Course;
    queue: Queue;
    queueMutate: mutateResourceListFunction<Queue>;
    questions: Question[];
}

const StudentQueue = (props: StudentQueueProps) => {
    const { course, queue, queueMutate, questions: rawQuestions } = props;
    const [toast, setToast] = useState({ message: "", success: true });
    const [toastOpen, setToastOpen] = useState(false);

    const [questions, , , mutateQuestions] = useQuestions(
        course.id,
        queue.id,
        rawQuestions,
        queue.active ? 3000 : 0
    );
    const [lastQuestions, , , mutateLastQuestions] = useLastQuestions(
        course.id,
        queue.id,
        queue.active ? 3000 : 0
    );

    if (!questions) {
        return (
            <Dimmer
                style={{ marginTop: "3rem" }}
                active
                inverted
                inline="centered"
            >
                <Loader size="big" inverted />
            </Dimmer>
        );
    }

    const updateToast = (success: string | null, error) => {
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

            {(queue.active || queue.questionsAsked) &&
                queue.estimatedWaitTime !== -1 && (
                    <Label
                        content={`${queue.estimatedWaitTime} min${
                            queue.estimatedWaitTime === 1 ? "" : "s"
                        }`}
                        color="blue"
                        icon="clock"
                    />
                )}
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
                        lastQuestionsMutate={mutateLastQuestions}
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
                {lastQuestions && lastQuestions.length !== 0 && (
                    <Grid.Row columns={1}>
                        <Grid.Column>
                            <LastQuestionCard question={lastQuestions[0]} />
                        </Grid.Column>
                    </Grid.Row>
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
