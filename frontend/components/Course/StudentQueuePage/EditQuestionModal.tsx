import { useState, useMemo } from "react";
import * as React from "react";
import { Modal, Form, Button } from "semantic-ui-react";
import Select from "react-select";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import { Course, Question, Tag } from "../../../types";
import { logException } from "../../../utils/sentry";
import { isValidVideoChatURL } from "../../../utils";

interface EditQuestionModalProps {
    course: Course;
    question: Question;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    mutate: mutateResourceListFunction<Question>;
    toastFunc: (success: string | null, error: any) => void;
    tags: Tag[];
}

interface EditQuestionFormState {
    questionId: number;
    text: string;
    tags: Tag[];
    videoChatUrl?: string;
}

const EditQuestionModal = (props: EditQuestionModalProps) => {
    const { question, course, open, setOpen, mutate, toastFunc, tags } = props;

    const charLimit: number = 250;
    const [input, setInput] = useState<EditQuestionFormState>({
        questionId: question.id,
        text: question.text || "",
        tags: question.tags || [],
        videoChatUrl: question.videoChatUrl,
    });
    const [charCount, setCharCount] = useState(input.text.length);
    const loading: boolean = false;

    const isValid = useMemo(
        () =>
            input.text &&
            (!course.requireVideoChatUrlOnQuestions ||
                (input.videoChatUrl &&
                    isValidVideoChatURL(input.videoChatUrl))) &&
            (question.text !== input.text ||
                JSON.stringify(question.tags) !== JSON.stringify(input.tags) ||
                question.videoChatUrl !== input.videoChatUrl),
        [input, course, question]
    );

    const handleInputChange = (e, { name, value }) => {
        if (name === "text" && value.length > charLimit) return;
        input[name] = value;
        setInput({ ...input });
        setCharCount(input.text.length);
    };

    const handleTagChange = (_, event) => {
        if (event.action === "remove-value") {
            const text = event.removedValue.label;

            setInput({
                ...input,
                tags: input.tags.filter((t) => {
                    return t.name !== text;
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
                tags: [
                    ...input.tags,
                    {
                        // Sound: shown tags must be from tags object
                        id: tags.find((t) => t.name === event.option.label)!.id,
                        name: event.option.label,
                    },
                ],
            });
        }
    };

    const onSubmit = async () => {
        if (!course.requireVideoChatUrlOnQuestions && !course.videoChatEnabled)
            delete input.videoChatUrl;
        try {
            await mutate(question.id, input);
            setOpen(false);
            toastFunc("Question successfully updated", null);
        } catch (e) {
            logException(e);
            setOpen(false);
            toastFunc(null, e);
        }
    };

    const resetInput = () => {
        setInput({
            questionId: question.id,
            text: question.text,
            tags: question.tags || [],
            videoChatUrl: question.videoChatUrl,
        });
        setCharCount(question.text.length);
    };

    return (
        <Modal open={open}>
            <Modal.Header>Edit Question</Modal.Header>
            <Modal.Content>
                <Form>
                    <Form.Field>
                        <label htmlFor="form-question">Question</label>
                        <Form.TextArea
                            id="form-question"
                            name="text"
                            value={input.text}
                            disabled={loading}
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
                                disabled={loading}
                                placeholder="https://zoom.us/j/578603907?pwd=L2ZhNkhlRnJPeGVwckcvY3hNak83QT09"
                                defaultValue={question.videoChatUrl}
                                onChange={handleInputChange}
                            />
                        </Form.Field>
                    )}
                    {tags && tags.length > 0 && (
                        <Form.Field>
                            <label htmlFor="form-question">Tags</label>
                            <Select
                                name="tags"
                                disabled={loading}
                                isClearable
                                isMulti
                                placeholder="Select tags"
                                value={input.tags.map((t) => ({
                                    label: t.name,
                                    value: t.name,
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
            </Modal.Content>
            <Modal.Actions>
                <Button
                    content="Cancel"
                    disabled={loading}
                    onClick={() => {
                        resetInput();
                        setOpen(false);
                    }}
                />
                <Button
                    content="Save"
                    disabled={loading || !isValid}
                    loading={loading}
                    color="green"
                    onClick={onSubmit}
                />
            </Modal.Actions>
        </Modal>
    );
};

export default EditQuestionModal;
