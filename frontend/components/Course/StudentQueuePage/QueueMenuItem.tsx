import React, { useEffect, MutableRefObject } from "react";
import { Menu, Label } from "semantic-ui-react";
import { useQuestionPosition, useQuestions } from "../../../hooks/data-fetching/course";
import { Question, Queue, QuestionStatus } from "../../../types";

interface QueueMenuItemProps {
    queue: Queue;
    courseId: number;
    initialQuestions?: Question[];
    active: boolean;
    setActiveQueue: (id: number) => void;
    play: MutableRefObject<(string) => void>;
}

const QuestionNotifier = ({
    question,
    play,
    courseId,
    queue,
}: {
    question: Question;
    play: MutableRefObject<(string) => void>;
    courseId: number;
    queue: Queue;
    }) => {
    
    const [positionData, , , ,] = useQuestionPosition(
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
        if (
            positionData.position == 1
        ) {
            play.current("Your question will be answered soon");
        }
    }, [positionData.position]);

    return null;
};

export const QueueMenuItem = (props: QueueMenuItemProps) => {
    const {
        queue,
        courseId,
        initialQuestions,
        active,
        setActiveQueue,
        play,
    } = props;

    const { data: questions } = useQuestions(
        courseId,
        queue.id,
        initialQuestions || []
    );

    return (
        <>
            <Menu.Item
                style={{ wordBreak: "break-word" }}
                active={active}
                onClick={() => setActiveQueue(queue.id)}
            >
                <Label color="teal">
                    {
                        questions!.filter(
                            (q) =>
                                q.status === QuestionStatus.ACTIVE ||
                                !q.resolvedNote
                        ).length
                    }
                </Label>
                <Label color={queue.active ? "green" : "red"}>
                    {queue.active ? "Open" : "Closed"}
                </Label>
                {queue.name}
            </Menu.Item>
            {questions!.map((q) => (
                <QuestionNotifier question={q} play={play} courseId={courseId} queue={queue} key={q.id} />
            ))}
        </>
    );
};
