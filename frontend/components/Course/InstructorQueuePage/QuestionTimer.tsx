import { useEffect, useState } from "react";
import { Label } from "semantic-ui-react";
import { usePlayer } from "../../../hooks/player";
import * as bellAudio from "./notification.mp3";

interface QuestionTimerProps {
    answeredTime: Date;
    // will be numerical value of membership.timerSeconds for now
    // if membership.timerSeconds is null, then we don't create this component
    timerMinutes: number;
}

const QuestionTimer = ({ answeredTime, timerMinutes }: QuestionTimerProps) => {
    const [timeUp, setTimeUp] = useState<Boolean>(false);

    const [minutes, setMinutes] = useState(timerMinutes);
    const [seconds, setSeconds] = useState<Number>(0);
    const [, , play] = usePlayer(bellAudio);

    const [intervalID, setIntervalID] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (intervalID) {
            clearInterval(intervalID);
        }

        setIntervalID(
            setInterval(() => {
                if (answeredTime) {
                    const totalSeconds =
                        timerMinutes * 60 -
                        (new Date().getTime() - answeredTime.getTime()) / 1000;
                    if (totalSeconds > 0) {
                        setSeconds(totalSeconds % 60 >> 0);
                        setMinutes((totalSeconds - (totalSeconds % 60)) / 60);
                        if (timeUp) {
                            setTimeUp(false);
                        }
                    } else if (!timeUp) {
                        setTimeUp(true);
                        play.current("Time is up");
                        if (intervalID) {
                            clearInterval(intervalID);
                        }
                    }
                }
            }, 1000)
        );
    }, [timerMinutes, answeredTime, intervalID, timeUp, play]);

    return (
        <>
            {answeredTime && (
                <span style={{ float: "right" }}>
                    <Label color={timeUp ? "red" : "green"} size="large">
                        {timeUp
                            ? "Time Up"
                            : `${minutes < 10 ? `0${minutes}` : minutes}:${
                                  seconds < 10 ? `0${seconds}` : seconds
                              }`}
                    </Label>
                </span>
            )}
        </>
    );
};

export default QuestionTimer;
