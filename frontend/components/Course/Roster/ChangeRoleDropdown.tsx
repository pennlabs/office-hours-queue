import React, { useState } from "react";
import { Dropdown, Popup } from "semantic-ui-react";
import { staffRoleOptions } from "../../../utils/enums";
import { changeRole } from "../CourseRequests";

const ChangeRoleDropdown = (props) => {
    const [input, setInput] = useState({ role: props.role });

    const handleInputChange = async (e, { name, value }) => {
        input[name] = value;
        setInput(input);
        await changeRole(props.courseId, props.id, value);
        await props.refetch();
        props.successFunc();
    };

    const dropdown = (
        <Dropdown
            selection
            name="role"
            disabled={props.disabled}
            onChange={handleInputChange}
            value={input.role}
            options={staffRoleOptions}
        />
    );

    return (
        <Popup
            trigger={<div>{dropdown}</div>}
            disabled={!props.disabled}
            content="Cannot change only user in leadership role"
            on="hover"
            position="left center"
        />
    );
};

export default ChangeRoleDropdown;
