import { useState, useMemo } from "react";
import * as React from "react";
import { Modal, Form, Button } from "semantic-ui-react";
import Select from "react-select";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import { Question, Queue, Tag, VideoChatSetting } from "../../../types";
import { logException } from "../../../utils/sentry";
import { isValidVideoChatURL } from "../../../utils";
import { STUD_DESC_CHAR_LIMIT, TEXT_CHAR_LIMIT } from "../../../constants";

interface EditQuestionModalProps {
    queue: Queue;
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
    studentDescriptor: string;
}

const EditQuestionModal = (props: EditQuestionModalProps) => {
    const { question, queue, open, setOpen, mutate, toastFunc, tags } = props;
    const [input, setInput] = useState<EditQuestionFormState>({
        questionId: question.id,
        text: question.text || "",
        tags: question.tags || [],
        videoChatUrl: question.videoChatUrl,
        studentDescriptor: question.studentDescriptor || "",
    });
    const [textCharCount, setTextCharCount] = useState(input.text.length);
    const [studDescCharCount, setStudDescCharCount] = useState(
        input.studentDescriptor.length
    );
    const loading: boolean = false;

    const isValid = useMemo(
        () =>
            input.text &&
            (!(queue.videoChatSetting === VideoChatSetting.REQUIRED) ||
                (input.videoChatUrl &&
                    isValidVideoChatURL(input.videoChatUrl))) &&
            (question.text !== input.text ||
                question.studentDescriptor !== input.studentDescriptor ||
                JSON.stringify(question.tags) !== JSON.stringify(input.tags) ||
                question.videoChatUrl !== input.videoChatUrl),
        [input, queue, question]
    );

    const handleInputChange = (e, { name, value }) => {
        if (name === "text" && value.length > TEXT_CHAR_LIMIT) return;
        if (name === "studentDescriptor" && value.length > STUD_DESC_CHAR_LIMIT)
            return;
        input[name] = value;
        setInput({ ...input });
        setTextCharCount(input.text.length);
        setStudDescCharCount(input.studentDescriptor.length);
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
        if (queue.videoChatSetting === VideoChatSetting.DISABLED)
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
            studentDescriptor: question.studentDescriptor || "",
        });
        setTextCharCount(question.text.length);
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
                                color:
                                    textCharCount < TEXT_CHAR_LIMIT
                                        ? ""
                                        : "crimson",
                            }}
                        >
                            {`Characters: ${textCharCount}/${TEXT_CHAR_LIMIT}`}
                        </div>
                    </Form.Field>
                    {queue.videoChatSetting !== VideoChatSetting.REQUIRED && (
                        <Form.Field>
                            <label htmlFor="form-desc">Describe Yourself</label>
                            <Form.TextArea
                                id="form-stud-desc"
                                name="studentDescriptor"
                                disabled={loading}
                                placeholder="Beside the window, wearing a red hoodie"
                                value={input.studentDescriptor}
                                onChange={handleInputChange}
                            />
                            <div
                                style={{
                                    textAlign: "right",
                                    color:
                                        studDescCharCount < STUD_DESC_CHAR_LIMIT
                                            ? ""
                                            : "crimson",
                                }}
                            >
                                {`Characters: ${studDescCharCount}/${STUD_DESC_CHAR_LIMIT}`}
                            </div>
                        </Form.Field>
                    )}
                    {!(
                        queue.videoChatSetting === VideoChatSetting.DISABLED
                    ) && (
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
