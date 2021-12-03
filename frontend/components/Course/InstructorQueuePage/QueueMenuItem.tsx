import { useState, useRef, useEffect } from "react";
import { Question, Queue, NotificationProps } from "../../../types";

interface QueueMenuItemProps {
    queue: Queue;
    courseId: number;
    initialQuestions?: Question[];
    active: boolean;
    setActiveQueue: (id: number) => void;
    play: NotificationProps;
}

export const QuestionNotifier = ({
    question,
    play,
}: {
    question: Question;
    play: NotificationProps;
}) => {
    const [resolved, setResolved] = useState(question.resolvedNote);
    useEffect(() => {
        if (!resolved && question.resolvedNote) {
            play.current("A question has been edited");
            setResolved(true);
        }

        if (!question.resolvedNote) {
            setResolved(false);
        }
    }, [play, resolved, question.resolvedNote]);
    return null;
};

export const NewQuestionNotifier = ({
    questions,
    play,
}: {
    questions: Question[] | undefined;
    play: NotificationProps;
}) => {
    const latestAsked = useRef(
        questions && questions[0]?.timeAsked
            ? new Date(questions[0].timeAsked)
            : new Date(0)
    );
    useEffect(() => {
        if (
            questions &&
            questions[0] &&
            new Date(questions[questions.length - 1].timeAsked) >
                latestAsked.current
        ) {
            latestAsked.current = new Date(
                questions[questions.length - 1].timeAsked
            );
            play.current("A new question has been asked");
        }
        // questions is not stale because we check for deep equality
        // eslint-disable-next-line
    }, [JSON.stringify(questions), play]);
    return null;
};
