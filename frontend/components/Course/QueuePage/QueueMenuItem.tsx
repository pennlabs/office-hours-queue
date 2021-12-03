import { useRef, useEffect } from "react";
import { Menu, Label } from "semantic-ui-react";
import { useQuestions } from "../../../hooks/data-fetching/course";
import {
    Question,
    Queue,
    QuestionStatus,
    NotificationProps,
} from "../../../types";
import { QuestionNotifier as StudentQuestionNotifier } from "../StudentQueuePage/QueueMenuItem";
import {
    QuestionNotifier as InstructorQuestionNotifier,
    NewQuestionNotifier,
} from "../InstructorQueuePage/QueueMenuItem";
import { User } from "./QueueList";

interface QueueMenuItemProps {
    queue: Queue;
    courseId: number;
    initialQuestions?: Question[];
    active: boolean;
    setActiveQueue: (id: number) => void;
    play: NotificationProps;
    user: User;
}

export const QueueMenuItem = (props: QueueMenuItemProps) => {
    const {
        queue,
        courseId,
        initialQuestions,
        active,
        setActiveQueue,
        play,
        user,
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
            play.current("A new question has been asked");
        }
        // questions is not stale because we check for deep equality
        // eslint-disable-next-line
    }, [JSON.stringify(questions), play]);

    return (
        <>
            {user == User.Instructor && (
                <NewQuestionNotifier questions={questions} play={play} />
            )}
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
            {questions!.map((q) =>
                user == User.Student ? (
                    <StudentQuestionNotifier
                        question={q}
                        play={play}
                        courseId={courseId}
                        queue={queue}
                        key={q.id}
                    />
                ) : (
                    <InstructorQuestionNotifier
                        question={q}
                        play={play}
                        key={q.id}
                    />
                )
            )}
        </>
    );
};
