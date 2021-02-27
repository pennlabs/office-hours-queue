import React, { useState } from "react";
import { Button, Modal } from "semantic-ui-react";
import { joinCourse } from "../../../../hooks/data-fetching/dashboard";
import { useCourse } from "../../../../hooks/data-fetching/course";
import { Course } from "../../../../types";
import useSWR from "swr";


interface ModalRedirectAddCourseProps {
    signup: string;
}

const ModalRedirectAddCourse = (props: ModalRedirectAddCourseProps) => {
    const [open, setOpen] = useState(!!props.signup);
    //const [data, error, isValidating] = useCourse(Number(props.signup), {} as Course);
    const { data, error } = useSWR(`/courses/${props.signup}/`)
    const onJoin = async () => {
        setOpen(false);
        await joinCourse(props.signup);
    };

    //console.log(data, error, data?.inviteOnly);

    return (
        
        data && data?.detail !=="Not found." && !data?.inviteOnly ?
            <div>
                <Modal size="mini" open={open} setOpen={setOpen}>
                    <Modal.Header>Do you want to join this course?</Modal.Header>
                    <Modal.Content>
                        <strong>{data?.department} {data?.courseCode}:</strong> {data?.courseTitle}
                    </Modal.Content>
                    <Modal.Actions>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button
                            onClick={onJoin}
                            color="blue"
                        >Join</Button>
                    </Modal.Actions>
                </Modal>
            </div>
            : 
            <> </>
    )
    
}

export default ModalRedirectAddCourse;