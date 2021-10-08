import { useState } from "react";
import { Segment, Form, Header, Button } from "semantic-ui-react";
import Select from "react-select";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import { isValidVideoChatURL } from "../../../utils";
import { createQuestion } from "../../../hooks/data-fetching/course";
import { Question, Queue, Tag, VideoChatSetting } from "../../../types";
import { logException } from "../../../utils/sentry";

interface QuestionFormProps {
    courseId: number;
    queue: Queue;
    queueMutate: mutateResourceListFunction<Queue>;
    mutate: mutateResourceListFunction<Question>;
    toastFunc: (success: string | null, error: any) => void;
    tags: Tag[];
}

interface QuestionFormState {
    text: string;
    tags: { name: string }[];
    videoChatUrl?: string;
    studentDescriptor?: string;
}

const QuestionForm = (props: QuestionFormProps) => {
    const { courseId, queue, tags } = props;
    const [input, setInput] = useState<QuestionFormState>({
        text: queue.questionTemplate,
        tags: [],
    });
    const charLimit: number = 250;
    const [textCharCount, setTextCharCount] = useState(0);
    const [studDescCharCount, setStudDescCharCount] = useState(0);
    const [disabled, setDisabled] = useState(true);
    const [validURL, setValidURL] = useState(true);
    const [createPending, setCreatePending] = useState(false);

    const handleInputChange = (e, { name, value }) => {
        if (name === "text" && value.length > charLimit) return;
        if (name === "studentDescriptor" && value.length > charLimit) return;
        const nextValue = name === "videoChatUrl" ? value.trim() : value;
        input[name] = nextValue;
        setInput({ ...input });
        setTextCharCount(input.text.length);
        setStudDescCharCount((input.studentDescriptor ?? "").length);
        setDisabled(
            !input.text ||
                (queue.videoChatSetting === VideoChatSetting.REQUIRED &&
                    !input.videoChatUrl)
        );
        if (input.videoChatUrl !== undefined) {
            setValidURL(isValidVideoChatURL(input.videoChatUrl));
            if (
                queue.videoChatSetting === VideoChatSetting.OPTIONAL &&
                input.videoChatUrl === ""
            ) {
                setValidURL(true);
            }
        }
    };

    const handleTagChange = (_, event) => {
        if (event.action === "remove-value") {
            const text = event.removedValue.label;

            setInput({
                ...input,
                tags: input.tags.filter((tagLabel) => {
                    return tagLabel.name !== text;
                }),
            });
        } else if (event.action === "clear") {
            setInput({
                ...input,
                tags: [],
            });
        } else if (event.action === "select-option") {
            setInput({
                ...input,
                tags: [...input.tags, { name: event.option.label }],
            });
        }
    };

    const onSubmit = async () => {
        setCreatePending(true);
        try {
            await createQuestion(courseId, queue.id, input);
            await props.mutate(-1, null);
            await props.queueMutate(-1, null);
            props.toastFunc("Question successfully added to queue", null);
        } catch (e) {
            let message: string;
            if (e.status === 429) {
                message = "Exceeded question quota for queue";
            } else {
                message = "Unable to create question";
                logException(e);
            }
            await props.mutate(-1, null);
            props.toastFunc(null, message);
        }
        setCreatePending(false);
    };

    return (
        <div>
            <Segment attached="top" color="blue">
                <Header content="Ask a Question" />
            </Segment>
            <Segment attached secondary>
                <Form>
                    <Form.Field required>
                        <label htmlFor="form-question">Question</label>
                        <Form.TextArea
                            id="form-question"
                            name="text"
                            value={input.text}
                            onChange={handleInputChange}
                        />
                        <div
                            style={{
                                textAlign: "right",
                                color:
                                    textCharCount < charLimit ? "" : "crimson",
                            }}
                        >
                            {`Characters: ${textCharCount}/${charLimit}`}
                        </div>
                    </Form.Field>
                    <Form.Field>
                        <label htmlFor="form-desc">Student Description</label>
                        <Form.TextArea
                            id="form-stud-desc"
                            name="studentDescriptor"
                            placeholder="right of the door wearing a red hoodie"
                            value={input.studentDescriptor}
                            onChange={handleInputChange}
                        />
                        <div
                            style={{
                                textAlign: "right",
                                color:
                                    studDescCharCount < charLimit
                                        ? ""
                                        : "crimson",
                            }}
                        >
                            {`Characters: ${studDescCharCount}/${charLimit}`}
                        </div>
                    </Form.Field>
                    {(queue.videoChatSetting === VideoChatSetting.REQUIRED ||
                        queue.videoChatSetting ===
                            VideoChatSetting.OPTIONAL) && (
                        <Form.Field
                            required={
                                queue.videoChatSetting ===
                                VideoChatSetting.REQUIRED
                            }
                        >
                            <label htmlFor="form-vid-url">Video Chat URL</label>
                            <Form.Input
                                id="form-vid-url"
                                name="videoChatUrl"
                                placeholder="Sample URL: https://zoom.us/j/123456789?pwd=abcdefg"
                                onChange={handleInputChange}
                                error={
                                    !validURL &&
                                    "Please enter a valid video link!"
                                }
                            />
                        </Form.Field>
                    )}
                    {tags && tags.length > 0 && (
                        <Form.Field>
                            <label htmlFor="form-question">Tags</label>
                            <Select
                                name="tags"
                                disabled={createPending}
                                isClearable
                                isMulti
                                placeholder="Select tags"
                                value={input.tags.map((s) => ({
                                    label: s.name,
                                    value: s.name,
                                }))}
                                onChange={handleTagChange}
                                options={tags.map((t) => ({
                                    label: t.name,
                                    value: t.name,
                                }))}
                            />
                        </Form.Field>
                    )}
                </Form>
            </Segment>
            <Segment attached="bottom">
                <Button
                    compact
                    content="Submit"
                    color="blue"
                    disabled={createPending || disabled || !validURL}
                    loading={createPending}
                    onClick={onSubmit}
                />
            </Segment>
        </div>
    );
};

export default QuestionForm;
