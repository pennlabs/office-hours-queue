import React, { useContext, MutableRefObject } from "react";
import { Grid, Message } from "semantic-ui-react";
import { WSContext } from "@pennlabs/rest-live-hooks";
import StudentQueues from "./StudentQueues";
import Announcements from "../Announcements";

import {
    useQueues,
    useCourse,
    useTags,
} from "../../../hooks/data-fetching/course";
import { Announcement, Course, Queue, QuestionMap, Tag } from "../../../types";

interface StudentQueuePageProps {
    course: Course;
    queues: Queue[];
    questionmap: QuestionMap;
    play: MutableRefObject<() => void>;
    tags: Tag[];
    announcements: Announcement[];
}
const StudentQueuePage = (props: StudentQueuePageProps) => {
    const {
        course: rawCourse,
        queues: rawQueues,
        questionmap,
        play,
        tags: rawTags,
        announcements,
    } = props;
    const { data: course } = useCourse(rawCourse.id, rawCourse);
    const { data: queues, mutate } = useQueues(course!.id, rawQueues);
    const { data: tags } = useTags(rawCourse.id, rawTags);

    const { isConnected } = useContext(WSContext);

    return (
        <>
            {!isConnected && (
                <div style={{ paddingTop: "1rem" }}>
                    <Message warning>
                        You are not currently connected to OHQ. Reconnecting...
                    </Message>
                </div>
            )}
            <Announcements
                initialAnnouncements={announcements}
                courseId={course!.id}
                staff={false}
                play={play}
            />
            <Grid stackable>
                <StudentQueues
                    // course, queues, tags are non-null because
                    // key never changes and initial data are provided
                    course={course!}
                    queues={queues!}
                    tags={tags!}
                    queueMutate={mutate}
                    questionmap={questionmap}
                    play={play}
                />
            </Grid>
        </>
    );
};

export default StudentQueuePage;
