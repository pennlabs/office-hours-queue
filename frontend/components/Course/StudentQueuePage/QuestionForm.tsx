import React, { useState } from "react";
import { Segment, Form, Header, Button } from "semantic-ui-react";

import { isValidURL } from "../../../utils";
import { createQuestion } from "../../../hooks/data-fetching/course";
import { Course, mutateResourceListFunction, Question } from "../../../types";

interface QuestionFormProps {
    course: Course;
    queueId: number;
    mutate: mutateResourceListFunction<Question>;
    toastFunc: (success: string, error: any) => void;
}
const QuestionForm = (props: QuestionFormProps) => {
    const loading = false;
    const { course } = props;
    const [input, setInput] = useState<Partial<Question>>({
        text: "",
        tags: [],
    });
    const charLimit: number = 250;
    const [charCount, setCharCount] = useState(0);
    const [disabled, setDisabled] = useState(true);
    const [validURL, setValidURL] = useState(
        !course.requireVideoChatUrlOnQuestions
    );

    const handleInputChange = (e, { name, value }) => {
        if (name === "text" && value.length > charLimit) return;
        if (name === "videoChatUrl") value = value.trim();
        input[name] = value;
        setInput(input);
        setCharCount(input.text.length);
        setDisabled(
            !input.text ||
                (course.requireVideoChatUrlOnQuestions && !input.videoChatUrl)
        );
        if (name === "videoChatUrl") {
            setValidURL(isValidURL(input.videoChatUrl));
            if (course.videoChatEnabled && input.videoChatUrl === "") {
                setValidURL(true);
            }
        }
    };

    const getDropdownOptions = (tags) => {
        return tags.map((tag) => {
            return {
                key: tag,
                value: tag,
                text: tag,
            };
        });
    };

    const onSubmit = async () => {
        try {
            await createQuestion(props.course.id, props.queueId, input);
            // TODO: make arguments here optional?
            await props.mutate(-1, null);
            props.toastFunc("Question successfully added to queue", null);
        } catch (e) {
            await props.mutate(-1, null);
            props.toastFunc(null, e);
        }
    };

    return (
        <div>
            <Segment style={{ marginTop: "20px" }} attached="top" color="blue">
                <Header content="Ask a Question" />
            </Segment>
            <Segment attached secondary>
                <Form>
                    <Form.Field required>
                        <label>Question</label>
                        <Form.TextArea
                            name="text"
                            disabled={loading}
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
                            <label>Video Chat URL</label>
                            <Form.Input
                                name="videoChatUrl"
                                disabled={loading}
                                placeholder="Sample URL: https://zoom.us/j/123456789?pwd=abcdefg"
                                onChange={handleInputChange}
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
                    disabled={loading || disabled || !validURL}
                    loading={loading}
                    onClick={onSubmit}
                />
            </Segment>
        </div>
    );
};

export default QuestionForm;
