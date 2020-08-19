import React, { useState } from "react";
import {
    Segment,
    Label,
    Header,
    Grid,
    Message,
    Popup,
    Icon,
} from "semantic-ui-react";
import { linkifyComponentDecorator } from "../../../utils";
import QuestionForm from "./QuestionForm";
import QuestionCard from "./QuestionCard";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import { Queue } from "../../../types";
// import Linkify from 'react-linkify';

interface StudentQueueProps {
    courseId: number;
    queue: Queue;
}

const StudentQueue = (props: StudentQueueProps) => {
    const [toast, setToast] = useState({ message: "", success: true });
    const [toastOpen, setToastOpen] = useState(false);

    const updateToast = (success, error) => {
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
    console.log(props.queue);
    return (
        <Segment basic>
            <Header as="h3">
                {props.queue.name}
                <Header.Subheader>
                    {/* <Linkify componentDecorator={linkifyComponentDecorator}> */}
                    {props.queue.description}
                    {/* </Linkify> */}
                </Header.Subheader>
            </Header>
            {(props.queue.active || props.queue.questionsAsked !== 0) && (
                <Label
                    content={
                        props.queue.questionsAsked +
                        ` user${
                            props.queue.questionsAsked === 1 ? "" : "s"
                        } in queue`
                    }
                    color="blue"
                    icon="users"
                />
            )}
            {(props.queue.active || props.queue.questionsActive) !== 0 && (
                <Label
                    content={
                        props.queue.questionsActive +
                        ` user${
                            props.queue.questionsActive === 1 ? "" : "s"
                        } currently being helped`
                    }
                    icon="user"
                />
            )}
            {/*
          <Label content={ `${props.queue.estimatedWaitTime} mins`} color="blue" icon="clock"/>
        */}
            {props.queue.active && (
                <Popup
                    trigger={
                        <Label
                            content={props.queue.staffActive + ` staff active`}
                            icon={<Icon name={"sync"} loading={true} />}
                        />
                    }
                    content={
                        "People"
                        // props.queue.activeStaff
                        // .map((courseUser) => courseUser.user.fullName)
                        // .sort()
                        // .join(", ")
                    }
                    on={"hover"}
                    disabled={props.queue.staffActive === 0}
                    position={"top center"}
                />
            )}
            <Grid.Row>
                {props.hasQuestion && props.question && (
                    <QuestionCard
                        question={props.question}
                        queue={props.queue}
                        refetch={props.refetch}
                        toastFunc={updateToast}
                    />
                )}
                {!props.queue.active && !props.question && (
                    <Message
                        style={{ marginTop: "10px" }}
                        header="Queue Closed"
                        error
                        icon="calendar times outline"
                        content="This queue is currently closed. Contact course staff if you think this is an error."
                    />
                )}
                {props.queue.active && !props.hasQuestion && (
                    <QuestionForm
                        courseId={props.courseId}
                        queue={props.queue}
                        refetch={props.refetch}
                        toastFunc={updateToast}
                    />
                )}
                {props.queue.active && props.hasQuestion && !props.question && (
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
