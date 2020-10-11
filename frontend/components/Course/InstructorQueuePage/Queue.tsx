import React, { useState, useEffect, useRef, MutableRefObject } from "react";
import { Header, Label, Grid, Segment, Button } from "semantic-ui-react";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import Questions from "./Questions";
import ClearQueueModal from "./ClearQueueModal";
import { Queue as QueueType, Question } from "../../../types";
import { useQuestions } from "../../../hooks/data-fetching/course";

interface QueueProps {
    courseId: number;
    queue: QueueType;
    questions: Question[];
    mutate: mutateResourceListFunction<QueueType>;
    leader: boolean;
    editFunc: () => void;
    play: MutableRefObject<() => void>;
}

const Queue = (props: QueueProps) => {
    const {
        courseId,
        queue,
        questions: rawQuestions,
        mutate,
        leader,
        editFunc,
        play,
    } = props;
    const { id: queueId, active, estimatedWaitTime } = queue;
    /* STATE */
    const { data: questions, mutate: mutateQuestions } = useQuestions(
        courseId,
        queueId,
        rawQuestions
    );

    const latestAsked = useRef(
        questions && questions[0]?.timeAsked
            ? new Date(questions[0].timeAsked)
            : new Date(0)
    );

    const [clearModalOpen, setClearModalOpen] = useState(false);

    useEffect(() => {
        if (
            questions &&
            questions[0] &&
            new Date(questions[questions.length - 1].timeAsked) >
                latestAsked.current
        ) {
            latestAsked.current = new Date(
                questions[questions.length - 1].timeAsked
            );
            play.current();
        }
        // questions is not stale because we check for deep equality
        // eslint-disable-next-line
    }, [JSON.stringify(questions), play]);

    const onOpen = async () => {
        await mutate(queueId, { active: true });
    };

    const onClose = async () => {
        await mutate(queueId, { active: false });
    };

    return queue && questions ? (
        <Segment basic>
            <ClearQueueModal
                courseId={courseId}
                queueId={queueId}
                open={clearModalOpen}
                queue={queue}
                mutate={mutateQuestions}
                closeFunc={() => setClearModalOpen(false)}
            />
            <Header as="h3">
                {queue.name}
                <Header.Subheader>
                    {/* <Linkify componentDecorator={linkifyComponentDecorator}> */}
                    {queue.description}
                    {/* </Linkify> */}
                </Header.Subheader>
            </Header>
            <Grid>
                <Grid.Row columns="equal">
                    <Grid.Column only="computer mobile">
                        {questions.length !== 0 && (
                            <Label
                                content={`${questions.length} user${
                                    questions.length === 1 ? "" : "s"
                                }`}
                                color="blue"
                                icon="user"
                            />
                        )}
                        {/* TODO: make these checks more smart (users in queue) like student view */}
                        {estimatedWaitTime !== -1 && (
                            <Label
                                content={`${estimatedWaitTime} minute wait`}
                                color="blue"
                                icon="clock"
                            />
                        )}
                    </Grid.Column>
                    <Grid.Column textAlign="right" floated="right">
                        {leader && (
                            <Button
                                size="mini"
                                content="Edit"
                                icon="cog"
                                onClick={editFunc}
                            />
                        )}
                        <Button
                            size="mini"
                            content="Close"
                            color={active ? "red" : undefined}
                            disabled={!active}
                            loading={false}
                            onClick={onClose}
                        />
                        <Button
                            size="mini"
                            content="Open"
                            color={active ? undefined : "green"}
                            disabled={active}
                            loading={false}
                            onClick={onOpen}
                        />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            <Grid style={{ marginTop: "-5px" }}>
                <Grid.Row columns="equal">
                    {!active && questions.length > 0 && (
                        <Grid.Column
                            textAlign="right"
                            floated="right"
                            only="computer mobile"
                        >
                            <Button
                                content="Clear Queue"
                                fluid
                                size="medium"
                                basic
                                color="red"
                                onClick={() => setClearModalOpen(true)}
                            />
                        </Grid.Column>
                    )}
                </Grid.Row>
            </Grid>
            <Grid.Row columns={1}>
                <Questions
                    questions={questions}
                    mutate={mutateQuestions}
                    active={active}
                />
            </Grid.Row>
        </Segment>
    ) : null;
};

export default Queue;
