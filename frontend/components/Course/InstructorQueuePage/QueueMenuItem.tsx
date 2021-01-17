import React, { useState, useRef, useEffect, MutableRefObject } from "react";
import { Menu, Label } from "semantic-ui-react";
import { useQuestions } from "../../../hooks/data-fetching/course";
import { Question, Queue, QuestionStatus } from "../../../types";

interface QueueMenuItemProps {
    queue: Queue;
    courseId: number;
    initialQuestions?: Question[];
    active: boolean;
    setActiveQueue: (id: number) => void;
    play: MutableRefObject<() => void>;
}

const QuestionNotifier = ({
    question,
    play,
}: {
    question: Question;
    play: MutableRefObject<() => void>;
}) => {
    const [resolved, setResolved] = useState(question.resolvedNote);
    useEffect(() => {
        if (!resolved && question.resolvedNote) {
            play.current();
            setResolved(true);
        }

        if (!question.resolvedNote) {
            setResolved(false);
        }
    }, [play, resolved, question.resolvedNote]);
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
            play.current();
        }
        // questions is not stale because we check for deep equality
        // eslint-disable-next-line
    }, [JSON.stringify(questions), play]);

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
                                q.status !== QuestionStatus.ACTIVE &&
                                q.resolvedNote
                        ).length
                    }
                </Label>
                <Label color={queue.active ? "green" : "red"}>
                    {queue.active ? "Open" : "Closed"}
                </Label>
                {queue.name}
            </Menu.Item>
            {questions!.map((q) => (
                <QuestionNotifier question={q} play={play} key={q.id} />
            ))}
        </>
    );
};
