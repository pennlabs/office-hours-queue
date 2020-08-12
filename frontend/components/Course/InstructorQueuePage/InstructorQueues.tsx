import React, { useState, useEffect } from "react";
import { Grid, Segment, Icon, Message } from "semantic-ui-react";
import Queue from "./Queue";

const InstructorQueues = props => {
    /* STATE */
    const [queues, setQueues] = useState(props.queues);
    const [leader, setLeader] = useState(props.leader);

    const numActive = () => {
        return queues.reduce((count, queue) => {
            return count + (queue.archived ? 0 : 1);
        }, 0);
    };

    /* PROPS UPDATE */
    useEffect(() => {
        setQueues(props.queues);
    }, [props.queues]);

    useEffect(() => {
        setLeader(props.leader);
    }, [props.leader]);

    return (
        queues && (
            <Grid.Row columns={2}>
                {queues.length !== 0 &&
                    queues.map(
                        queue =>
                            !queue.archived && (
                                <Grid.Column key={"column" + queue.id}>
                                    <Queue
                                        key={queue.id}
                                        queue={queue}
                                        leader={props.leader}
                                        refetch={props.refetch}
                                        editFunc={() =>
                                            props.editFunc(queue.id)
                                        }
                                        userId={props.userId}
                                    />
                                </Grid.Column>
                            )
                    )}
                {queues && numActive() < 2 && leader && (
                    <Grid.Column>
                        <Segment basic>
                            <Message info icon>
                                <Icon name="lightbulb outline" />
                                <Message.Content>
                                    <Message.Header>
                                        Create a Queue
                                    </Message.Header>
                                    <a
                                        onClick={props.createFunc}
                                        style={{ cursor: "pointer" }}
                                    >
                                        Create
                                    </a>{" "}
                                    {queues.length === 0
                                        ? "a queue to get started!"
                                        : "a second queue to augment your OHQ experience!"}
                                </Message.Content>
                            </Message>
                        </Segment>
                    </Grid.Column>
                )}
                {queues && numActive() === 0 && !leader && (
                    <Segment basic>
                        <Message info icon>
                            <Icon name="lightbulb outline" />
                            <Message.Content>
                                <Message.Header>No Queues</Message.Header>
                                This course currently has no queues! Ask the
                                course's Head TA or Professor to create one.
                            </Message.Content>
                        </Message>
                    </Segment>
                )}
            </Grid.Row>
        )
    );
};

export default InstructorQueues;
