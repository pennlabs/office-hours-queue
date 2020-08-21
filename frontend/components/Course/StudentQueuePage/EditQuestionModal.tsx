import React, { useState } from "react";
import { Modal, Form, Button } from "semantic-ui-react";
import { Course, Question, mutateResourceListFunction } from "../../../types";

interface EditQuestionModalProps {
    course: Course;
    question: Question;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    mutate: mutateResourceListFunction<Question>;
    toastFunc: (success: string, error: any) => void;
}

const EditQuestionModal = (props: EditQuestionModalProps) => {
    const { question, course, open, setOpen, mutate, toastFunc } = props;

    const [disabled, setDisabled] = useState(true);
    const charLimit: number = 250;
    const [input, setInput] = useState({
        questionId: question.id,
        text: question.text || "",
        tags: question.tags,
        videoChatUrl: question.videoChatUrl,
    });
    const [charCount, setCharCount] = useState(input.text.length);
    const loading: boolean = false;

    const isValid = () => {
        return (
            input.text &&
            (!course.requireVideoChatUrlOnQuestions || input.videoChatUrl) &&
            (question.text !== input.text ||
                JSON.stringify(question.tags) !== JSON.stringify(input.tags) ||
                question.videoChatUrl !== input.videoChatUrl)
        );
    };

    const handleInputChange = (e, { name, value }) => {
        if (name === "text" && value.length > charLimit) return;
        input[name] = value;
        setInput(input);
        setCharCount(input.text.length);
        setDisabled(!isValid());
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
        if (!course.requireVideoChatUrlOnQuestions && !course.videoChatEnabled)
            delete input.videoChatUrl;
        try {
            await mutate(question.id, input);
            setOpen(false);
            toastFunc("Question successfully updated", null);
        } catch (e) {
            setOpen(false);
            toastFunc(null, e);
        }
    };

    const resetInput = () => {
        setInput({
            questionId: question.id,
            text: question.text,
            tags: question.tags,
            videoChatUrl: question.videoChatUrl,
        });
        setCharCount(question.text.length);
        setDisabled(true);
    };

    return (
        <Modal open={open}>
            <Modal.Header>Edit Question</Modal.Header>
            <Modal.Content>
                <Form>
                    <Form.Field>
                        <label>Question</label>
                        <Form.TextArea
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
                            <label>Video Chat URL</label>
                            <Form.Input
                                name="videoChatUrl"
                                disabled={loading}
                                placeholder="https://zoom.us/j/578603907?pwd=L2ZhNkhlRnJPeGVwckcvY3hNak83QT09"
                                defaultValue={question.videoChatUrl}
                                onChange={handleInputChange}
                            />
                        </Form.Field>
                    )}
                    {/* TODO: replace this with course level tags */}
                    {/* {course.tags && course.tags.length > 0 && (
                        <Form.Field>
                            <label>Tags</label>
                            <Form.Dropdown
                                multiple
                                selection
                                name="tags"
                                disabled={loading}
                                onChange={handleInputChange}
                                defaultValue={question.tags}
                                options={getDropdownOptions(course.tags)}
                            />
                        </Form.Field>
                    )} */}
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
                    disabled={loading || disabled}
                    loading={loading}
                    color="green"
                    onClick={onSubmit}
                />
            </Modal.Actions>
        </Modal>
    );
};

export default EditQuestionModal;
