import { Button, ButtonProps, Form, Modal } from "semantic-ui-react";
import React from "react";

interface EditOccurrenceEventProps {
    editOccurrence: () => void;
    editEvent: () => void;
    onClose: () => void;
    title: string;
    occurrenceText?: string;
    eventText?: string;
    occurrenceButtonProps?: ButtonProps;
    eventButtonProps?: ButtonProps;
}

export const EditEventConfirmationModal = (props: EditOccurrenceEventProps) => {
    const {
        editOccurrence,
        editEvent,
        onClose,
        title,
        occurrenceText,
        eventText,
        occurrenceButtonProps,
        eventButtonProps,
    } = props;
    return (
        <Modal
            size="tiny"
            open={true}
            as={Form}
            onClose={onClose}
            centered={true}
            style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                margin: 0,
            }}
        >
            <Modal.Header>{title}</Modal.Header>
            <Modal.Content>
                <p>
                    Would you like to edit this occurrence or all occurrences?
                </p>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={onClose}>Cancel</Button>
                {/* For recurring events, show both buttons */}
                {eventText !== occurrenceText ? (
                    <>
                        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                        <Button
                            onClick={editOccurrence}
                            {...occurrenceButtonProps}
                        >
                            {occurrenceText}
                        </Button>
                        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                        <Button onClick={editEvent} {...eventButtonProps}>
                            {eventText}
                        </Button>
                    </>
                ) : (
                    /* For non-recurring events, show just one button */
                    /* eslint-disable-next-line react/jsx-props-no-spreading */
                    <Button onClick={editEvent} {...eventButtonProps}>
                        {eventText}
                    </Button>
                )}
            </Modal.Actions>
        </Modal>
    );
};
