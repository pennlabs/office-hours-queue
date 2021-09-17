import React, { useState } from "react";
import { Modal, Button } from "semantic-ui-react";
import { mutateResourceFunction } from "@pennlabs/rest-hooks/dist/types";
import CreateCourseForm from "../Forms/CreateCourseForm";
import { createCourse } from "../../../../hooks/data-fetching/dashboard";
import { Course, UserMembership, Toast, Kind } from "../../../../types";
import { logException } from "../../../../utils/sentry";

interface ModalAddInstructorCourseProps {
    open: boolean;
    closeFunc: () => void;
    mutate: mutateResourceFunction<UserMembership[]>;
    toastFunc: (toast: Toast) => void;
}
interface CreateCourse extends Course {
    createdRole: Kind;
}
const ModalAddInstructorCourse = (props: ModalAddInstructorCourseProps) => {
    const { open, closeFunc, mutate, toastFunc } = props;

    const [input, setInput] = useState<Partial<CreateCourse>>({
        inviteOnly: false,
    });
    const [disabled, setDisabled] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e, { name, value }) => {
        input[name] = name === "inviteOnly" ? !input[name] : value;
        setInput(input);
        setDisabled(
            !input.department ||
                !input.courseCode ||
                !input.courseTitle ||
                !input.semester ||
                !input.createdRole
        );
    };

    const onSubmit = async () => {
        try {
            setLoading(true);
            await createCourse(input);
            await mutate();
            setLoading(false);
            closeFunc();
            setInput({
                inviteOnly: false,
            });
            toastFunc({
                message: `${input.department} ${input.courseCode}`,
                success: true,
            });
        } catch (e) {
            logException(e);
            setLoading(false);
            toastFunc({ message: "Something went wrong", success: false });
        }
    };

    const onClose = () => {
        closeFunc();
        setInput({
            inviteOnly: false,
        });
    };

    return (
        <Modal open={open}>
            <Modal.Header>Create New Course</Modal.Header>
            <Modal.Content>
                <CreateCourseForm changeFunc={handleInputChange} />
            </Modal.Content>
            <Modal.Actions>
                <Button content="Cancel" disabled={loading} onClick={onClose} />
                <Button
                    content="Create"
                    color="green"
                    disabled={disabled || loading}
                    loading={loading}
                    onClick={onSubmit}
                />
            </Modal.Actions>
        </Modal>
    );
};

export default ModalAddInstructorCourse;
