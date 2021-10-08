import { useState } from "react";
import {
    Segment,
    Header,
    Button,
    Popup,
    Icon,
    Grid,
    Message,
} from "semantic-ui-react";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import EditQuestionModal from "./EditQuestionModal";
import DeleteQuestionModal from "./DeleteQuestionModal";
import { Question, Course, Queue, Tag } from "../../../types";
import {
    useQuestionPosition,
    finishQuestion,
} from "../../../hooks/data-fetching/course";
import { logException } from "../../../utils/sentry";

interface QuestionCardProps {
    question: Question;
    course: Course;
    queue: Queue;
    queueMutate: mutateResourceListFunction<Queue>;
    mutate: mutateResourceListFunction<Question>;
    lastQuestionsMutate: mutateResourceListFunction<Question>;
    toastFunc: (success: string | null, error: any) => void;
    tags: Tag[];
}
const QuestionCard = (props: QuestionCardProps) => {
    const {
        question,
        course,
        queue,
        mutate,
        toastFunc,
        queueMutate,
        lastQuestionsMutate,
        tags,
    } = props;
    const { data: positionData } = useQuestionPosition(
        course.id,
        queue.id,
        question.id
    );

    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);

    const timeString = (date) => {
        return new Date(date).toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
        });
    };

    const markQuestionAsAnswered = async () => {
        try {
            await finishQuestion(course.id, queue.id, question.id);
        } catch (e) {
            logException(e);
            toastFunc(null, e);
        }
    };

    return (
        <div>
            <EditQuestionModal
                open={openEdit}
                queue={queue}
                question={question}
                setOpen={setOpenEdit}
                toastFunc={toastFunc}
                mutate={mutate}
                tags={tags}
            />
            <DeleteQuestionModal
                open={openDelete}
                queue={queue}
                queueMutate={queueMutate}
                lastQuestionsMutate={lastQuestionsMutate}
                question={question}
                setOpen={setOpenDelete}
                toastFunc={toastFunc}
                mutate={mutate}
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
                                {positionData &&
                                    positionData.position !== -1 &&
                                    `Position in Queue: #${positionData.position}`}
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
            <Segment
                attached
                tertiary={question.timeResponseStarted !== null}
                style={{ overflowWrap: "anywhere" }}
            >
                {question.studentDescriptor && (
                    <Header as="h5">Question</Header>
                )}
                {question.text}
            </Segment>
            {question.studentDescriptor && (
                <Segment
                    attached
                    tertiary={question.timeResponseStarted !== null}
                    style={{ overflowWrap: "anywhere" }}
                >
                    <Header as="h5">Student Description</Header>
                    {question.studentDescriptor}
                </Segment>
            )}
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
                                {question.timeResponseStarted && (
                                    <Header.Content>
                                        <Button
                                            compact
                                            size="mini"
                                            color="green"
                                            content="Mark as Answered"
                                            onClick={markQuestionAsAnswered}
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
                            {/* if responseStarted, then someone responded to
                            question */}
                            {question.timeResponseStarted && (
                                <Popup
                                    wide
                                    trigger={<Icon name="sync" loading />}
                                    content={`Started by ${
                                        question.respondedToBy!.firstName
                                    } ${
                                        question.respondedToBy!.lastName
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
                {question.note && !question.resolvedNote && (
                    <>
                        <Message info>
                            <Message.Header style={{ fontSize: "1rem" }}>
                                An instructor has messaged you, please update
                                your question:
                            </Message.Header>
                            <Message.Content
                                style={{ overflowWrap: "anywhere" }}
                            >
                                <p>{question.note}</p>
                            </Message.Content>
                        </Message>
                    </>
                )}
            </Segment>
        </div>
    );
};

export default QuestionCard;
