import { useState } from "react";
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
    const videoChatNum = (course) => {
        if (course.requireVideoChatUrlOnQuestions) return 0;
        if (course.videoChatEnabled) return 1;
        return 2;
    };

    const [input, setInput] = useState<Partial<CreateCourse>>({
        inviteOnly: false,
        requireVideoChatUrlOnQuestions: false,
        videoChatEnabled: false,
    });
    const [check, setCheck] = useState(2);
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

    const handleVideoChatInputChange = (e, { name }) => {
        switch (name) {
            case "requireVideoChatUrlOnQuestions": {
                input[name] = true;
                input.videoChatEnabled = true;
                setInput(input);
                setCheck(videoChatNum(input));
                break;
            }
            case "videoChatEnabled": {
                input[name] = true;
                input.requireVideoChatUrlOnQuestions = false;
                setInput(input);
                setCheck(videoChatNum(input));
                break;
            }
            case "disableVideoChat": {
                input.requireVideoChatUrlOnQuestions = false;
                input.videoChatEnabled = false;
                setInput(input);
                setCheck(videoChatNum(input));
                break;
            }
            default:
        }
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
                requireVideoChatUrlOnQuestions: false,
                videoChatEnabled: false,
            });
            setCheck(2);
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
            requireVideoChatUrlOnQuestions: false,
            videoChatEnabled: false,
        });
        setCheck(2);
    };

    return (
        <Modal open={open}>
            <Modal.Header>Create New Course</Modal.Header>
            <Modal.Content>
                <CreateCourseForm
                    changeFunc={handleInputChange}
                    vcChangeFunc={handleVideoChatInputChange}
                    check={check}
                />
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
