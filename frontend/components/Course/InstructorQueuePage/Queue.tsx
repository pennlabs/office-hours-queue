import React, { useState, useEffect } from "react";
import { Header, Label, Grid, Segment, Button } from "semantic-ui-react";
import Questions from "./Questions";
import QueueFilterForm from "./QueueFilterForm";
import ClearQueueModal from "./ClearQueueModal";
import { mutateFunction, Queue } from "../../../types";

// import UIFx from 'uifx';
// import notificationMp3 from './notification.mp3';

// const notification = new UIFx(notificationMp3);

// const GET_QUESTIONS = gql`
//   query GetQuestions($id: ID!) {
//     queue(id: $id) {
//       id
//       tags
//       queueQuestions {
//         edges {
//           node {
//             id
//             text
//             tags
//             state
//             timeAsked
//             timeStarted
//             timeAnswered
//             orderKey
//             videoChatUrl
//             askedBy {
//               id
//               preferredName
//               fullName
//               email
//             }
//             answeredBy {
//               id
//               preferredName
//             }
//           }
//         }
//       }
//     }
//   }
// `;

// const ACTIVATE_QUEUE = gql`
//   mutation ManuallyActivateQueue($input: ManuallyActivateQueueInput!) {
//     manuallyActivateQueue(input: $input) {
//       queue {
//         id
//       }
//     }
//   }
// `;

// const DEACTIVATE_QUEUE = gql`
//   mutation ManuallyDeactivateQueue($input: ManuallyDeactivateQueueInput!) {
//     manuallyDeactivateQueue(input: $input) {
//       queue {
//         id
//       }
//     }
//   }
// `;

interface QueueProps {
    queue: Queue;
    refetch: mutateFunction;
    leader: boolean;
    editFunc: () => void;
}
const Queue = (props: QueueProps) => {
    const { queue, refetch, leader, editFunc } = props;
    const { id: queueId, active } = queue;
    const pollInterval = 3000 + Math.random() * 500;

    /* STATE */
    const [questions, setQuestions] = useState([]); // TODO: useSWR()
    const [filteredQuestions, setFilteredQuestions] = useState([]); // TODO: useMemo()
    const [tags, setTags] = useState([]);
    const [filters, setFilters] = useState({ tags: [], status: null });
    const [clearModalOpen, setClearModalOpen] = useState(false);
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    const onOpen = async () => {
        await activateQueue({
            variables: {
                input: { queueId },
            },
        });
        // Update UI immediately
        setActive(true);
        await refetch();
    };

    const onClose = async () => {
        await deactivateQueue({
            variables: {
                input: {
                    queueId: props.queue.id,
                },
            },
        });
        // Update UI immediately
        setActive(false);
        await refetch();
    };

    const filter = (questions, filters) => {
        return questions.filter(question => {
            return isSubset(question.tags, filters.tags);
        });
    };

    // Returns true if l1 is a subset of l2
    const isSubset = (l1, l2) => {
        if (l2.length === 0) return true;
        return l1.filter(value => l2.includes(value)).length > 0;
    };

    const handleFilterChange = (input) => {
        setFilters(input);
        setFilteredQuestions(filter(questions, input));
    };

    if (data && data.queue) {
        const newQuestions = getQuestions(data);
        if (JSON.stringify(newQuestions) !== JSON.stringify(questions)) {
            if (!isFirstLoad && questions.length === 0) {
                // notification.play();
            }
            setQuestions(newQuestions);
            setFilteredQuestions(filter(newQuestions, filters));
        }

        if (JSON.stringify(data.queue.tags) !== JSON.stringify(tags)) {
            setTags(data.queue.tags);
        }

        !active && data.queue.queueQuestions.edges.length === 0
            ? stopPolling()
            : startPolling(pollInterval);

        if (isFirstLoad) {
            setIsFirstLoad(false);
        }
    }
    const queueQuestions = filter(questions, { tags: [] });

    return (
        <Segment basic>
            <ClearQueueModal
                open={clearModalOpen}
                queue={queue}
                refetch={refetch}
                closeFunc={() => setClearModalOpen(false)}
            />
            <Header as="h3">
                {queue.name}
                <Header.Subheader>
                    {/* <Linkify componentDecorator={linkifyComponentDecorator}> */}
                    {queue.description}
                    {/* </Linkify> */}
                </Header.Subheader>
            </Header>
            <Grid>
                <Grid.Row columns="equal">
                    <Grid.Column width={5} only="computer mobile">
                        {(queue.activeOverrideTime ||
                            queueQuestions.length !== 0) && (
                            <Label
                                content={`${queueQuestions.length} user${
                                    queueQuestions.length === 1 ? "" : "s"
                                }`}
                                color="blue"
                                icon="user"
                            />
                        )}
                        {/*
              <Label content={queue.estimatedWaitTime + " mins"} color="blue" icon="clock"/>
              */}
                    </Grid.Column>
                    <Grid.Column textAlign="right" floated="right">
                        {leader && (
                            <Button
                                size="mini"
                                content="Edit"
                                icon="cog"
                                onClick={editFunc}
                            />
                        )}
                        <Button
                            size="mini"
                            content="Close"
                            color={!active ? null : "red"}
                            disabled={
                                !active ||
                                (deactivateQueueRes &&
                                    deactivateQueueRes.loading)
                            }
                            loading={
                                deactivateQueueRes && deactivateQueueRes.loading
                            }
                            onClick={onClose}
                        />
                        <Button
                            size="mini"
                            content="Open"
                            color={active ? null : "green"}
                            disabled={
                                active ||
                                (activateQueueRes && activateQueueRes.loading)
                            }
                            loading={
                                activateQueueRes && activateQueueRes.loading
                            }
                            onClick={onOpen}
                        />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            <Grid style={{ marginTop: "-5px" }}>
                <Grid.Row columns="equal">
                    {tags.length > 0 && (
                        <Grid.Column>
                            <QueueFilterForm
                                tags={tags}
                                changeFunc={handleFilterChange}
                            />
                        </Grid.Column>
                    )}
                    {!active && questions.length > 0 && (
                        <Grid.Column
                            textAlign="right"
                            floated="right"
                            only="computer mobile"
                        >
                            <Button
                                content="Clear Queue"
                                fluid
                                size="medium"
                                basic
                                color="red"
                                onClick={() => setClearModalOpen(true)}
                            />
                        </Grid.Column>
                    )}
                </Grid.Row>
            </Grid>
            <Grid.Row columns={1}>
                <Questions
                    questions={filteredQuestions}
                    filters={filters}
                    refetch={refetch}
                    active={active}
                />
            </Grid.Row>
        </Segment>
    );
};

export default Queue;
