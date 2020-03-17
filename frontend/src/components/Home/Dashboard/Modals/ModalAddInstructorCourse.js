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
  const videoChatNum = (course) => {
    if (course.requireVideoChatUrlOnQuestions) return 0;
    if (course.videoChatEnabled) return 1;
    return 2;
  };

  const [open, setOpen] = useState(props.open);
  const [input, setInput] = useState({
    inviteOnly: false, 
    requireVideoChatUrlOnQuestions: false,
    videoChatEnabled: false
  });
  const [check, setCheck] = useState(2);
  const [disabled, setDisabled] = useState(true);
  const [createCourse, { data }] = useMutation(CREATE_COURSE);

  const handleInputChange = (e, { name, value }) => {
    input[name] = name === "inviteOnly" ? !input[name] : value;
    setInput(input);
    setDisabled(!input.department || !input.courseCode || !input.courseTitle ||
      !input.year || !input.semester || !input.courseUserKind);
  };

  const handleVideoChatInputChange = (e, { name }) => {
    switch (name) {
      case 'requireVideoChatUrlOnQuestions': {
        input[name] = true;
        input.videoChatEnabled = true;
        setInput(input);
        setCheck(videoChatNum(input));
        break;
      }
      case 'videoChatEnabled': {
        input[name] = true;
        input.requireVideoChatUrlOnQuestions = false;
        setInput(input);
        setCheck(videoChatNum(input));
        break;
      }
      case 'disableVideoChat': {
        input.requireVideoChatUrlOnQuestions = false;
        input.videoChatEnabled = false;
        setInput(input);
        setCheck(videoChatNum(input));
        break;
      }
    }
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
      setInput({
        inviteOnly: false, 
        requireVideoChatUrlOnQuestions: false,
        videoChatEnabled: false
      });
      setCheck(2);
      props.toastFunc(`${input.department} ${input.courseCode}`, true);
    } catch (e) {
      props.toastFunc(null, false);
    }
  };

  const onClose = () => {
    props.closeFunc();
    setInput({
      inviteOnly: false, 
      requireVideoChatUrlOnQuestions: false,
      videoChatEnabled: false
    });
    setCheck(2);
  }

  useEffect(() => {
    setOpen(props.open);
  }, [props.open]);

  return (
    <Modal open={ open }>
      <Modal.Header>Create New Course</Modal.Header>
      <Modal.Content>
        <CreateCourseForm changeFunc={ handleInputChange } vcChangeFunc={ handleVideoChatInputChange } check={ check }/>
      </Modal.Content>
      <Modal.Actions>
        <Button content="Cancel" onClick={ onClose }/>
        <Button content="Create"
          color="green"
          disabled={ disabled }
          onClick={ onSubmit }/>
      </Modal.Actions>
    </Modal>
  )
};

export default ModalAddInstructorCourse;
