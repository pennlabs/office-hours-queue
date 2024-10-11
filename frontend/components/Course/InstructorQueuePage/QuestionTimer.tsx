import React from "react";
import { Label } from "semantic-ui-react";

interface QuestionTimerProps {
    questionStartTime: string;
    timerStartTime: number;
}
const QuestionTimer = ({
    questionStartTime,
    timerStartTime,
}: QuestionTimerProps) => {
    const now = Date.now();
    const diff =
        timerStartTime * 60 * 1000 -
        (now - new Date(questionStartTime).getTime());
    const minutes = Math.floor(Math.abs(diff) / (1000 * 60));
    const seconds = Math.floor((Math.abs(diff) % (1000 * 60)) / 1000);

    const sign = diff < 0 ? "-" : ""; // Add a negative sign if the time difference is negative

    const formated = `${sign}${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;

    if (!questionStartTime) return null;
    return <Label color={diff < 0 ? "red" : "green"}>{formated}</Label>;
};

export default QuestionTimer;
