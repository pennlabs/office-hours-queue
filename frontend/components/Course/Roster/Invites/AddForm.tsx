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
                <label htmlFor="form-email">Email(s)</label>

                {/* TODO: add a validation step here */}
                <Form.TextArea
                    id="form-email"
                    onChange={onChange}
                    placeholder="Separate multiple emails with line breaks or commas"
                />
            </Form.Field>
            <Form.Field>
                <label htmlFor="form-role">Role</label>
                <Form.Dropdown
                    id="form-role"
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
