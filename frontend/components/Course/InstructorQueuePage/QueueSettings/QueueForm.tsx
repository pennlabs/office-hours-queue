import React, { useState, useEffect } from "react";
import { Form, Button, Modal } from "semantic-ui-react";
// import { gql } from 'apollo-boost';
// import { useMutation } from '@apollo/react-hooks';
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";

/* GRAPHQL QUERIES/MUTATIONS */
// const UPDATE_QUEUE = gql`
//   mutation UpdateQueue($input: UpdateQueueInput!) {
//     updateQueue(input: $input) {
//       queue {
//         id
//       }
//     }
//   }
// `;

const QueueForm = props => {
    /* GRAPHQL QUERIES/MUTATIONS */
    const [updateQueue, { loading }] = useMutation(UPDATE_QUEUE);

    /* STATE */
    const [success, setSuccess] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const [error, setError] = useState(false);
    const [queue, setQueue] = useState(props.queue);
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState({
        name: queue.name,
        description: queue.description,
        queueId: queue.id,
    });
    const [nameCharCount, setNameCharCount] = useState(input.name.length);
    const [descCharCount, setDescCharCount] = useState(
        input.description.length
    );

    /* HANDLER FUNCTIONS */
    const handleInputChange = (e, { name, value }) => {
        if (name === "description" && value.length > 500) return;
        if (name === "name" && value.length > 100) return;
        input[name] = value;
        setInput(input);
        setDescCharCount(input.description.length);
        setNameCharCount(input.name.length);
        setDisabled(
            !input.name ||
                !input.description ||
                (input.name === queue.name &&
                    input.description === queue.description)
        );
    };

    const onSubmit = async () => {
        try {
            await updateQueue({
                variables: {
                    input: input,
                },
            });
            await props.refetch();
            setSuccess(true);
            props.backFunc();
        } catch (e) {
            setError(true);
        }
    };

    const onArchived = async () => {
        await updateQueue({
            variables: {
                input: {
                    queueId: queue.id,
                    archived: true,
                },
            },
        });
        await props.refetch();
        setOpen(false);
        props.backFunc();
    };

    /* PROPS UPDATE */
    useEffect(() => {
        setQueue(props.queue);
    }, [props.queue]);

    return (
        <Form>
            {queue && (
                <div>
                    <Form.Field>
                        <label>Name</label>
                        <Form.Input
                            defaultValue={input.name}
                            name="name"
                            value={input.name}
                            disabled={loading}
                            onChange={handleInputChange}
                        />
                        <div
                            style={{
                                textAlign: "right",
                                color: nameCharCount < 100 ? "" : "crimson",
                            }}
                        >
                            {"Characters: " + nameCharCount + "/100"}
                        </div>
                    </Form.Field>
                    <Form.Field>
                        <label>Description</label>
                        <Form.Input
                            defaultValue={input.description}
                            name="description"
                            value={input.description}
                            disabled={loading}
                            onChange={handleInputChange}
                        />
                        <div
                            style={{
                                textAlign: "right",
                                color: descCharCount < 500 ? "" : "crimson",
                            }}
                        >
                            {"Characters: " + descCharCount + "/500"}
                        </div>
                    </Form.Field>
                    <Button
                        color="blue"
                        type="submit"
                        disabled={disabled || loading}
                        loading={loading}
                        onClick={onSubmit}
                    >
                        Save
                    </Button>
                    <Modal
                        open={open}
                        trigger={
                            <Button type="submit" onClick={() => setOpen(true)}>
                                Archive
                            </Button>
                        }
                    >
                        <Modal.Header>Archive Queue</Modal.Header>
                        <Modal.Content>
                            You are about to archive this queue:{" "}
                            <b>{queue.name}</b>.
                        </Modal.Content>
                        <Modal.Actions>
                            <Button
                                content="Cancel"
                                disabled={loading}
                                onClick={() => setOpen(false)}
                            />
                            <Button
                                content="Archive"
                                onClick={onArchived}
                                disabled={loading}
                                color="red"
                            />
                        </Modal.Actions>
                    </Modal>
                </div>
            )}
            <Snackbar
                open={success}
                autoHideDuration={2000}
                onClose={() => setSuccess(false)}
            >
                <Alert severity="success" onClose={() => setSuccess(false)}>
                    <span>
                        <b>{queue.name}</b> successfully updated
                    </span>
                </Alert>
            </Snackbar>
            <Snackbar
                open={error}
                autoHideDuration={6000}
                onClose={() => setError(false)}
            >
                <Alert severity="error" onClose={() => setError(false)}>
                    <span>
                        There was an error editing <b>{queue.name}</b>
                    </span>
                </Alert>
            </Snackbar>
        </Form>
    );
};

export default QueueForm;
