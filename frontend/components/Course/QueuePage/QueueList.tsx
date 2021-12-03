import { Menu, Button } from "semantic-ui-react";
import { useMediaQuery } from "@material-ui/core";
import {
    Dispatch,
    SetStateAction,
} from "react-transition-group/node_modules/@types/react";
import { NotificationProps, QuestionMap, Queue } from "../../../types";
import { QueueMenuItem } from "./QueueMenuItem";
import { MOBILE_BP } from "../../../constants";

export enum User {
    Student,
    Instructor,
}
interface QueueListProps {
    dispQueues: Queue[];
    courseId: number;
    play: NotificationProps;
    questionmap: QuestionMap;
    selQueue: number | undefined;
    setSelQueue: Dispatch<SetStateAction<number | undefined>>;
    user: User;
    leader?: Boolean;
    createFunc?: () => void;
}
export const QueueList = (props: QueueListProps) => {
    const {
        dispQueues,
        courseId,
        play,
        questionmap,
        selQueue,
        setSelQueue,
        user,
        leader,
        createFunc,
    } = props;
    const isMobile = useMediaQuery(`(max-width: ${MOBILE_BP})`);
    return (
        <Menu
            fluid
            vertical
            style={{
                display: "flex",
                minHeight: isMobile ? "0" : "20rem",
            }}
        >
            {dispQueues.map((q) => (
                <QueueMenuItem
                    key={q.id}
                    queue={q}
                    courseId={courseId}
                    initialQuestions={questionmap[q.id]}
                    active={selQueue === q.id}
                    setActiveQueue={setSelQueue}
                    play={play}
                    user={user}
                />
            ))}
            {leader && (
                <Menu.Item
                    style={{
                        textAlign: "center",
                        marginTop: "auto",
                    }}
                >
                    <Button size="tiny" primary onClick={createFunc}>
                        Add Queue
                    </Button>
                </Menu.Item>
            )}
        </Menu>
    );
};
