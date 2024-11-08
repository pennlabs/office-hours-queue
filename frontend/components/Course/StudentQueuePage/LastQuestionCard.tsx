import { Segment, Message } from "semantic-ui-react";
import { useState } from "react";
import { Course, Question } from "../../../types";
import { getFullName } from "../../../utils";
import QuestionReview from "./QuestionReview";

const LastQuestionCard = ({
    question,
    course,
}: {
    question: Question;
    course: Course;
}) => {
    const [reviewed, setReviewed] = useState(false);
    const timeString = (date) => {
        return new Date(date).toLocaleString("en-US", {
            // TODO: this isn't a good fix
            // @ts-ignore
            dateStyle: "short",
            timeStyle: "short",
        });
    };

    const formatReason = (reason) => {
        switch (reason) {
            case "NOT_HERE":
                return "Not Here";
            case "OH_ENDED":
                return "OH Ended";
            case "NOT_SPECIFIC":
                return "Not Specific";
            case "WRONG_QUEUE":
                return "Wrong Queue";
            case "MISSING_TEMPLATE":
                return "Didn't Follow Template";
            default:
                return reason;
        }
    };

    const segmentColor = (state) => {
        switch (state) {
            case "REJECTED":
                return "red";
            case "ANSWERED":
                return "green";
            default:
                return "blue";
        }
    };

    return (
        <Segment basic>
            <Segment
                padded
                attached="top"
                color={segmentColor(question.status)}
            >
                {question.status === "REJECTED" && (
                    <div>
                        The following question you asked on{" "}
                        <span>{timeString(question.timeAsked)}</span> was
                        rejected
                        {question.respondedToBy && [
                            " by ",
                            <b>{getFullName(question.respondedToBy)}</b>,
                            " on ",
                            <span>{timeString(question.timeRespondedTo)}</span>,
                        ]}
                        :
                        <br />
                        <Message error>{question.text}</Message>
                        The reason for rejection was:{" "}
                        <b>{formatReason(question.rejectedReason)}</b>
                    </div>
                )}
                {question.status === "ANSWERED" && (
                    <div>
                        The following question you asked on{" "}
                        <span>{timeString(question.timeAsked)}</span> was
                        answered
                        {question.respondedToBy && [
                            " by ",
                            <b>{getFullName(question.respondedToBy)}</b>,
                            " on ",
                            <span>{timeString(question.timeRespondedTo)}</span>,
                        ]}
                        :
                        <br />
                        <Message success>{question.text}</Message>
                    </div>
                )}
                {question.status === "WITHDRAWN" && (
                    <div>
                        You withdrew the following question that was asked on{" "}
                        <b>{timeString(question.timeAsked)}</b>:
                        <Message info>{question.text}</Message>
                    </div>
                )}
            </Segment>
            <Message
                attached="bottom"
                error={question.status === "REJECTED"}
                success={question.status === "ANSWERED"}
                info={question.status === "WITHDRAWN"}
            >
                {course.taReviews && reviewed ? (
                    <div
                        style={{
                            padding: "0.5em 0",
                        }}
                    >
                        Thank you for responding! Your feedback has been
                        recieved.
                    </div>
                ) : (
                    <>
                        <QuestionReview setReviewed={setReviewed} />
                        <br />
                    </>
                )}
                If you believe this is an error, please contact course staff!
            </Message>
        </Segment>
    );
};

export default LastQuestionCard;
