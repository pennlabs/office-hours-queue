import React, { useState } from "react";
import { Form, Button, Grid } from "semantic-ui-react";
import { roleOptions } from "../../../utils/enums";

interface RosterFormProps {
    showInviteButton: boolean;
    showShowInvitedButton: boolean;
    invitedShown: boolean;
    inviteFunc: () => void;
    showInvitedFunc: () => void;
    filterFunc: (any) => void; // TODO: restrict this
}
const RosterForm = (props: RosterFormProps) => {
    const {
        showInviteButton,
        showShowInvitedButton,
        invitedShown,
        inviteFunc,
        showInvitedFunc,
        filterFunc,
    } = props;
    const [input, setInput] = useState({
        search: "",
        role: "",
    });

    const handleInputChange = (e, { name, value }) => {
        input[name] = value.toLowerCase();
        setInput(input);
        filterFunc(input);
    };

    return (
        <Grid columns="equal" stackable>
            <Grid.Row stackable>
                <Grid.Column only="computer mobile">
                    <Form>
                        <Form.Group>
                            <Form.Field>
                                <Form.Dropdown
                                    selection
                                    clearable
                                    placeholder="Filter..."
                                    name="role"
                                    onChange={handleInputChange}
                                    options={roleOptions}
                                />
                            </Form.Field>
                            <Form.Field>
                                <Form.Input
                                    icon="search"
                                    placeholder="Search..."
                                    name="search"
                                    onChange={handleInputChange}
                                />
                            </Form.Field>
                        </Form.Group>
                    </Form>
                </Grid.Column>
                <Grid.Column textAlign="right" floated="right">
                    {showInviteButton && (
                        <Button
                            content="Invite"
                            color="blue"
                            onClick={inviteFunc}
                            icon="add user"
                        />
                    )}
                    {showShowInvitedButton && (
                        <Button
                            content={
                                invitedShown ? "Hide Invited" : "Show Invited"
                            }
                            color="grey"
                            onClick={showInvitedFunc}
                        />
                    )}
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
};

export default RosterForm;
