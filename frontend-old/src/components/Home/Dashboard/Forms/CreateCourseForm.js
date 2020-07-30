import React, { useState, useEffect } from 'react';
import '../../../Course/CourseSettings/CourseForm.css'

import { Form } from 'semantic-ui-react';
import { semesterOptions } from "../../../../utils/enums";

const CreateCourseForm = (props) => {
  const [check, setCheck] = useState(props.check);

  useEffect(() => {
    setCheck(props.check)
  }, [props.check]);

  return (
    <Form>
      <Form.Field required>
        <label>Department</label>
        <Form.Input className={'department-input'} name="department" onChange={ props.changeFunc } placeholder="CIS"/>
      </Form.Field>
      <Form.Field required>
        <label>Course Code</label>
        <Form.Input name="courseCode" onChange={ props.changeFunc } placeholder="121"/>
      </Form.Field>
      <Form.Field required>
        <label>Course Title</label>
        <Form.Input name="courseTitle" onChange={ props.changeFunc } placeholder="Data Structures and Algorithms"/>
      </Form.Field>
      {
        // <Form.Field>
        //   <label>Description</label>
        //   <Form.TextArea name="description" onChange={props.changeFunc} placeholder="(Optional)"/>
        // </Form.Field>
      }
      <Form.Field required>
        <label>Year</label>
        <Form.Input name="year" type="number" onChange={ props.changeFunc } placeholder="2020"/>
      </Form.Field>
      <Form.Field required>
        <label>Semester</label>
        <Form.Dropdown
          name="semester"
          onChange={ props.changeFunc }
          selection
          placeholder={ "Semester" }
          options={ semesterOptions }/>
      </Form.Field>
      <Form.Field required>
        <label>Video Chat</label>
        <Form.Radio
          label="Require Link"
          checked={ check === 0 }
          name="requireVideoChatUrlOnQuestions"
          onChange={ props.vcChangeFunc }/>
        <Form.Radio
          label="Allow Link"
          checked={ check === 1 }
          name="videoChatEnabled"
          onChange={ props.vcChangeFunc }/>
        <Form.Radio
          label="No Link"
          checked={ check === 2 }
          name="disableVideoChat"
          onChange={ props.vcChangeFunc }/>
      </Form.Field>
      <Form.Field required>
        <label>Invite Only?</label>
        <Form.Radio name="inviteOnly" onChange={ props.changeFunc } toggle/>
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
          }]}
          placeholder="Role"/>
      </Form.Field>
    </Form>
  );
};

export default CreateCourseForm;