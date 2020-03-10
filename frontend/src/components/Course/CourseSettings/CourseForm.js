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

  /* STATE */
  const [defCourse, setDefCourse] = useState(props.course);
  const [input, setInput] = useState({ courseId: props.course.id });
  const [success, setSuccess] = useState(false);
  const [open, setOpen] = useState(false);

  /* HANDLER FUNCTIONS */
  const handleInputChange = (e, { name, value }) => {
    input[name] = name === "inviteOnly" ? !input[name] : value;
    setInput(input);
  };

  const onSubmit = async () => {
    await updateCourse({
      variables: {
        input: input
      }
    });
    await props.refetch();
    setSuccess(true);
  };

  const onArchived = async () => {
    await updateCourse({
      variables: {
        input: {
          courseId: defCourse.courseId,
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
      <Form.Field>
        <label>Department</label>
        <Form.Input
          defaultValue={ defCourse.department }
          name='department'
          disabled={ loading }
          onChange={ handleInputChange }/>
      </Form.Field>
      <Form.Field>
        <label>Course Code</label>
        <Form.Input
          defaultValue={ defCourse.courseCode }
          name='courseCode'
          disabled={ loading }
          onChange={ handleInputChange }/>
      </Form.Field>
      <Form.Field>
        <label>Course Title</label>
        <Form.Input
          defaultValue={ defCourse.courseTitle }
          name='courseTitle'
          disabled={ loading }
          onChange={ handleInputChange }/>
      </Form.Field>
      <Form.Field>
        <label>Year</label>
        <Form.Input
          defaultValue={ defCourse.year }
          name='year'
          disabled={ loading }
          onChange={ handleInputChange }/>
      </Form.Field>
      <Form.Field>
        <label>Semester</label>
        <Form.Dropdown
          defaultValue={ defCourse.semester }
          name="semester"
          disabled={ loading }
          selection options={ semesterOptions }
          onChange={ handleInputChange } />
      </Form.Field>
      <Form.Field>
        <label>Invite Only?</label>
        <Form.Radio
          defaultChecked={ defCourse.inviteOnly }
          name="inviteOnly"
          disabled={ loading }
          value={true} toggle
          onChange={ handleInputChange }/>
      </Form.Field>
      <Button type='submit' disabled={ loading } onClick={ onSubmit }>Submit</Button>
      <Modal open={ open }
        trigger={
          <a style={{"textDecoration":"underline", "cursor":"pointer"}}
            onClick={ () => setOpen(true) }>Archive</a>
        }>
        <Modal.Header>Archive Course</Modal.Header>
        <Modal.Content>You are about to archive this course: 
          <b>{` ${defCourse.department} ${defCourse.courseCode}`}</b>. This cannot be undone!
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
      <Snackbar open={ success } onClose={ () => setSuccess(false) }>
        <Alert severity="success" onClose={ () => setSuccess(false) }>
          <span><b>{`${defCourse.department} ${defCourse.courseCode}`}</b> has been updated!</span>
        </Alert>
      </Snackbar>
    </Form>
  );
}

export default CourseForm;
