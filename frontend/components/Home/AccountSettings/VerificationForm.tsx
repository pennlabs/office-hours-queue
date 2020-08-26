import React, { useRef } from "react";
import "./VerificationModal.module.css";

import { Segment } from "semantic-ui-react";
import ReactCodeInput from "react-code-input";
import {
    validateSMS,
    resendSMSVerification,
} from "../../../hooks/data-fetching/account";

interface VerificationFormProps {
    openFunc: React.Dispatch<React.SetStateAction<boolean>>;
    toastFunc: (Toast) => void;
    mutate: any; // TODO: make this more strict
}
const VerificationForm = (props: VerificationFormProps) => {
    const codeInput = useRef(null);

    const clearInput = () => {
        if (codeInput.current.textInput[0]) {
            codeInput.current.textInput[0].focus();
        }
        codeInput.current.state.input[0] = "";
        codeInput.current.state.input[1] = "";
        codeInput.current.state.input[2] = "";
        codeInput.current.state.input[3] = "";
        codeInput.current.state.input[4] = "";
        codeInput.current.state.input[5] = "";
        codeInput.current.value = "";
    };

    const onVerify = async (code) => {
        try {
            await validateSMS(code);
            props.mutate();
            props.openFunc(false);
            props.toastFunc({
                success: true,
                message: "Phone number successfully verified",
            });
        } catch (e) {
            clearInput();
            let message;
            if (e.message.includes("Incorrect")) {
                message = "Verification code incorrect";
            } else if (e.message.includes("expired")) {
                message = "Verification code expired, please resend";
            } else {
                message = "An error occurred when verifying";
            }
            props.toastFunc({
                success: false,
                message,
            });
        }
    };

    const resendVerification = async () => {
        try {
            await resendSMSVerification();
        } catch (e) {
            props.toastFunc({
                success: false,
                message:
                    "Please wait 10 minutes before resending a verification code",
            });
        }
    };

    const handleInputChange = async (value) => {
        if (value.length === 6) {
            await onVerify(value);
        }
    };

    return (
        <>
            <Segment textAlign="center" basic>
                <ReactCodeInput
                    name="verification"
                    type="number"
                    fields={6}
                    onChange={handleInputChange}
                    ref={codeInput}
                    inputMode="numeric"
                />
            </Segment>
            <div>
                Missed your verification code?{" "}
                <a
                    role="button"
                    onClick={resendVerification}
                    style={{ cursor: "pointer" }}
                >
                    Resend
                </a>
            </div>
        </>
    );
};

export default VerificationForm;
