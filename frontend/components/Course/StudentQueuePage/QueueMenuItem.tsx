import React from "react";
import { Menu, Label } from "semantic-ui-react";
import { useQuestions } from "../../../hooks/data-fetching/course";
import { Question, Queue, QuestionStatus } from "../../../types";

interface QueuMenuItemProps {
    queue: Queue;
    courseId: number;
    initialQuestions?: Question[];
    active: boolean;
    setActiveQueue: (id: number) => void;
}

export const QueueMenuItem = (props: QueuMenuItemProps) => {
    const { queue, courseId, initialQuestions, active, setActiveQueue } = props;

    const { data: questions } = useQuestions(
        courseId,
        queue.id,
        initialQuestions || []
    );

    return (
        <Menu.Item
            style={{ wordBreak: "break-word" }}
            active={active}
            onClick={() => setActiveQueue(queue.id)}
        >
            <Label color="teal">
                {
                    questions!.filter((q) => q.status === QuestionStatus.ACTIVE)
                        .length
                }
            </Label>
            <Label color={queue.active ? "green" : "red"}>
                {queue.active ? "Open" : "Closed"}
            </Label>
            {queue.name}
        </Menu.Item>
    );
};
