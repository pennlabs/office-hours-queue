import React, { useContext, useEffect, useState } from "react";
import {
    Button,
    Grid,
    Header,
    Icon,
    Message,
    Popup,
    Segment,
} from "semantic-ui-react";
import moment from "moment";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import RejectQuestionModal from "./RejectQuestionModal";
import { AuthUserContext } from "../../../utils/auth";
import { Question, QuestionStatus, User } from "../../../types";
import MessageQuestionModal from "./MessageQuestionModal";

export const fullName = (user: User) => `${user.firstName} ${user.lastName}`;

interface QuestionCardProps {
    question: Question;
    mutate: mutateResourceListFunction<Question>;
    notifs: boolean;
    setNotifs: (boolean) => void;
}
const QuestionCard = (props: QuestionCardProps) => {
    const { question, mutate: mutateQuestion, notifs, setNotifs } = props;
    const { id: questionId, askedBy } = question;
    const { user } = useContext(AuthUserContext);
    if (!user) {
        throw new Error(
            "Invariant broken: withAuth must be used with component"
        );
    }

    const [open, setOpen] = useState(false);
    const [messageModalOpen, setMessageModalOpen] = useState(false);

    // save notification preference for when an instructor answers a question
    const [lastNotif, setLastNotif] = useState(notifs);

    const timeString = (date, isLong) => {
        return new Date(date).toLocaleString(
            "en-US",
            isLong ? {} : { hour: "numeric", minute: "numeric" }
        );
    };

    const triggerModal = () => {
        setOpen(!open);
    };

    const onAnswer = async () => {
        setLastNotif(notifs); // turns notifications off when answering questions
        setNotifs(false);
        await mutateQuestion(questionId, { status: QuestionStatus.ACTIVE });
    };

    const onFinish = async () => {
        setNotifs(lastNotif); // resets notification preference when finished answering question
        await mutateQuestion(questionId, { status: QuestionStatus.ANSWERED });
    };

    const onUndo = async () => {
        setNotifs(lastNotif); // resets notification preference when stopped answering question
        await mutateQuestion(questionId, { status: QuestionStatus.ASKED });
    };

    const isLoading = () => {
        return false; // todo: pass loading down props
    };

    // Re-render timestamp every 5 seconds
    const [, setTime] = useState(Date.now());
    useEffect(() => {
        const interval = setInterval(() => {
            setTime(Date.now());
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ marginTop: "10px" }}>
            <RejectQuestionModal
                open={open}
                question={question}
                closeFunc={triggerModal}
                mutate={mutateQuestion}
            />
            <MessageQuestionModal
                open={messageModalOpen}
                question={question}
                closeFunc={() => setMessageModalOpen(false)}
                mutate={mutateQuestion}
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
                                    trigger={<span>{fullName(askedBy)}</span>}
                                    content={`${fullName(askedBy)} (${
                                        askedBy.email
                                    })`}
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
                                        question.timeResponseStarted ===
                                        null ? (
                                            <span>
                                                Asked{" "}
                                                {moment
                                                    .duration(
                                                        moment().diff(
                                                            moment(
                                                                question.timeAsked
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
                                                                question.timeResponseStarted
                                                            )
                                                        )
                                                    )
                                                    .humanize()}{" "}
                                                ago
                                            </span>
                                        )
                                    }
                                    content={timeString(
                                        question.timeResponseStarted
                                            ? question.timeResponseStarted
                                            : question.timeAsked,
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
                tertiary={question.timeResponseStarted !== null}
                style={{ overflowWrap: "anywhere" }}
            >
                {question.text}
            </Segment>
            <Segment attached="bottom" secondary textAlign="right">
                <Grid>
                    <Grid.Row columns="equal">
                        <Grid.Column textAlign="left">
                            {!question.timeResponseStarted && (
                                <>
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
                                            question.videoChatUrl
                                                ? question.videoChatUrl
                                                : null
                                        }
                                        icon={
                                            question.videoChatUrl
                                                ? "video"
                                                : null
                                        }
                                        content="Answer"
                                        onClick={onAnswer}
                                        disabled={isLoading()}
                                        loading={false}
                                    />
                                </>
                            )}
                            {/* if response started, then some user responded */}
                            {question.timeResponseStarted &&
                                question.respondedToBy!.username ===
                                    user.username && (
                                    <Button
                                        compact
                                        size="mini"
                                        color="red"
                                        content="Undo"
                                        disabled={isLoading()}
                                        onClick={onUndo}
                                        loading={false}
                                    />
                                )}
                            {/* if response started, then some user responded */}
                            {question.timeResponseStarted &&
                                question.respondedToBy!.username ===
                                    user.username && (
                                    <Button
                                        compact
                                        size="mini"
                                        color="green"
                                        content="Finish"
                                        disabled={isLoading()}
                                        onClick={onFinish}
                                        loading={false}
                                    />
                                )}
                            {question.timeResponseStarted &&
                                question.videoChatUrl && (
                                    <a
                                        href={question.videoChatUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button
                                            compact
                                            size="mini"
                                            color="blue"
                                            content={
                                                // if responseStarted, then someone responded
                                                question.respondedToBy!
                                                    .username === user.username
                                                    ? "Rejoin Call"
                                                    : `Join Call (with ${fullName(
                                                          question.respondedToBy!
                                                      )})`
                                            }
                                            disabled={isLoading()}
                                        />
                                    </a>
                                )}
                            {!question.resolvedNote && (
                                <Message info>
                                    <Message.Header
                                        style={{ fontSize: "1rem" }}
                                    >
                                        This message will disappear when{" "}
                                        {question.askedBy.firstName} updates
                                        their question:
                                    </Message.Header>
                                    <Message.Content
                                        style={{ overflowWrap: "anywhere" }}
                                    >
                                        <p>{question.note}</p>
                                        <Button
                                            compact
                                            size="mini"
                                            color="blue"
                                            content="Resend"
                                            onClick={() =>
                                                setMessageModalOpen(true)
                                            }
                                        />
                                    </Message.Content>
                                </Message>
                            )}
                            {question.timeResponseStarted && (
                                <Button
                                    compact
                                    size="mini"
                                    color="blue"
                                    content="Message"
                                    onClick={() => setMessageModalOpen(true)}
                                />
                            )}
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
                            {question.timeResponseStarted && (
                                <Popup
                                    wide
                                    trigger={<Icon name="sync" loading />}
                                    // if responseStarted, then someone responded
                                    content={`Started by ${fullName(
                                        question.respondedToBy!
                                    )} on ${timeString(
                                        question.timeResponseStarted,
                                        true
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
                                                .map((tag) => ` ${tag.name}`)
                                                .toString()}
                                        </span>
                                    }
                                    content={question.tags
                                        .map((tag) => ` ${tag.name}`)
                                        .toString()}
                                    basic
                                    inverted
                                    position="bottom left"
                                />
                            )}
                            {(!question.tags || question.tags.length === 0) && (
                                <span style={{ paddingLeft: "8px" }}>
                                    <i>No Tags</i>
                                </span>
                            )}
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
        </div>
    );
};

export default QuestionCard;
