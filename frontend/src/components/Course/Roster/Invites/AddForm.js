import React, { useCallback, useState, useMemo } from 'react';
import './AddForm.css';

import { Form } from 'semantic-ui-react';
import { gql } from 'apollo-boost';
import { useDropzone } from 'react-dropzone'
import {roleOptions} from '../../../../utils/enums';
import AsyncCreatableSelect from 'react-select/async-creatable';
import {isValidEmail, useImperativeQuery} from "../../../../utils";

const INVITABLE_USERS = gql`
  query InvitableUsers($searchableName_Icontains: String, $courseId: ID!) {
    invitableUsers(searchableName_Icontains: $searchableName_Icontains, courseId: $courseId) {
      edges {
        node {
          id
          fullName
          email
        }
      }
    }
  }
`;

const AddForm = (props) => {
  const invitableUsers = useImperativeQuery(INVITABLE_USERS);
  const [values, setValues] = useState([]);

  const onDrop = useCallback(acceptedFiles => {
    // Do something with the files
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = () => {
        // Do whatever you want with the file contents
        try {
          const lines = reader.result.split('\n');
          const allNewEmails = lines.map((line) => line.split(',')[0]).filter(isValidEmail);
          const existingEmails = values.map((item) => item.value);
          const emails = Array.from(new Set(allNewEmails.concat(existingEmails)));
          const newValues = emails.map((email) => ({ label: email, value: email }));
          onChange(newValues);
        } catch (e) {
          console.log("bad format", e)
        }
      };
      reader.readAsText(file)
    })  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    // isDragAccept,
    // isDragReject,
  } = useDropzone({
    accept: 'text/csv',
    onDrop: onDrop,
  });

  const classes = ['dropzone'];
  // TODO figure out why accept is never true
  // if (isDragAccept) { classes.push('accept-dropzone') }
  // else if (isDragReject) { classes.push('reject-dropzone') }
  if (isDragActive) { classes.push('active-dropzone') }


  const promiseOptions = async (inputValue) => {
    if (inputValue.length === 0) {
      return [];
    }
    const { data } = await invitableUsers({
      searchableName_Icontains: inputValue,
      courseId: props.courseId
    });
    return data.invitableUsers.edges.map((item) => {
      return {
        label: `${item.node.fullName} (${item.node.email})`,
        value: item.node.email,
      }
    });
  };

  const formatCreateLabel = (inputValue) => {
    return (
      <div>Invite <i><b>{ inputValue }</b></i></div>
    );
  };

  const onChange = (items) => {
    setValues(items);
    props.changeFunc(undefined, {
      name: 'emails',
      value: items === null ? [] : items.map((item) => item.value),
    });
  };

  return (
    <Form>
      <div {...getRootProps({className: classes.join(' ')})}>
        <input {...getInputProps()} />
        {
          <div>
            <p>Drag and drop CSV or click to select file for bulk invitation</p>
          </div>
        }
      </div>
      <Form.Field>
        <label style={{marginTop: '10px'}}>Name or Email</label>
        <AsyncCreatableSelect
          cacheOptions
          defaultOptions
          loadOptions={promiseOptions}
          isMulti
          placeholder={'Search...'}
          isValidNewOption={isValidEmail}
          formatCreateLabel={formatCreateLabel}
          onChange={ onChange }
          value={values}
        />
      </Form.Field>
      <Form.Field>
        <label>Role</label>
        <Form.Dropdown
          name={'kind'}
          selection options={roleOptions}
          placeholder={'Role'}
          onChange={props.changeFunc}
        />
      </Form.Field>
    </Form>
  )
};

export default AddForm;
