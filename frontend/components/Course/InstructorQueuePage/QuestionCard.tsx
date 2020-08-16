import React, { useState, useEffect, useContext } from "react";
import { Segment, Header, Icon, Button, Popup, Grid } from "semantic-ui-react";
import moment from "moment";
import RejectQuestionModal from "./RejectQuestionModal";
import firebase from "../../Firebase";
import { globalIdEquals } from "../../../utils";
import { AuthUserContext } from "../../../context/auth";

// const START_QUESTION = gql`
//   mutation StartQuestion($input: StartQuestionInput!) {
//     startQuestion(input: $input) {
//       question {
//         id
//       }
//     }
//   }
// `;

// const FINISH_QUESTION = gql`
//   mutation FinishQuestion($input: FinishQuestionInput!) {
//     finishQuestion(input: $input) {
//       question {
//         id
//       }
//     }
//   }
// `;

// const UNDO_START_QUESTION = gql`
//   mutation UndoStartQuestion($input: UndoStartQuestionInput!) {
//     undoStartQuestion(input: $input) {
//       question {
//         id
//       }
//     }
//   }
// `;

const QuestionCard = props => {
    const { user } = useContext(AuthUserContext);

    const [open, setOpen] = useState(false);
    const [render, setRender] = useState(false);
    const [startQuestion, startQuestionRes] = useMutation(START_QUESTION);
    const [finishQuestion, finishQuestionRes] = useMutation(FINISH_QUESTION);
    const [undoStartQuestion, undoStartQuestionRes] = useMutation(
        UNDO_START_QUESTION
    );

    useEffect(() => {
        // Re-render timestamp every 5 seconds
        const interval = setInterval(() => {
            setRender(!render);
        }, 5000);
        return () => clearInterval(interval);
    }, [render]);

    const timeString = (date, isLong) => {
        if (isLong)
            return new Date(date).toLocaleString("en-US", {
                dateStyle: "short",
                timeStyle: "short",
            });
        else
            return new Date(date).toLocaleString("en-US", {
                hour: "numeric",
                minute: "numeric",
            });
    };

    const triggerModal = () => {
        setOpen(!open);
    };

    const onAnswer = async () => {
        await startQuestion({
            variables: {
                input: {
                    questionId: props.question.id,
                },
            },
        });
        firebase.analytics.logEvent("question_started");
        props.refetch();
    };

    const onFinish = async () => {
        await finishQuestion({
            variables: {
                input: {
                    questionId: props.question.id,
                },
            },
        });
        firebase.analytics.logEvent("question_finished");
        props.refetch();
    };

    const onUndo = async () => {
        await undoStartQuestion({
            variables: {
                input: {
                    questionId: props.question.id,
                },
            },
        });
        firebase.analytics.logEvent("question_undo");
        props.refetch();
    };

    const isLoading = () => {
        return (
            (startQuestionRes && startQuestionRes.loading) ||
            (finishQuestionRes && finishQuestionRes.loading) ||
            (undoStartQuestionRes && undoStartQuestionRes.loading)
        );
    };

    return (
        props.question && (
            <div style={{ marginTop: "10px" }}>
                <RejectQuestionModal
                    open={open}
                    question={props.question}
                    closeFunc={triggerModal}
                    refetch={props.refetch}
                />
                <Segment attached="top" color="blue" clearing>
                    <Grid columns="equal">
                        <Grid.Row>
                            <Grid.Column textAlign="left">
                                <Header
                                    as="h5"
                                    style={{
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                    }}
                                >
                                    <Popup
                                        trigger={
                                            <span>
                                                {
                                                    props.question.askedBy
                                                        .preferredName
                                                }
                                            </span>
                                        }
                                        content={
                                            props.question.askedBy.fullName +
                                            " (" +
                                            props.question.askedBy.email +
                                            ")"
                                        }
                                        basic
                                        inverted
                                        position="right center"
                                    />
                                </Header>
                            </Grid.Column>
                            <Grid.Column>
                                <Header as="h5" color="blue" textAlign="right">
                                    <Popup
                                        trigger={
                                            props.question.timeStarted ===
                                            null ? (
                                                <span>
                                                    Asked{" "}
                                                    {moment
                                                        .duration(
                                                            moment().diff(
                                                                moment(
                                                                    props
                                                                        .question
                                                                        .timeAsked
                                                                )
                                                            )
                                                        )
                                                        .humanize()}{" "}
                                                    ago
                                                </span>
                                            ) : (
                                                <span>
                                                    Started{" "}
                                                    {moment
                                                        .duration(
                                                            moment().diff(
                                                                moment(
                                                                    props
                                                                        .question
                                                                        .timeStarted
                                                                )
                                                            )
                                                        )
                                                        .humanize()}{" "}
                                                    ago
                                                </span>
                                            )
                                        }
                                        content={timeString(
                                            props.question.timeAsked,
                                            false
                                        )}
                                        basic
                                        inverted
                                        position="left center"
                                    />
                                </Header>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
                <Segment
                    attached
                    tertiary={props.question.timeStarted !== null}
                >
                    {props.question.text}
                </Segment>
                <Segment attached="bottom" secondary textAlign="right">
                    <Grid>
                        <Grid.Row columns="equal">
                            <Grid.Column textAlign="left">
                                <Header as="h5">
                                    {!props.question.timeStarted && (
                                        <Header.Content>
                                            <Button
                                                compact
                                                size="mini"
                                                color="red"
                                                content="Reject"
                                                disabled={isLoading()}
                                                onClick={triggerModal}
                                            />
                                            <Button
                                                compact
                                                size="mini"
                                                color="green"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                href={
                                                    props.question.videoChatUrl
                                                        ? props.question
                                                              .videoChatUrl
                                                        : null
                                                }
                                                icon={
                                                    props.question.videoChatUrl
                                                        ? "video"
                                                        : null
                                                }
                                                content="Answer"
                                                onClick={onAnswer}
                                                disabled={isLoading()}
                                                loading={
                                                    startQuestionRes &&
                                                    startQuestionRes.loading
                                                }
                                            />
                                        </Header.Content>
                                    )}
                                    {props.question.timeStarted &&
                                        globalIdEquals(
                                            props.question.answeredBy.id,
                                            user.id
                                        ) && (
                                            <Header.Content>
                                                <Button
                                                    compact
                                                    size="mini"
                                                    color="red"
                                                    content="Undo"
                                                    disabled={isLoading()}
                                                    onClick={onUndo}
                                                    loading={
                                                        undoStartQuestionRes &&
                                                        undoStartQuestionRes.loading
                                                    }
                                                />
                                            </Header.Content>
                                        )}
                                    {props.question.timeStarted &&
                                        globalIdEquals(
                                            props.question.answeredBy.id,
                                            props.userId
                                        ) && (
                                            <Header.Content>
                                                <Button
                                                    compact
                                                    size="mini"
                                                    color="green"
                                                    content="Finish"
                                                    disabled={isLoading()}
                                                    onClick={onFinish}
                                                    loading={
                                                        finishQuestionRes &&
                                                        finishQuestionRes.loading
                                                    }
                                                />
                                            </Header.Content>
                                        )}
                                    {props.question.timeStarted &&
                                        props.question.videoChatUrl && (
                                            <a
                                                href={
                                                    props.question.videoChatUrl
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Button
                                                    compact
                                                    size="mini"
                                                    color="blue"
                                                    content={
                                                        globalIdEquals(
                                                            props.question
                                                                .answeredBy.id,
                                                            props.userId
                                                        )
                                                            ? "Rejoin Call"
                                                            : `Join Call (with ${props.question.answeredBy.preferredName})`
                                                    }
                                                    disabled={isLoading()}
                                                />
                                            </a>
                                        )}
                                </Header>
                            </Grid.Column>
                            <Grid.Column
                                width={5}
                                textAlign="right"
                                only="computer mobile"
                                style={{
                                    fontSize: "10px",
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                }}
                            >
                                {props.question.timeStarted && (
                                    <Popup
                                        wide
                                        trigger={<Icon name="sync" loading />}
                                        content={`Started by ${
                                            props.question.answeredBy
                                                .preferredName
                                        } on ${timeString(
                                            props.question.timeStarted,
                                            true
                                        )}`}
                                        basic
                                        inverted
                                        position="bottom right"
                                    />
                                )}
                                {props.question.tags &&
                                    props.question.tags.length > 0 && (
                                        <Popup
                                            trigger={
                                                <span>
                                                    {props.question.tags
                                                        .map(tag => " " + tag)
                                                        .toString()}
                                                </span>
                                            }
                                            content={props.question.tags
                                                .map(tag => " " + tag)
                                                .toString()}
                                            basic
                                            inverted
                                            position="bottom left"
                                        />
                                    )}
                                {(!props.question.tags ||
                                    props.question.tags.length === 0) && (
                                    <span style={{ paddingLeft: "8px" }}>
                                        <i>No Tags</i>
                                    </span>
                                )}
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
            </div>
        )
    );
};

export default QuestionCard;
