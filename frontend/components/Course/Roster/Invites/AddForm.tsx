import React from "react";

import { Form } from "semantic-ui-react";
import { roleOptions } from "../../../../utils/enums";

interface AddFormProps {
    changeFunc: any; // TODO: restrict this
}
const AddForm = (props: AddFormProps) => {
    const { changeFunc } = props;
    const onChange = (text) => {
        changeFunc(undefined, {
            name: "emails",
            value: text.target.value,
        });
    };

    return (
        <Form>
            <Form.Field>
                <label>Email(s)</label>

                {/* TODO: add a validation step here */}
                <Form.TextArea onChange={onChange} />
            </Form.Field>
            <Form.Field>
                <label>Role</label>
                <Form.Dropdown
                    name="kind"
                    selection
                    options={roleOptions}
                    placeholder="Role"
                    onChange={changeFunc}
                />
            </Form.Field>
        </Form>
    );
};

export default AddForm;
