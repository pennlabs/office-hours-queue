import React, { useState } from "react";
import { Header, Label, Grid, Segment, Button } from "semantic-ui-react";
import Questions from "./Questions";
import QueueFilterForm from "./QueueFilterForm";
import ClearQueueModal from "./ClearQueueModal";
import { mutateFunction, Queue as QueueType } from "../../../types";
import { updateQueue, useQuestions } from "../CourseRequests";

// Returns true if l1 is a subset of l2
const isSubset = (l1, l2) => {
    if (l2.length === 0) return true;
    return l1.filter(value => l2.includes(value)).length > 0;
};

interface QueueProps {
    queue: QueueType;
    refetch: mutateFunction<QueueType>;
    leader: boolean;
    editFunc: () => void;
}
const Queue = (props: QueueProps) => {
    const { queue, refetch, leader, editFunc } = props;
    const { id: queueId, course: courseId, active, estimatedWaitTime } = queue;

    /* STATE */
    const [questions, error, isValidating, mutateQuestions] = useQuestions(
        courseId,
        queueId,
        3000
    );
    const [filters, setFilters] = useState({ tags: [], status: null });
    const [clearModalOpen, setClearModalOpen] = useState(false);

    const tags = [];

    const filteredQuestions = questions;
    //     useMemo(
    //     () => questions.filter((q) => isSubset(q.tags, filters.tags)),
    //     [questions, filters]
    // );

    const onOpen = async () => {
        await updateQueue(courseId, queueId, { active: true });
        await refetch();
    };

    const onClose = async () => {
        await updateQueue(courseId, queueId, { active: false });
        await refetch();
    };

    return (
        <Segment basic>
            <ClearQueueModal
                open={clearModalOpen}
                queue={queue}
                refetch={refetch}
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
                    <Grid.Column width={5} only="computer mobile">
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
                            color={!active ? null : "red"}
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
                    {tags.length > 0 && (
                        <Grid.Column>
                            <QueueFilterForm
                                tags={tags}
                                changeFunc={setFilters}
                            />
                        </Grid.Column>
                    )}
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
                    courseId={courseId}
                    queueId={queueId}
                    questions={filteredQuestions}
                    refetch={mutateQuestions}
                    active={active}
                />
            </Grid.Row>
        </Segment>
    );
};

export default Queue;
