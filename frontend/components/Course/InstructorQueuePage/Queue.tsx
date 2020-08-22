import React, { useState } from "react";
import { Header, Label, Grid, Segment, Button } from "semantic-ui-react";
import Questions from "./Questions";
import ClearQueueModal from "./ClearQueueModal";
import { mutateResourceListFunction, Queue as QueueType } from "../../../types";
import { useQuestions } from "../../../hooks/data-fetching/course";

interface QueueProps {
    courseId: number;
    queue: QueueType;
    mutate: mutateResourceListFunction<QueueType>;
    leader: boolean;
    editFunc: () => void;
}
const Queue = (props: QueueProps) => {
    const { courseId, queue, mutate, leader, editFunc } = props;
    const { id: queueId, active, estimatedWaitTime } = queue;

    /* STATE */
    // TODO: proper inital props on this
    const [questions, , , mutateQuestions] = useQuestions(
        courseId,
        queueId,
        3000
    );
    const [clearModalOpen, setClearModalOpen] = useState(false);

    const onOpen = async () => {
        await mutate(queueId, { active: true });
    };

    const onClose = async () => {
        await mutate(queueId, { active: false });
    };

    return (
        <Segment basic>
            <ClearQueueModal
                courseId={courseId}
                queueId={queueId}
                open={clearModalOpen}
                queue={queue}
                refetch={mutate}
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
                        <Label
                            content={`${questions.length} user${
                                questions.length === 1 ? "" : "s"
                            }`}
                            color="blue"
                            icon="user"
                        />
                        <Label
                            content={`${estimatedWaitTime} minute wait`}
                            color="blue"
                            icon="clock"
                        />
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
                            color={active ? "red" : null}
                            disabled={!active}
                            loading={false}
                            onClick={onClose}
                        />
                        <Button
                            size="mini"
                            content="Open"
                            color={active ? null : "green"}
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
                    refetch={mutateQuestions}
                    active={active}
                />
            </Grid.Row>
        </Segment>
    );
};

export default Queue;
