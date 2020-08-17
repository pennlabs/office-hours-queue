import React from "react";
import { Dropdown, Popup } from "semantic-ui-react";
import { staffRoleOptions } from "../../../utils/enums";
import { Membership, mutateResourceListFunction } from "../../../types";

interface ChangeRoleDropdownProps {
    courseId: number;
    id: number;
    role: string;
    disabled: boolean;
    successFunc: () => void;
    mutate: mutateResourceListFunction<Membership>;
}
const ChangeRoleDropdown = (props) => {
    const { role, disabled, courseId, id: membershipId, mutate } = props;

    const handleInputChange = async (e, { name, value }) => {
        await mutate(membershipId, { kind: value });
        props.successFunc();
    };

    const dropdown = (
        <Dropdown
            selection
            name="role"
            disabled={disabled}
            onChange={handleInputChange}
            value={role}
            options={staffRoleOptions}
        />
    );

    return (
        <Popup
            trigger={<div>{dropdown}</div>}
            disabled={!disabled}
            content="Cannot change only user in leadership role"
            on="hover"
            position="left center"
        />
    );
};

export default ChangeRoleDropdown;
