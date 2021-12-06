import { useState, useEffect, useMemo, useContext } from "react";
import { Header, Label, Grid, Message, Button, Icon } from "semantic-ui-react";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import Select from "react-select";
import Questions from "./Questions";
import ClearQueueModal from "./ClearQueueModal";
import {
    Queue as QueueType,
    Question,
    Tag,
    UserMembership,
} from "../../../types";
import { useQuestions } from "../../../hooks/data-fetching/course";
import { AuthUserContext } from "../../../context/auth";

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
    membership: UserMembership;
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
        membership,
    } = props;
    const { id: queueId, active, estimatedWaitTime } = queue;
    const [filteredTags, setFilteredTags] = useState<string[]>([]);
    const { data: questions, mutate: mutateQuestions } = useQuestions(
        courseId,
        queueId,
        rawQuestions
    );

    const { user } = useContext(AuthUserContext);
    if (!user) {
        throw new Error(
            "Invariant broken: withAuth must be used with component"
        );
    }

    const answeredTime = useMemo(() => {
        return questions &&
            questions?.find(
                (question) =>
                    question.respondedToBy?.username === user!.username
            )
            ? new Date(
                  questions!.find(
                      (question) =>
                          question.respondedToBy?.username === user!.username
                  )!.timeResponseStarted!
              )
            : null;
    }, [JSON.stringify(questions), user]);

    const [minutes, setMinutes] = useState<Number>(
        (membership.timerSeconds.valueOf() / 60) >> 0
    );
    const [seconds, setSeconds] = useState<Number>(
        membership.timerSeconds.valueOf() % 60
    );
    const [timeUp, setTimeUp] = useState<Boolean>(false);

    useEffect(() => {
        setInterval(() => {
            if (answeredTime) {
                const totalSeconds =
                    membership.timerSeconds.valueOf() * 60 -
                    (new Date().getTime() - answeredTime.getTime()) / 1000;
                if (totalSeconds > 0) {
                    setSeconds(totalSeconds % 60 >> 0);
                    setMinutes((totalSeconds - (totalSeconds % 60)) / 60);
                    setTimeUp(false);
                } else {
                    setTimeUp(true);
                }
            }
        }, 1000);
    }, [membership, answeredTime]);

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
            <Grid columns="equal">
                <Grid.Column>
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
                </Grid.Column>
                {answeredTime && (
                    <Grid.Column>
                        <span style={{ float: "right" }}>
                            <Label
                                color={timeUp ? "red" : "green"}
                                size="large"
                            >
                                {timeUp
                                    ? "Time Up"
                                    : `${
                                          minutes < 10 ? `0${minutes}` : minutes
                                      }:${
                                          seconds < 10 ? `0${seconds}` : seconds
                                      }`}
                            </Label>
                        </span>
                    </Grid.Column>
                )}
            </Grid>
            <Grid>
                <Grid.Row columns="equal">
                    <Grid.Column>
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
                        <Grid.Column textAlign="right" floated="right">
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
