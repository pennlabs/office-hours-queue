import { useState, useContext } from "react";
import { Form, Button, Icon, Popup } from "semantic-ui-react";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import { parsePhoneNumberFromString } from "libphonenumber-js/max";
import _ from "lodash";
import { AuthUserContext } from "../../../utils/auth";
import VerificationModal from "./VerificationModal";
import { User, Toast } from "../../../types";
import {
    updateUser,
    useAccountInfo,
} from "../../../hooks/data-fetching/account";

const AccountForm = () => {
    const { user: initialUser } = useContext(AuthUserContext);

    const { data: user, mutate } = useAccountInfo(initialUser);

    const [input, setInput] = useState<User>({
        ...user,
        profile: {
            smsNotificationsEnabled: user.profile.smsNotificationsEnabled,
            smsVerified: user.profile.smsVerified,
            phoneNumber: user.profile.phoneNumber ?? "",
        },
    });

    const [showNumber, setShowNumber] = useState(
        user.profile.smsNotificationsEnabled
    );

    const [smsOpen, setSmsOpen] = useState(false);

    const [toast, setToast] = useState<Toast>({ message: "", success: true });
    const [toastOpen, setToastOpen] = useState(false);
    const [disabled, setDisabled] = useState(true);

    const isDisabled = () => {
        return (
            !input.firstName ||
            !input.lastName ||
            (input.profile.smsNotificationsEnabled &&
                !input.profile.phoneNumber) ||
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
        setInput({ ...input });
        setShowNumber(input.profile.smsNotificationsEnabled);
        setDisabled(isDisabled());
    };

    const onSubmit = async () => {
        try {
            const processedInput = _.cloneDeep(input);
            if (input.profile.smsNotificationsEnabled) {
                const parsedNumber = parsePhoneNumberFromString(
                    // Phone number must not be undefined because of
                    // isDisabled check
                    input.profile.phoneNumber!,
                    "US"
                )?.number;

                if (!parsedNumber) {
                    throw new Error("Cannot parse phone number");
                }

                processedInput.profile.phoneNumber = parsedNumber as string;
                setInput(processedInput);
            }

            await updateUser(processedInput);
            mutate();
            setToast({
                success: true,
                message: "Your account was successfully updated",
            });
            setToastOpen(true);
            setDisabled(true);

            if (
                processedInput.profile.smsNotificationsEnabled &&
                processedInput.profile.phoneNumber !== user.profile.phoneNumber
            ) {
                setSmsOpen(true);
            }
        } catch (e) {
            setToast({
                success: false,
                message: e.toString(),
            });
            setToastOpen(true);
        }
    };

    return (
        <>
            <VerificationModal
                open={smsOpen}
                toastFunc={(newToast: Toast) => {
                    setToast(newToast);
                    setToastOpen(true);
                }}
                openFunc={setSmsOpen}
                mutate={mutate}
            />
            <Form>
                <Form.Field required>
                    <label htmlFor="form-email">Email Address</label>
                    <Form.Input
                        id="form-email"
                        value={input.email}
                        disabled
                        onChange={handleInputChange}
                    />
                </Form.Field>
                <Form.Field required>
                    <label htmlFor="form-first-name">First Name</label>
                    <Form.Input
                        id="form-first-name"
                        placeholder="First Name"
                        value={input.firstName}
                        name="firstName"
                        onChange={handleInputChange}
                    />
                </Form.Field>
                <Form.Field required>
                    <label htmlFor="form-last-name">Last Name</label>
                    <Form.Input
                        id="form-last-name"
                        placeholder="Last Name"
                        value={input.lastName}
                        name="lastName"
                        onChange={handleInputChange}
                    />
                </Form.Field>
                <Form.Field>
                    <Form.Checkbox
                        name="smsNotificationsEnabled"
                        checked={input.profile.smsNotificationsEnabled}
                        onChange={handleInputChange}
                        label={[
                            "Enable SMS Notifications ",
                            <Popup
                                trigger={
                                    <Icon name="question circle outline" />
                                }
                                content="Get text message alerts when you're almost up next in line!"
                                position="top center"
                            />,
                        ]}
                    />
                </Form.Field>
                {showNumber && (
                    <Form.Field>
                        <label htmlFor="form-cell-no">Cell Phone Number</label>
                        <Form.Input
                            id="form-cell-no"
                            placeholder="9876543210"
                            value={input.profile.phoneNumber}
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
                        />
                    </Form.Field>
                )}
                <Button
                    color="blue"
                    type="submit"
                    disabled={disabled}
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
            </Form>
        </>
    );
};

export default AccountForm;
