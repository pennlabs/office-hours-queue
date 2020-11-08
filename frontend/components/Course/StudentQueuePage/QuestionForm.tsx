import React, { useState } from "react";
import { Segment, Form, Header, Button } from "semantic-ui-react";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";

import { isValidVideoChatURL } from "../../../utils";
import { createQuestion } from "../../../hooks/data-fetching/course";
import { Course, Question, Queue } from "../../../types";
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
    tags: string[];
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

    // const getDropdownOptions = (tags) => {
    //     return tags.map((tag) => {
    //         return {
    //             key: tag,
    //             value: tag,
    //             text: tag,
    //         };
    //     });
    // };

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
                    {/* TODO: tags */}
                    {/* {course.tags && course.tags.length > 0 && (
                        <Form.Field>
                            <label>Tags</label>
                            <Form.Dropdown
                                multiple
                                selection
                                name="tags"
                                placeholder="Select tags"
                                disabled={loading}
                                onChange={handleInputChange}
                                options={getDropdownOptions(course.tags)}
                            />
                        </Form.Field>
                    )} */}
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
