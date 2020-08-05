import React, { useState } from "react";
import { Modal, Button } from "semantic-ui-react";
import AddStudentForm from "../Forms/AddStudentForm";
// import {gql} from "apollo-boost";
// import {useMutation} from "@apollo/react-hooks";
//
// const JOIN_COURSES = gql`
//   mutation JoinCourse($input: JoinCoursesInput!) {
//     joinCourses(input: $input) {
//       courseUsers {
//         id
//         kind
//       }
//     }
//   }
// `;
//
const ModalAddStudentCourse = (props) => {
    const [joinCourses, { loading }] = useMutation(JOIN_COURSES);
    const [input, setInput] = useState({ courseIds: [] });
    const [disabled, setDisabled] = useState(true);

    const handleInputChange = (e, { name, value }) => {
        input[name] = value;
        setInput(input);
        setDisabled(input.courseIds.length === 0);
    };

    const joinFunc = async () => {
        if (input.courseIds.length === 0) {
            return;
        }
        await joinCourses({
            variables: {
                input: {
                    courseIds: input.courseIds,
                },
            },
        });
        props.refetch();
        props.closeFunc();
        props.successFunc(true); // trigger snackbar
    };

    return (
        <Modal open={props.open}>
            <Modal.Header>Join Courses</Modal.Header>
            <Modal.Content>
                <AddStudentForm
                    allCourses={props.allCourses}
                    changeFunc={handleInputChange}
                />
            </Modal.Content>
            <Modal.Actions>
                <Button
                    content="Cancel"
                    disabled={loading}
                    onClick={props.closeFunc}
                />
                <Button
                    content="Join"
                    color="blue"
                    disabled={loading || disabled}
                    loading={loading}
                    onClick={joinFunc}
                />
            </Modal.Actions>
        </Modal>
    );
};

export default ModalAddStudentCourse;
