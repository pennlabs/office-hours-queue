import React, { useEffect, useState } from "react";
import { Segment, Form, Header, Button } from "semantic-ui-react";
import Select from "react-select";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import { isValidVideoChatURL } from "../../../utils";
import { createQuestion, useTags } from "../../../hooks/data-fetching/course";
import { Course, Question, Queue, Tag, TagLabel } from "../../../types";
import { logException } from "../../../utils/sentry";

interface QuestionFormProps {
    course: Course;
    queueId: number;
    queueMutate: mutateResourceListFunction<Queue>;
    mutate: mutateResourceListFunction<Question>;
    toastFunc: (success: string | null, error: any) => void;
}

interface QuestionFormState {
    text: string;
    tags: Tag[];
    videoChatUrl?: string;
}

const QuestionForm = (props: QuestionFormProps) => {
    const { course } = props;
    const [input, setInput] = useState<QuestionFormState>({
        text: "",
        tags: [],
    });
    const charLimit: number = 250;
    const [charCount, setCharCount] = useState(0);
    const [disabled, setDisabled] = useState(true);
    const [validURL, setValidURL] = useState(true);
    const [createPending, setCreatePending] = useState(false);

    // BIG TODO: server fetch required information here
    const { data: tags } = useTags(course.id, undefined);
    const [tagOptions, setTagOptions] = useState<TagLabel[]>(
        tags!.map((t) => ({ label: t.name, value: t.name }))
    );
    const [tagLabels, setTagLabels] = useState<TagLabel[]>(
        tags!.map((t) => ({ label: t.name, value: t.name }))
    );

    const handleInputChange = (e, { name, value }) => {
        if (name === "text" && value.length > charLimit) return;
        const nextValue = name === "videoChatUrl" ? value.trim() : value;
        input[name] = nextValue;
        setInput(input);
        setCharCount(input.text.length);
        setDisabled(
            !input.text ||
                (course.requireVideoChatUrlOnQuestions && !input.videoChatUrl)
        );
        if (input.videoChatUrl) {
            setValidURL(isValidVideoChatURL(input.videoChatUrl));
            if (course.videoChatEnabled && input.videoChatUrl === "") {
                setValidURL(true);
            }
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const loadedTags: Tag[] = await getTags(course.id);

            setTagOptions(
                loadedTags.map((tag) => {
                    return {
                        label: tag.name,
                        value: tag.name,
                    };
                })
            );
        };

        fetchData();
    }, [course]);

    const handleTagChange = (_, event) => {
        if (event.action === "remove-value") {
            const text = event.removedValue.label;

            setTagLabels(
                tagLabels.filter((tagLabel) => {
                    return tagLabel.label !== text;
                })
            );

            input.tags = input.tags.filter((tag) => {
                return tag.name !== text;
            });
            setInput(input);
        } else if (event.action === "clear") {
            setTagLabels([]);
        } else if (event.action === "select-option") {
            setTagLabels([
                ...tagLabels,
                { label: event.option.label, value: event.option.label },
            ]);

            input.tags = [...input.tags, { name: event.option.label }];
        }
    };

    const onSubmit = async () => {
        setCreatePending(true);
        try {
            await createQuestion(props.course.id, props.queueId, input);
            // TODO: make arguments here optional?
            await props.mutate(-1, null);
            await props.queueMutate(-1, null);
            props.toastFunc("Question successfully added to queue", null);
        } catch (e) {
            logException(e);
            await props.mutate(-1, null);
            props.toastFunc(null, e);
        }
        setCreatePending(false);
    };

    return (
        <div>
            <Segment style={{ marginTop: "20px" }} attached="top" color="blue">
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
                                color: charCount < charLimit ? "" : "crimson",
                            }}
                        >
                            {`Characters: ${charCount}/${charLimit}`}
                        </div>
                    </Form.Field>
                    {(course.requireVideoChatUrlOnQuestions ||
                        course.videoChatEnabled) && (
                        <Form.Field
                            required={course.requireVideoChatUrlOnQuestions}
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
                    {tagOptions && tagOptions.length > 0 && (
                        <Form.Field>
                            <label htmlFor="form-question">Tags</label>
                            <Select
                                name="tags"
                                disabled={createPending}
                                isClearable
                                isMulti
                                placeholder="Select tags"
                                value={tagLabels}
                                onChange={handleTagChange}
                                options={tagOptions}
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
