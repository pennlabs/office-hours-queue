import React, { useState, useContext } from "react";
import { Form, Button, Icon, Popup } from "semantic-ui-react";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import { useAccountInfo, updateUser, User } from "./AccountRequests";
import { AuthUserContext } from "../../../context/auth";
import VerificationModal from "./VerificationModal";

const AccountForm = () => {
    const { user: initialUser } = useContext(AuthUserContext);

    const [user, error, loading, mutate]: [
        User,
        any,
        any,
        any
    ] = useAccountInfo(initialUser);

    const [input, setInput] = useState({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        smsNotificationsEnabled: user.smsNotificationsEnabled,
        phoneNumber: user.phoneNumber,
    });

    const [showNumber, setShowNumber] = useState(user.smsNotificationsEnabled);

    const [smsOpen, setSmsOpen] = useState(false);

    const [toast, setToast] = useState({ message: "", success: true });
    const [toastOpen, setToastOpen] = useState(false);
    const [disabled, setDisabled] = useState(true);

    const isDisabled = () => {
        return (
            !input.firstName ||
            !input.lastName ||
            (input.smsNotificationsEnabled && !input.phoneNumber) ||
            (input.firstName === user.firstName &&
                input.lastName === user.lastName &&
                input.smsNotificationsEnabled ===
                    user.smsNotificationsEnabled &&
                input.phoneNumber === user.phoneNumber)
        );
    };

    const handleInputChange = (e, { name, value }) => {
        input[name] = name === "smsNotificationsEnabled" ? !input[name] : value;
        setInput(input);
        setShowNumber(input.smsNotificationsEnabled);
        setDisabled(isDisabled());
    };

    const onSubmit = async () => {
        const newInput = {};
        if (input.firstName !== user.firstName) {
            newInput.firstName = input.firstName;
        }
        if (input.lastName !== user.lastName) {
            newInput.lastName = input.lastName;
        }
        if (input.smsNotificationsEnabled !== user.smsNotificationsEnabled) {
            newInput.smsNotificationsEnabled = input.smsNotificationsEnabled;
        }
        if (
            input.phoneNumber !== user.phoneNumber &&
            input.smsNotificationsEnabled
        ) {
            newInput.phoneNumber = input.phoneNumber;
        }
        try {
            await updateUser(newInput);
            mutate();
            setToast({
                success: true,
                message: "Your account was successfully updated",
            });
            setToastOpen(true);
            setDisabled(true);

            if (input.phoneNumber !== user.phoneNumber) {
                setSmsOpen(true);
            }
        } catch (e) {
            setToast({
                success: false,
                message: "There was an error updating your account",
            });
            setToastOpen(true);
        }
    };

    return [
        <VerificationModal
            open={smsOpen}
            toastFunc={(toast) => {
                setToast(toast);
                setToastOpen(true);
            }}
            openFunc={setSmsOpen}
            refetch={mutate}
        />,
        <Form>
            <Form.Field required>
                <label>Email Address</label>
                <Form.Input
                    defaultValue={input.email}
                    disabled
                    onChange={handleInputChange}
                />
            </Form.Field>
            <Form.Field required>
                <label>First Name</label>
                <Form.Input
                    placeholder="First Name"
                    defaultValue={input.firstName}
                    name="firstName"
                    disabled={loading}
                    onChange={handleInputChange}
                />
            </Form.Field>
            <Form.Field required>
                <label>Last Name</label>
                <Form.Input
                    placeholder="Last Name"
                    defaultValue={input.lastName}
                    name="lastName"
                    disabled={loading}
                    onChange={handleInputChange}
                />
            </Form.Field>
            <Form.Field>
                <Form.Checkbox
                    name="smsNotificationsEnabled"
                    defaultChecked={input.smsNotificationsEnabled}
                    onChange={handleInputChange}
                    label={[
                        "Enable SMS Notifications ",
                        <Popup
                            trigger={<Icon name="question circle outline" />}
                            content="Get text message alerts when you're almost up next in line!"
                            position="top center"
                        />,
                    ]}
                />
            </Form.Field>
            {showNumber && (
                <Form.Field>
                    <label>Cell Phone Number</label>
                    <Form.Input
                        placeholder="9876543210"
                        defaultValue={input.phoneNumber}
                        name="phoneNumber"
                        onChange={handleInputChange}
                        action={
                            (!user.smsVerified && (
                                <Button
                                    disabled={user.smsVerified}
                                    color="red"
                                    content="Not Verified"
                                    icon="shield alternate"
                                    onClick={() => {
                                        setSmsOpen(true);
                                    }}
                                />
                            )) ||
                            (user.smsVerified && (
                                <Button
                                    color="green"
                                    content="Verified"
                                    icon="shield alternate"
                                />
                            ))
                        }
                        disabled={loading}
                    />
                </Form.Field>
            )}
            <Button
                color="blue"
                type="submit"
                disabled={disabled || loading}
                loading={loading}
                onClick={onSubmit}
            >
                Save
            </Button>
            <Snackbar
                open={toastOpen}
                autoHideDuration={6000}
                onClose={() => setToastOpen(false)}
            >
                <Alert
                    severity={toast.success ? "success" : "error"}
                    onClose={() => setToastOpen(false)}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </Form>,
    ];
};

export default AccountForm;
