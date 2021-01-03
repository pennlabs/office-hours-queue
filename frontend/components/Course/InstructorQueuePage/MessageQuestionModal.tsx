import React, { useState } from "react";
import { Button, Form, Modal, Segment } from "semantic-ui-react";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import { Question, QuestionStatus } from "../../../types";
import { fullName } from "./QuestionCard";

interface MessageQuestionModalProps {
    question: Question;
    closeFunc: () => void;
    mutate: mutateResourceListFunction<Question>;
    open: boolean;
}

const MessageQuestionModal = (props: MessageQuestionModalProps) => {
    const { question, closeFunc, open, mutate } = props;

    const [message, setMessage] = useState("");

    return (
        <Modal open={open}>
            <Modal.Header>Quick Message</Modal.Header>
            <Modal.Content>
                <Modal.Description>
                    You are about to message{" "}
                    <b>{` ${fullName(question.askedBy)}`}</b> about their
                    question:
                    <br />
                    <Segment
                        inverted
                        color="blue"
                    >{`"${question.text}"`}</Segment>
                    <Form>
                        <Form.Field required>
                            <Form.TextArea
                                onChange={(e, { value }) => {
                                    if (value) {
                                        if (typeof value === "number") {
                                            setMessage(value.toString());
                                        } else {
                                            setMessage(value);
                                        }
                                    } else {
                                        setMessage("");
                                    }
                                }}
                                value={message}
                                placeholder="Message"
                            />
                        </Form.Field>
                    </Form>
                </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
                <Button content="Cancel" onClick={closeFunc} />
                <Button
                    content="Send"
                    disabled={message.length === 0}
                    loading={false}
                    color="green"
                    onClick={() => {
                        mutate(question.id, {
                            status: QuestionStatus.ASKED,
                            note: message,
                        });
                        closeFunc();
                    }}
                />
            </Modal.Actions>
        </Modal>
    );
};

export default MessageQuestionModal;
