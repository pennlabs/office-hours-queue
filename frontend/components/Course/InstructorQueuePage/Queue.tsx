import React, { useState, useEffect, useMemo, MutableRefObject } from "react";
import {
    Header,
    Label,
    Grid,
    Message,
    Button,
    Segment,
} from "semantic-ui-react";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import Select from "react-select";
import Questions from "./Questions";
import ClearQueueModal from "./ClearQueueModal";
import { Queue as QueueType, Question, Tag } from "../../../types";
import { useQuestions } from "../../../hooks/data-fetching/course";

interface QueueProps {
    courseId: number;
    queue: QueueType;
    questions: Question[];
    mutate: mutateResourceListFunction<QueueType>;
    leader: boolean;
    editFunc: () => void;
    play: MutableRefObject<() => void>;
    tags: Tag[];
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
        tags,
    } = props;
    const { id: queueId, active, estimatedWaitTime } = queue;
    const [filteredTags, setFilteredTags] = useState<string[]>([]);
    const { data: questions, mutate: mutateQuestions } = useQuestions(
        courseId,
        queueId,
        rawQuestions
    );

    useEffect(() => {
        mutateQuestions();
    }, [JSON.stringify(questions)]);

    const filteredQuestions = useMemo(
        () =>
            // Sound: questions is always non-undefined because raw data is provided
            questions!.filter(
                (q) =>
                    filteredTags.length === 0 ||
                    q.tags.find((t) => filteredTags.includes(t.name)) !==
                        undefined
            ),
        [filteredTags, JSON.stringify(questions)]
    );

    const [clearModalOpen, setClearModalOpen] = useState(false);

    const handleTagChange = (_, event) => {
        if (event.action === "select-option") {
            setFilteredTags([...filteredTags, event.option.label]);
        } else if (event.action === "remove-value") {
            setFilteredTags(
                filteredTags.filter((t) => t !== event.removedValue.label)
            );
        } else if (event.action === "clear") {
            setFilteredTags([]);
        }
    };

    const onOpen = async () => {
        await mutate(queueId, { active: true });
    };

    const onClose = async () => {
        await mutate(queueId, { active: false });
    };

    return queue && questions ? (
        <>
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
                <Header.Subheader>{queue.description}</Header.Subheader>
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
                {queue.rateLimitEnabled && (
                    <Grid.Row>
                        <Segment basic style={{ width: "100%" }}>
                            <Message>
                                <Message.Header>
                                    A rate-limiting quota is set on this queue.
                                </Message.Header>
                                {`A student can ask ${queue.rateLimitQuestions} question(s) within ${queue.rateLimitMinutes} minute(s) when there are at least ${queue.rateLimitLength} student(s) in the queue`}
                            </Message>
                        </Segment>
                    </Grid.Row>
                )}
                {queue.questionsActive >= 8 && queue.rateLimitEnabled && (
                    <Grid.Row>
                        <Segment basic style={{ width: "100%" }}>
                            <Message color="red">
                                <Message.Header>
                                    Too much traffic?
                                </Message.Header>
                                Ask your Head TA or professor to turn on
                                rate-limiting quotas for this queue!
                            </Message>
                        </Segment>
                    </Grid.Row>
                )}
                <Grid.Row>
                    <Grid.Column>
                        <Select
                            id="tags-filter-select"
                            name="tags-filter-select"
                            isMulti
                            options={tags.map((t) => ({
                                label: t.name,
                                value: t.name,
                            }))}
                            placeholder="Filter question by tags"
                            onChange={handleTagChange}
                            value={filteredTags.map((t) => ({
                                label: t,
                                value: t,
                            }))}
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
                    questions={filteredQuestions}
                    mutate={mutateQuestions}
                    active={active}
                    play={play}
                />
            </Grid.Row>
        </>
    ) : null;
};

export default Queue;
