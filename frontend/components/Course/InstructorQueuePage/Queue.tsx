import React, { useState, useEffect, useMemo } from "react";
import {
    Header,
    Label,
    Grid,
    Message,
    Button,
    Icon,
    Form,
} from "semantic-ui-react";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import Select from "react-select";
import Questions from "./Questions";
import ClearQueueModal from "./ClearQueueModal";
import { Queue as QueueType, Question, Tag } from "../../../types";
import {
    useQuestions,
    partialUpdateQueue,
} from "../../../hooks/data-fetching/course";
import { PIN_CHAR_LIMIT } from "../../../constants";

interface QueueProps {
    courseId: number;
    queue: QueueType;
    questions: Question[];
    mutate: mutateResourceListFunction<QueueType>;
    leader: boolean;
    editFunc: () => void;
    notifs: boolean;
    setNotifs: (boolean) => void;
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
        notifs,
        setNotifs,
        tags,
    } = props;
    const { id: queueId, active, estimatedWaitTime, pin } = queue;
    const [pinState, setPinState] = useState<string | undefined>(queue.pin);
    const [editingPin, setEditingPin] = useState<boolean>(false);
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

    const handlePinChange = (_, { value }) => {
        if (value.length <= PIN_CHAR_LIMIT) {
            setPinState(value);
        }
    };

    const handlePinSubmit = async () => {
        if (editingPin) {
            await partialUpdateQueue(courseId, queueId, { pin: pinState });
            await mutate(pin, { pin: pinState });
        }
        setEditingPin(!editingPin);
    };

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
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <Header as="h3">
                    {queue.name}
                    <Header.Subheader
                        style={{
                            whiteSpace: "break-spaces",
                            wordBreak: "break-word",
                        }}
                    >
                        {queue.description}
                    </Header.Subheader>
                </Header>
                {queue.pinEnabled && (
                    <Form onSubmit={handlePinSubmit}>
                        <Form.Group inline unstackable>
                            <Form.Input
                                name="changePin"
                                label="Pin: "
                                value={pinState}
                                disabled={!editingPin}
                                onChange={handlePinChange}
                            />
                            <Form.Button
                                icon={
                                    <Icon
                                        name={editingPin ? "check" : "edit"}
                                    />
                                }
                            />
                        </Form.Group>
                    </Form>
                )}
            </div>
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
                        {queue.active && (
                            <Label
                                content={`${
                                    queue.staffActive || 0
                                } staff active`}
                                icon={<Icon name="sync" loading={true} />}
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
                        <Grid.Column>
                            <Message>
                                <Message.Header>
                                    A rate-limiting quota is set on this queue.
                                </Message.Header>
                                <p>
                                    {`A quota of ${queue.rateLimitQuestions} question(s) per ${queue.rateLimitMinutes} minutes(s) ` +
                                        `per student is enforced when there are at least ${queue.rateLimitLength} student(s) in the queue.`}
                                </p>
                            </Message>
                        </Grid.Column>
                    </Grid.Row>
                )}
                {queue.questionsAsked >= 6 && !queue.rateLimitEnabled && (
                    <Grid.Row>
                        <Grid.Column>
                            <Message color="red">
                                <Message.Header>
                                    Too much traffic?
                                </Message.Header>
                                Ask your Head TA or professor to turn on
                                rate-limiting quotas for this queue!
                            </Message>
                        </Grid.Column>
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
                {!active && questions.length > 0 && (
                    <Grid.Row columns="equal">
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
                    </Grid.Row>
                )}
                <Grid.Row>
                    <Grid.Column>
                        <Questions
                            questions={filteredQuestions}
                            mutate={mutateQuestions}
                            active={active}
                            notifs={notifs}
                            setNotifs={setNotifs}
                        />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </>
    ) : null;
};

export default Queue;
