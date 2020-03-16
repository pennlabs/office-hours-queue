import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'semantic-ui-react';
import CreateCourseForm from '../Forms/CreateCourseForm';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';

const CREATE_COURSE = gql`
  mutation CreateCourse($input: CreateCourseInput!) {
    createCourse(input: $input) {
      course {
        id
      }
      courseUser {
        id
      }
    }
  }
`;

const ModalAddInstructorCourse = (props) => {
  const [open, setOpen] = useState(props.open);
  const [input, setInput] = useState({ inviteOnly: false });
  const [disabled, setDisabled] = useState(true);
  const [createCourse, { data }] = useMutation(CREATE_COURSE);

  const handleInputChange = (e, { name, value }) => {
    input[name] = name === "inviteOnly" ? !input[name] : value;
    setInput(input);
    setDisabled(!input.department || !input.courseCode || !input.courseTitle ||
      !input.year || !input.semester || !input.courseUserKind);
  };

  const onSubmit = async () => {
    if (!input.department || !input.courseCode || !input.courseTitle ||
        !input.year || !input.semester || !input.courseUserKind) return;

    try {
      await createCourse({
        variables: {
          input: input
        }
      });
      await props.refetch();
      props.closeFunc();
      props.toastFunc(`${input.department} ${input.courseCode}`, true);
    } catch (e) {
      props.toastFunc(null, false);
    }
  };

  useEffect(() => {
    setOpen(props.open);
  }, [props.open]);

  return (
    <Modal open={ open }>
      <Modal.Header>Create New Course</Modal.Header>
      <Modal.Content>
        <CreateCourseForm changeFunc={ handleInputChange }/>
      </Modal.Content>
      <Modal.Actions>
        <Button content="Cancel" onClick={ props.closeFunc }/>
        <Button content="Create"
          color="green"
          disabled={ disabled }
          onClick={ onSubmit }/>
      </Modal.Actions>
    </Modal>
  )
};

export default ModalAddInstructorCourse;
