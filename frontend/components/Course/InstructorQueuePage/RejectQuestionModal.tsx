import { useState } from "react";
import { Button, Form, Modal, Segment } from "semantic-ui-react";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import { Question, QuestionStatus } from "../../../types";
import { fullName } from "./QuestionCard";
import { logException } from "../../../utils/sentry";

const rejectOptions = [
    { key: "NOT_HERE", value: "NOT_HERE", text: "Not Here" },
    { key: "OH_ENDED", value: "OH_ENDED", text: "OH Ended" },
    { key: "NOT_SPECIFIC", value: "NOT_SPECIFIC", text: "Not Specific" },
    { key: "WRONG_QUEUE", value: "WRONG_QUEUE", text: "Wrong Stack" },
    {
        key: "MISSING_TEMPLATE",
        value: "MISSING_TEMPLATE",
        text: "Didn't Follow Template",
    },
    { key: "OTHER", value: "OTHER", text: "Other" },
];

interface RejectQuestionModalProps {
    question: Question;
    closeFunc: () => void;
    mutate: mutateResourceListFunction<Question>;
    open: boolean;
}
interface ReasonProps {
    rejectedReason: string | null;
    rejectedReasonOther: string | null;
}
const RejectQuestionModal = (props: RejectQuestionModalProps) => {
    const { question, closeFunc, open, mutate } = props;
    const { id: questionId } = question;
    const [input, setInput] = useState<ReasonProps>({
        rejectedReason: null,
        rejectedReasonOther: null,
    });

    const [otherDisabled, setOtherDisabled] = useState(true);
    const [rejectDisabled, setRejectDisabled] = useState(true);
    const rejectQuestion = async () =>
        mutate(questionId, {
            status: QuestionStatus.REJECTED,
            rejectedReason:
                input.rejectedReason === "OTHER"
                    ? input.rejectedReasonOther
                    : input.rejectedReason,
        });

    const handleInputChange = (e, { name, value }) => {
        input[name] = value;
        setInput(input);
        setOtherDisabled(name === "rejectedReason" && value !== "OTHER");

        if (name === "rejectedReason" && value !== "OTHER") {
            setRejectDisabled(false);
        } else if (name === "rejectedReason" && value === "OTHER") {
            setRejectDisabled(true);
        }
        if (name === "rejectedReasonOther") {
            setRejectDisabled(
                input.rejectedReasonOther === null ||
                    input.rejectedReasonOther === ""
            );
        }
    };

    const onSubmit = async () => {
        if (!input.rejectedReason) return;
        try {
            await rejectQuestion();
            closeFunc();
        } catch (e) {
            logException(e);
        }
    };

    return (
        question && (
            <Modal open={open}>
                <Modal.Header>Reject Question</Modal.Header>
                <Modal.Content>
                    <Modal.Description>
                        You are about to reject the following question from
                        <b>{` ${fullName(question.askedBy)}`}</b>:<br />
                        <Segment
                            inverted
                            color="blue"
                        >{`"${question.text}"`}</Segment>
                        <Form>
                            <Form.Field required>
                                <Form.Dropdown
                                    name="rejectedReason"
                                    placeholder="Select Reason"
                                    options={rejectOptions}
                                    selection
                                    onChange={handleInputChange}
                                />
                            </Form.Field>
                            {input.rejectedReason === "OTHER" && (
                                <Form.Field required>
                                    <Form.TextArea
                                        disabled={otherDisabled}
                                        name="rejectedReasonOther"
                                        onChange={handleInputChange}
                                        placeholder="Please add additional explanation"
                                    />
                                </Form.Field>
                            )}
                        </Form>
                    </Modal.Description>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        content="Cancel"
                        disabled={false}
                        onClick={closeFunc}
                    />
                    <Button
                        content="Reject"
                        disabled={rejectDisabled}
                        loading={false}
                        color="red"
                        onClick={onSubmit}
                    />
                </Modal.Actions>
            </Modal>
        )
    );
};

export default RejectQuestionModal;
