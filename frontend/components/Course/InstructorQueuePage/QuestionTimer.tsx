import React from "react";
import { Label } from "semantic-ui-react";

const QuestionTimer = ({ startTime }) => {
    const now = Date.now();
    const TATimerMaxTime = 10; // 10 minutes
    const diff =
        TATimerMaxTime * 60 * 1000 - (now - new Date(startTime).getTime());
    const minutes = Math.floor(Math.abs(diff) / (1000 * 60));
    const seconds = Math.floor((Math.abs(diff) % (1000 * 60)) / 1000);

    const sign = diff < 0 ? "-" : ""; // Add a negative sign if the time difference is negative

    const formated = `${sign}${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;

    if (!startTime) return null;
    return <Label color={diff < 0 ? "red" : "green"}>{formated}</Label>;
};

export default QuestionTimer;
