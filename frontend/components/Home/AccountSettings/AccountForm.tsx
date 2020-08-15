import React, { useState, useContext } from "react";
import { Form, Button, Icon, Popup } from "semantic-ui-react";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import { useAccountInfo, updateUser } from "./AccountRequests";
import { AuthUserContext } from "../../../context/auth";
import VerificationModal from "./VerificationModal";
import { User } from "../../../types";

const AccountForm = () => {
    const { user: initialUser } = useContext(AuthUserContext);

    const [user, error, loading, mutate]: [
        User,
        any,
        any,
        any
    ] = useAccountInfo(initialUser);

    const [input, setInput] = useState(JSON.parse(JSON.stringify(user)));

    const [showNumber, setShowNumber] = useState(
        user.profile.smsNotificationsEnabled
    );

    const [smsOpen, setSmsOpen] = useState(false);

    const [toast, setToast] = useState({ message: "", success: true });
    const [toastOpen, setToastOpen] = useState(false);
    const [disabled, setDisabled] = useState(true);

    const isDisabled = () => {
        return (
            !input.firstName ||
            !input.lastName ||
            !input.profile.phoneNumber ||
            (input.firstName === user.firstName &&
                input.lastName === user.lastName &&
                input.profile.smsNotificationsEnabled ===
                    user.profile.smsNotificationsEnabled &&
                input.profile.phoneNumber === user.profile.phoneNumber)
        );
    };

    const handleInputChange = (e, { name, value }) => {
        if (name === "smsNotificationsEnabled") {
            input.profile[name] = !input.profile[name];
        } else if (name === "phoneNumber") {
            input.profile[name] = value;
        } else {
            input[name] = value;
        }
        setShowNumber(input.profile.smsNotificationsEnabled);
        setDisabled(isDisabled());
    };

    const onSubmit = async () => {
        try {
            await updateUser(input);
            mutate();
            setToast({
                success: true,
                message: "Your account was successfully updated",
            });
            setToastOpen(true);
            setDisabled(true);

            if (input.profile.phoneNumber !== user.profile.phoneNumber) {
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
                    defaultChecked={input.profile.smsNotificationsEnabled}
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
                        defaultValue={input.profile.phoneNumber}
                        name="phoneNumber"
                        onChange={handleInputChange}
                        action={
                            (!user.profile.smsVerified && (
                                <Button
                                    disabled={user.profile.smsVerified}
                                    color="red"
                                    content="Not Verified"
                                    icon="shield alternate"
                                    onClick={() => {
                                        setSmsOpen(true);
                                    }}
                                />
                            )) ||
                            (user.profile.smsVerified && (
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
