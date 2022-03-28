import { useEffect, useState } from "react";
import { Icon, Label } from "semantic-ui-react";
import { usePlayer } from "../../../hooks/player";
import * as bellAudio from "./notification.mp3";

interface QuestionTimerProps {
    answeredTime: Date;
    timerMinutes: number;
}

const QuestionTimer = ({ answeredTime, timerMinutes }: QuestionTimerProps) => {
    const [timeUp, setTimeUp] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(timerMinutes * 60);
    const [intervalId, setIntervalId] = useState(-1);
    const [, , play] = usePlayer(bellAudio);

    const updateSeconds = () => {
        if (secondsLeft > 0) {
            setSecondsLeft((prevSecondsLeft) => prevSecondsLeft - 1);
        } else {
            setTimeUp(true);
        }
    };

    useEffect(() => {
        const id = window.setInterval(updateSeconds, 1000);
        setIntervalId(id);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (timeUp) {
            setTimeUp(false);
            play.current("Time is up");
            clearInterval(intervalId);
        }
    }, [intervalId, play, timeUp]);

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    return (
        <>
            {answeredTime && (
                <Label color={timeUp ? "red" : "green"}>
                    <Icon name="clock" />
                    {timeUp
                        ? "Time Up"
                        : `${minutes < 10 ? `0${minutes}` : minutes}:${
                              seconds < 10 ? `0${seconds}` : seconds
                          }`}
                </Label>
            )}
        </>
    );
};

export default QuestionTimer;
