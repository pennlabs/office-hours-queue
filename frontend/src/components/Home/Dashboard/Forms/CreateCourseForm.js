import React from 'react';
import { Form } from 'semantic-ui-react';
import { semesterOptions } from "../../../../utils/enums";

const CreateCourseForm = (props) => {
  return (
    <Form>
      <Form.Field required>
        <label>Department</label>
        <Form.Input name="department" onChange={ props.changeFunc } placeholder="CIS"/>
      </Form.Field>
      <Form.Field required>
        <label>Course Code</label>
        <Form.Input name="courseCode" onChange={ props.changeFunc } placeholder="121"/>
      </Form.Field>
      <Form.Field required>
        <label>Course Title</label>
        <Form.Input name="courseTitle" onChange={ props.changeFunc } placeholder="Data Structures and Algorithms"/>
      </Form.Field>
      <Form.Field>
        <label>Description</label>
        <Form.TextArea name="description" onChange={ props.changeFunc } placeholder="(Optional)"/>
      </Form.Field>
      <Form.Field required>
        <label>Year</label>
        <Form.Input name="year" onChange={ props.changeFunc } placeholder="2020"/>
      </Form.Field>
      <Form.Field required>
        <label>Semester</label>
        <Form.Dropdown name="semester" onChange={ props.changeFunc } selection options={ semesterOptions }/>
      </Form.Field>
      <Form.Field required>
        <label>Invite Only?</label>
        <Form.Radio name="inviteOnly" onChange={ props.changeFunc } value={true} toggle/>
      </Form.Field>
      <Form.Field required>
        <label>Your Role</label>
        <Form.Dropdown selection
          name="courseUserKind"
          onChange={ props.changeFunc }
          options={[{
            key: "PROFESSOR",
            value: "PROFESSOR",
            text: "Professor"
          }, {
            key: "HEAD_TA",
            value: "HEAD_TA",
            text: "Head TA"
          }]}/>
      </Form.Field>
    </Form>
  );
}

export default CreateCourseForm;
