import { useState } from "react";
import {
    Segment,
    Message,
    Rating,
    Form,
    TextArea,
    Button,
} from "semantic-ui-react";
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

    /*
        NEW STUFF FOR TA REVIEWS
    */

    const [textReview, setTextReview] = useState("");
    const [submittedFeedback, setSubmittedFeedback] = useState(false);

    const handleRate = (rating: number) => {
        console.log(rating);
        if (rating > 3) {
            setTextReview("GOOD");
        } else if (rating > 0) {
            setTextReview("BAD");
        } else {
            setTextReview("");
        }
    };

    const handleFeedback = () => {
        setSubmittedFeedback(true);
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
                        <b>{timeString(question.timeAsked)}</b> was rejected by{" "}
                        {question.respondedToBy && (
                            <b>{getFullName(question.respondedToBy)}</b>
                        )}
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
                attached
                error={question.status === "REJECTED"}
                success={question.status === "ANSWERED"}
                info={question.status === "WITHDRAWN"}
            >
                If you believe this is an error, please contact course staff!
            </Message>
            {submittedFeedback ? (
                <Message attached>
                    <b> Thank you for your feedback! </b>
                </Message>
            ) : (
                <Message attached>
                    <b>How was your overall experience with this TA?</b>{" "}
                    <Rating
                        icon="star"
                        maxRating={5}
                        onRate={(_, { rating, maxRating }) =>
                            handleRate(Number(rating))
                        }
                        clearable
                    />
                    {textReview !== "" && (
                        <Form>
                            <br />
                            <Form.Field
                                control={TextArea}
                                label={
                                    textReview === "GOOD"
                                        ? "What did you like about this TA's feedback?"
                                        : "What could this TA have done better?"
                                }
                                placeholder="Feel free to elaborate!"
                            />
                            <Button onClick={handleFeedback}>
                                {" "}
                                Send Feedback{" "}
                            </Button>
                        </Form>
                    )}
                </Message>
            )}
        </Segment>
    );
};

export default LastQuestionCard;
