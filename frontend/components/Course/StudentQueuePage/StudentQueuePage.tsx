import React, { useState } from "react";
import { Grid } from "semantic-ui-react";
import StudentQueues from "./StudentQueues";

// import { gql } from 'apollo-boost';
// import { useQuery } from '@apollo/react-hooks';
import { queueSortFunc } from "../../../utils";

/* GRAPHQL QUERIES/MUTATIONS */
// const GET_QUEUES = gql`
//   query GetQueues($id: ID!) {
//     course(id: $id) {
//       id
//       videoChatEnabled
//       requireVideoChatUrlOnQuestions
//       activeStaff {
//         user {
//           fullName
//         }
//       }
//       queues(archived: false) {
//         edges {
//           node {
//             id
//             name
//             description
//             tags
//             estimatedWaitTime
//             activeOverrideTime
//             archived
//             numberActiveQuestions
//             numberStartedQuestions
//           }
//         }
//       }
//     }
//   }
// `;

// const CURRENT_QUESTION = gql`
//   query CurrentQuestion($courseId: ID!) {
//     currentQuestion(courseId: $courseId) {
//       id
//       text
//       tags
//       videoChatUrl
//       questionsAhead
//       state
//       timeAsked
//       timeAnswered
//       timeRejected
//       timeStarted
//       timeWithdrawn
//       rejectedReason
//       rejectedReasonOther
//       rejectedBy {
//         preferredName
//       }
//       answeredBy {
//         preferredName
//       }
//       queue {
//         id
//       }
//     }
//   }
// `;

const StudentQueuePage = (props) => {
    const getQueuesRes = useQuery(GET_QUEUES, {
        variables: {
            id: props.course.id,
        },
        pollInterval: 10000 + Math.random() * 2000,
        skip: !props.course.id,
    });

    const pollInterval = 5000 + Math.random() * 500;
    const getQuestionRes = useQuery(CURRENT_QUESTION, {
        variables: {
            courseId: props.course.id,
        },
        pollInterval: pollInterval,
        skip: !props.course.id,
    });

    const [queues, setQueues] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);

    const loadQueues = (data) => {
        return data.course.queues.edges
            .map((item) => {
                return {
                    videoChatEnabled: data.course.videoChatEnabled,
                    requireVideoChatUrlOnQuestions:
                        data.course.requireVideoChatUrlOnQuestions,
                    activeStaff: data.course.activeStaff,
                    id: item.node.id,
                    name: item.node.name,
                    description: item.node.description,
                    tags: item.node.tags,
                    activeOverrideTime: item.node.activeOverrideTime,
                    estimatedWaitTime: item.node.estimatedWaitTime,
                    numberActiveQuestions: item.node.numberActiveQuestions,
                    numberStartedQuestions: item.node.numberStartedQuestions,
                };
            })
            .sort(queueSortFunc);
    };

    if (getQueuesRes.data && getQueuesRes.data.course) {
        const newQueues = loadQueues(getQueuesRes.data);
        if (JSON.stringify(newQueues) !== JSON.stringify(queues)) {
            setQueues(newQueues);
        }
    }

    if (getQuestionRes.data && getQuestionRes.data.currentQuestion) {
        const newCurrentQuestion = getQuestionRes.data.currentQuestion;
        if (
            JSON.stringify(newCurrentQuestion) !==
            JSON.stringify(currentQuestion)
        ) {
            setCurrentQuestion(newCurrentQuestion);
        }

        newCurrentQuestion.state !== "ACTIVE" &&
        newCurrentQuestion.state !== "STARTED"
            ? getQuestionRes.stopPolling()
            : getQuestionRes.startPolling(pollInterval);
    }

    return (
        <Grid stackable>
            <StudentQueues
                queues={queues}
                question={currentQuestion}
                refetch={() => {
                    getQuestionRes.refetch();
                    getQueuesRes.refetch();
                }}
            />
        </Grid>
    );
};

export default StudentQueuePage;
