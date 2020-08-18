import React, { useRef } from "react";
import "./VerificationModal.module.css";

import { Segment } from "semantic-ui-react";
import ReactCodeInput from "react-code-input";
import { validateSMS } from "../../../hooks/data-fetching/account";

const VerificationForm = (props) => {
    const codeInput = useRef();

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
            props.refetch();
            props.openFunc(false);
            props.toastFunc({
                success: true,
                message: "Phone number successfully verified",
            });
        } catch (e) {
            clearInput();
            props.toastFunc({
                success: false,
                message: e.message.includes("Incorrect")
                    ? "Verification code incorrect"
                    : e.message.includes("expired")
                    ? "Verification code expired, please resend"
                    : "An error occurred when verifying",
            });
        }
    };

    const handleInputChange = async (value) => {
        if (value.length === 6) {
            await onVerify(value);
        }
    };

    return [
        <Segment textAlign="center" basic>
            <ReactCodeInput
                type="number"
                fields={6}
                onChange={handleInputChange}
                ref={codeInput}
            />
        </Segment>,
        <div>
            Missed your verification code?{" "}
            <a
                onClick={() => {
                    /* if (!sendLoading || !verifyLoading) */
                    /*     return sendVerification(); */
                    // TODO: add resend verification code ability
                }}
                style={{ cursor: "pointer" }}
            >
                Resend
            </a>
        </div>,
    ];
};

export default VerificationForm;
