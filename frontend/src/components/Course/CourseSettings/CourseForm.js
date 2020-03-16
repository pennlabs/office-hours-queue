import React, { useState, useEffect } from 'react';
import { Form, Button, Modal } from 'semantic-ui-react';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import { semesterOptions } from "../../../utils/enums";
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';

/* GRAPHQL QUERIES/MUTATIONS */
const UPDATE_COURSE = gql`
  mutation UpdateCourse($input: UpdateCourseInput!) {
    updateCourse(input: $input) {
      course {
        id
      }
    }
  }
`;

const CourseForm = (props) => {
  /* GRAPHQL QUERIES/MUTATIONS */
  const [updateCourse, { loading, data }] = useMutation(UPDATE_COURSE);

  const videoChatNum = (course) => {
    if (course.requireVideoChatUrlOnQuestions) return 0
    if (course.videoChatEnabled) return 1
    return 2
  }

  /* STATE */
  const [defCourse, setDefCourse] = useState(props.course);
  const [input, setInput] = useState({
    courseId: props.course.id,
    inviteOnly: props.course.inviteOnly,
    requireVideoChatUrlOnQuestions: props.course.requireVideoChatUrlOnQuestions,
    videoChatEnabled: props.course.videoChatEnabled 
  });
  const [check, setCheck] = useState(videoChatNum(props.course));
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);

  /* HANDLER FUNCTIONS */
  
  const handleInputChange = (e, { name, value }) => {
    input[name] =  name === "inviteOnly" ? !input[name] : value;
    setInput(input);
  };

  const handleVCInputChange = (e, { name, value }) => {
    switch (name) {
      case 'requireVideoChatUrlOnQuestions': {
        input[name] = true;
        input.videoChatEnabled = false;
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
    
  }

  const onSubmit = async () => {
    try {
      await updateCourse({
        variables: {
          input: input
        }
      });
      await props.refetch();
      setSuccess(true);
    } catch (e) {
      setError(true);
    }
  };

  const onArchived = async () => {
    await updateCourse({
      variables: {
        input: {
          courseId: input.courseId,
          archived: true
        }
      }
    });
    await props.refetch();
    setOpen(false);
  }

  useEffect(() => {
    setDefCourse(props.course);
  }, [props.course])

  return (
    <Form>
      <Form.Field required>
        <label>Department</label>
        <Form.Input
          defaultValue={ defCourse.department }
          name='department'
          disabled={ loading }
          onChange={ handleInputChange }/>
      </Form.Field>
      <Form.Field required>
        <label>Course Code</label>
        <Form.Input
          defaultValue={ defCourse.courseCode }
          name='courseCode'
          disabled={ loading }
          onChange={ handleInputChange }/>
      </Form.Field>
      <Form.Field required>
        <label>Course Title</label>
        <Form.Input
          defaultValue={ defCourse.courseTitle }
          name='courseTitle'
          disabled={ loading }
          onChange={ handleInputChange }/>
      </Form.Field>
      <Form.Field required>
        <label>Year</label>
        <Form.Input
          defaultValue={ defCourse.year }
          name='year'
          disabled={ loading }
          onChange={ handleInputChange }/>
      </Form.Field>
      <Form.Field required>
        <label>Semester</label>
        <Form.Dropdown
          defaultValue={ defCourse.semester }
          name="semester"
          disabled={ loading }
          selection options={ semesterOptions }
          onChange={ handleInputChange } />
      </Form.Field>
      <Form.Field required>
        <label>Video Chat</label>
        <Form.Radio
          label="Require Link"
          checked={ check === 0 }
          name="requireVideoChatUrlOnQuestions"
          disabled={ loading }
          onChange={ handleVCInputChange }/>
        <Form.Radio
          label="Allow Link"
          checked={ check === 1 }
          name="videoChatEnabled"
          disabled={ loading }
          onChange={ handleVCInputChange }/>
        <Form.Radio
          label="No Link"
          checked={ check === 2 }
          name="disableVideoChat"
          disabled={ loading }
          onChange={ handleVCInputChange }/>
      </Form.Field>
      <Form.Field required>
        <label>Invite Only?</label>
        <Form.Radio
          defaultChecked={ defCourse.inviteOnly }
          name="inviteOnly"
          disabled={ loading }
          toggle
          onChange={ handleInputChange }/>
      </Form.Field required>
      <Button color='blue' type='submit' disabled={ loading } onClick={ onSubmit }>Submit</Button>
      <Modal open={ open }
        trigger={
          <a style={{"textDecoration":"underline", "cursor":"pointer"}}
            onClick={ () => setOpen(true) }>Archive</a>
        }>
        <Modal.Header>Archive Course</Modal.Header>
        <Modal.Content>
          You are about to archive <b>{ defCourse.department } { defCourse.courseCode }</b>.
        </Modal.Content>
        <Modal.Actions>
          <Button content="Cancel"
            disabled={ loading }
            onClick={ () => setOpen(false) }/>
          <Button content="Archive"
            onClick={ onArchived }
            disabled={ loading }
            color="red"/>
        </Modal.Actions>
      </Modal>
      <Snackbar open={ success } autoHideDuration={6000} onClose={ () => setSuccess(false) }>
        <Alert severity="success" onClose={ () => setSuccess(false) }>
          <span><b>{`${defCourse.department} ${defCourse.courseCode}`}</b> has been updated!</span>
        </Alert>
      </Snackbar>
      <Snackbar open={ error } autoHideDuration={6000} onClose={ () => setError(false) }>
        <Alert severity="error" onClose={ () => setError(false) }>
          <span>There was an error updating <b>{`${defCourse.department} ${defCourse.courseCode}`}</b>!</span>
        </Alert>
      </Snackbar>
    </Form>
  );
}

export default CourseForm;
