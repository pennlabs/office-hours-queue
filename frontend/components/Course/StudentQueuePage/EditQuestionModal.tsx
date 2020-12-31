import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "semantic-ui-react";
import Select from "react-select";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import { Course, Question, Tag, TagLabel } from "../../../types";
import { logException } from "../../../utils/sentry";
import { getTags } from "../../../hooks/data-fetching/course";

interface EditQuestionModalProps {
    course: Course;
    question: Question;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    mutate: mutateResourceListFunction<Question>;
    toastFunc: (success: string | null, error: any) => void;
}

const EditQuestionModal = (props: EditQuestionModalProps) => {
    const { question, course, open, setOpen, mutate, toastFunc } = props;

    const [disabled, setDisabled] = useState(true);
    const charLimit: number = 250;
    const [input, setInput] = useState({
        questionId: question.id,
        text: question.text || "",
        tags: question.tags || [],
        videoChatUrl: question.videoChatUrl,
    });
    const [charCount, setCharCount] = useState(input.text.length);
    const loading: boolean = false;

    const [tagOptions, setTagOptions] = useState<TagLabel[]>([]);
    const [tagLabels, setTagLabels] = useState<TagLabel[]>(
        question.tags
            ? question.tags.map((tag) => {
                  return { value: tag.name, label: tag.name };
              })
            : []
    );

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

        setDisabled(!isValid());
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
        setDisabled(true);
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
                    {tagOptions && tagOptions.length > 0 && (
                        <Form.Field>
                            <label htmlFor="form-question">Tags</label>
                            <Select
                                name="tags"
                                disabled={loading}
                                isClearable
                                isMulti
                                placeholder="Select tags"
                                value={tagLabels}
                                onChange={handleTagChange}
                                options={tagOptions}
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
