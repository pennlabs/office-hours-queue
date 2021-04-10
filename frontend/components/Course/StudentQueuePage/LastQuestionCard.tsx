import React from "react";
import { Segment, Message } from "semantic-ui-react";
import { Question } from "../../../types";
import { getFullName } from "../../../utils";

const LastQuestionCard = ({ question }: { question: Question }) => {
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
                        <b>{timeString(question.timeAsked)}</b> was rejected
                        {question.respondedToBy && [
                            " by ",
                            <b>{getFullName(question.respondedToBy)}</b>,
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
                        <b>{timeString(question.timeAsked)}</b> was answered
                        {question.respondedToBy && [
                            " by ",
                            <b>{getFullName(question.respondedToBy)}</b>,
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
                If you believe this is an error, please contact course staff!
            </Message>
        </Segment>
    );
};

export default LastQuestionCard;
