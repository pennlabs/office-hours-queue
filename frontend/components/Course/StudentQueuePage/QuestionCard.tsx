import React, { useState, useEffect } from "react";
import { Segment, Header, Button, Popup, Icon, Grid } from "semantic-ui-react";
import EditQuestionModal from "./EditQuestionModal";
import DeleteQuestionModal from "./DeleteQuestionModal";
import {
    Question,
    Course,
    Queue,
    mutateResourceListFunction,
} from "../../../types";

interface QuestionCardProps {
    question: Question;
    course: Course;
    queue: Queue;
    mutate: mutateResourceListFunction<Question>;
    toastFunc: (success: string, error: any) => void;
}
const QuestionCard = (props: QuestionCardProps) => {
    const question = props.question;
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);

    const timeString = (date) => {
        return new Date(date).toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
        });
    };

    return (
        <div style={{ marginTop: "10px" }}>
            <EditQuestionModal
                open={openEdit}
                course={props.course}
                question={question}
                setOpen={setOpenEdit}
                toastFunc={props.toastFunc}
                mutate={props.mutate}
            />
            <DeleteQuestionModal
                open={openDelete}
                queue={props.queue}
                question={question}
                setOpen={setOpenDelete}
                toastFunc={props.toastFunc}
                mutate={props.mutate}
            />
            <Segment attached="top" color="blue">
                <Grid>
                    <Grid.Row columns="equal">
                        <Grid.Column textAlign="left">
                            <Header
                                as="h5"
                                style={{
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                }}
                            >
                                {/* TODO: implement this */}
                                {"Position: #" + (question.questionsAhead + 1)}
                            </Header>
                        </Grid.Column>
                        <Grid.Column width={6}>
                            <Header as="h5" color="blue" textAlign="right">
                                Asked at {timeString(question.timeAsked)}
                            </Header>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
            <Segment attached tertiary={question.timeResponseStarted !== null}>
                {question.text}
            </Segment>
            <Segment attached="bottom" secondary>
                <Grid>
                    <Grid.Row columns="equal">
                        <Grid.Column textAlign="left">
                            <Header as="h5">
                                {!question.timeResponseStarted && (
                                    <Header.Content>
                                        <Button
                                            compact
                                            size="mini"
                                            color="red"
                                            content="Withdraw"
                                            onClick={() => setOpenDelete(true)}
                                        />
                                        <Button
                                            compact
                                            size="mini"
                                            color="green"
                                            content="Edit"
                                            onClick={() => setOpenEdit(true)}
                                        />
                                    </Header.Content>
                                )}
                            </Header>
                        </Grid.Column>
                        <Grid.Column
                            textAlign="right"
                            width={5}
                            style={{
                                fontSize: "10px",
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                            }}
                        >
                            {question.timeResponseStarted && (
                                <Popup
                                    wide
                                    trigger={<Icon name="sync" loading />}
                                    content={`Started by ${
                                        question.respondedToBy.firstName
                                    } ${
                                        question.respondedToBy.lastName
                                    } on ${timeString(
                                        question.timeResponseStarted
                                    )}`}
                                    basic
                                    inverted
                                    position="bottom right"
                                />
                            )}
                            {question.tags && question.tags.length > 0 && (
                                <Popup
                                    trigger={
                                        <span>
                                            {question.tags
                                                .map((tag) => " " + tag)
                                                .toString()}
                                        </span>
                                    }
                                    content={question.tags
                                        .map((tag) => " " + tag)
                                        .toString()}
                                    basic
                                    inverted
                                    position="bottom left"
                                />
                            )}
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
        </div>
    );
};

export default QuestionCard;
