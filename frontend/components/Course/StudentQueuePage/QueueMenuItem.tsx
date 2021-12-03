import { useEffect } from "react";
import { useQuestionPosition } from "../../../hooks/data-fetching/course";
import {
    Question,
    Queue,
    QuestionStatus,
    NotificationProps,
} from "../../../types";

export const QuestionNotifier = ({
    question,
    play,
    courseId,
    queue,
}: {
    question: Question;
    play: NotificationProps;
    courseId: number;
    queue: Queue;
}) => {
    const { data: positionData } = useQuestionPosition(
        courseId,
        queue.id,
        question.id
    );
    useEffect(() => {
        if (
            question.status === QuestionStatus.ACTIVE ||
            !question.resolvedNote
        ) {
            play.current("Your question is being answered");
        }
    }, [question.status, play, question.resolvedNote]);

    useEffect(() => {
        if (positionData && positionData.position === 2) {
            play.current("Your question will be answered soon");
        }
    }, [positionData]);

    return null;
};
