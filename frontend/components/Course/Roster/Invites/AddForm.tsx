import React, { useCallback, useState, useMemo } from "react";
// import './AddForm.css';

import { Form } from "semantic-ui-react";
// import { gql } from 'apollo-boost';
import { useDropzone } from "react-dropzone";
// import parse from 'csv-parse/lib/sync';
import { roleOptions } from "../../../../utils/enums";
import AsyncCreatableSelect from "react-select/async-creatable";
import { isValidEmail } from "../../../../utils";

// const INVITABLE_USERS = gql`
//   query InvitableUsers($searchableName_Icontains: String) {
//     invitableUsers(searchableName_Icontains: $searchableName_Icontains) {
//       edges {
//         node {
//           id
//           fullName
//           email
//         }
//       }
//     }
//   }
// `;

const AddForm = props => {
    // const invitableUsers = useImperativeQuery(INVITABLE_USERS);
    const [values, setValues] = useState([]);

    const onDrop = useCallback(acceptedFiles => {
        // Do something with the files
        acceptedFiles.forEach(file => {
            const reader = new FileReader();

            reader.onabort = () => console.log("file reading was aborted");
            reader.onerror = () => console.log("file reading has failed");
            reader.onload = () => {
                // Do whatever you want with the file contents
                try {
                    // const records = parse(reader.result);
                    const records = [];
                    const allNewEmails = records
                        .map(line => line[0])
                        .filter(isValidEmail);
                    const existingEmails = values.map(item => item.value);
                    const emails = Array.from(
                        new Set(allNewEmails.concat(existingEmails))
                    );
                    const newValues = emails.map(email => ({
                        label: email,
                        value: email,
                    }));
                    onChange(newValues);
                } catch (e) {
                    console.log("bad format", e);
                }
            };
            reader.readAsText(file);
        });
    }, []);

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        // isDragAccept,
        // isDragReject,
    } = useDropzone({
        accept: "text/csv",
        onDrop: onDrop,
    });

    const classes = ["dropzone"];
    // TODO figure out why accept is never true
    // if (isDragAccept) { classes.push('accept-dropzone') }
    // else if (isDragReject) { classes.push('reject-dropzone') }
    if (isDragActive) {
        classes.push("active-dropzone");
    }

    const existingEmails = useMemo(
        () => new Set(props.users.map(user => user.email)),
        [props.users]
    );

    const promiseOptions = async inputValue => {
        if (inputValue.length === 0) {
            return [];
        }
        const { data } = await invitableUsers({
            searchableName_Icontains: inputValue,
        });
        return data.invitableUsers.edges.map(item => {
            const existing = existingEmails.has(item.node.email);
            return {
                label: `${item.node.fullName} (${item.node.email})${
                    existing ? " already in course" : ""
                }`,
                value: item.node.email,
                disabled: existing,
            };
        });
    };

    const formatCreateLabel = inputValue => {
        return (
            <div>
                Invite{" "}
                <i>
                    <b>{inputValue}</b>
                </i>
            </div>
        );
    };

    const onChange = items => {
        setValues(items);
        props.changeFunc(undefined, {
            name: "emails",
            value: items === null ? [] : items.map(item => item.value),
        });
    };

    const onCreateOption = item => {
        if (!isValidEmail(item)) {
            props.setToast({
                open: true,
                success: false,
                message: "Can only invite valid emails",
            });
        } else if (!item.split("@")[1].endsWith("upenn.edu")) {
            props.setToast({
                open: true,
                success: false,
                message: "Can only invite upenn.edu emails",
            });
        } else {
            onChange([...values, { label: item, value: item }]);
        }
    };

    return (
        <Form>
            <Form.Field>
                <label>
                    Download a{" "}
                    <a href="/sample_users.csv" target="_blank">
                        sample CSV file
                    </a>
                </label>
                <div {...getRootProps({ className: classes.join(" ") })}>
                    <input {...getInputProps()} />
                    <div>
                        <p>
                            Drag and drop CSV or click to select file for bulk
                            invitation
                        </p>
                    </div>
                </div>
            </Form.Field>
            <Form.Field>
                <label>Name or Email</label>
                <AsyncCreatableSelect
                    cacheOptions
                    defaultOptions
                    loadOptions={promiseOptions}
                    isMulti
                    placeholder={"Search..."}
                    onCreateOption={onCreateOption}
                    isOptionDisabled={option => option.disabled}
                    formatCreateLabel={formatCreateLabel}
                    onChange={onChange}
                    value={values}
                />
            </Form.Field>
            <Form.Field>
                <label>Role</label>
                <Form.Dropdown
                    name={"kind"}
                    selection
                    options={roleOptions}
                    placeholder={"Role"}
                    onChange={props.changeFunc}
                />
            </Form.Field>
        </Form>
    );
};

export default AddForm;
