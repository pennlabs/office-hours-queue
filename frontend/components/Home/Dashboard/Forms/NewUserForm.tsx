// TODO: figure out how to show this on first login?
// import React, { useState } from "react";
// import { Form, Button, Icon, Popup } from "semantic-ui-react";
// import { Header } from "semantic-ui-react";

// NewUserForm = (props) => {
//     const loading = false;

//     //
//     /* STATE */
//     const [input, setInput] = useState({
//         fullName: props.user.fullName,
//         preferredName: props.user.preferredName,
//         smsNotificationsEnabled: props.user.smsNotificationsEnabled,
//         phoneNumber: props.user.phoneNumber,
//     });
//     const [showNumber, setShowNumber] = useState(
//         props.user.smsNotificationsEnabled
//     );
//     const [disabled, setDisabled] = useState(true);

//     const isDisabled = () => {
//         return (
//             !input.preferredName ||
//             !input.fullName ||
//             (input.smsNotificationsEnabled && !input.phoneNumber)
//         );
//     };

//     const handleInputChange = (e, { name, value }) => {
//         input[name] = name === "smsNotificationsEnabled" ? !input[name] : value;
//         setInput(input);
//         setShowNumber(input.smsNotificationsEnabled);
//         setDisabled(isDisabled());
//     };

//     const onSubmit = async () => {
//         const newInput = {};
//         // Always include preferred name, because we are omitting it only on the UI
//         newInput.preferredName = input.preferredName;
//         if (input.fullName !== props.user.fullName) {
//             newInput.fullName = input.fullName;
//         }
//         if (
//             input.smsNotificationsEnabled !== props.user.smsNotificationsEnabled
//         ) {
//             newInput.smsNotificationsEnabled = input.smsNotificationsEnabled;
//         }
//         if (
//             input.phoneNumber !== props.user.phoneNumber &&
//             input.smsNotificationsEnabled
//         ) {
//             newInput.phoneNumber = input.phoneNumber;
//         }
//         try {
//             const result = await updateUser({
//                 variables: {
//                     input: newInput,
//                 },
//             });

//             await props.refetch();

//             props.setToast({
//                 success: true,
//                 message: "Your account was successfully updated",
//             });

//             if (
//                 result.data.updateUser.user.phoneNumber !==
//                 props.user.phoneNumber
//             ) {
//                 firebase.analytics.logEvent("sms_attempted_verification");
//                 props.setModalView("verification");
//             } else {
//                 props.closeFunc();
//             }
//         } catch (e) {
//             props.setToast({
//                 success: false,
//                 message: "There was an error updating your account",
//             });
//         }
//     };

//     return (
//         <Form>
//             <Header>Welcome to OHQ!</Header>
//             <Form.Field required>
//                 <label>Full Name</label>
//                 <Form.Input
//                     placeholder="Full Name"
//                     defaultValue={props.user.fullName}
//                     name="fullName"
//                     disabled={loading}
//                     onChange={handleInputChange}
//                 />
//             </Form.Field>
//             <Form.Field required>
//                 <label>Preferred Name</label>
//                 <Form.Input
//                     placeholder="Preferred Name"
//                     name="preferredName"
//                     disabled={loading}
//                     onChange={handleInputChange}
//                 />
//             </Form.Field>
//             <Form.Field>
//                 <Form.Checkbox
//                     name="smsNotificationsEnabled"
//                     defaultChecked={props.user.smsNotificationsEnabled}
//                     onChange={handleInputChange}
//                     label={[
//                         "Enable SMS Notifications ",
//                         <Popup
//                             trigger={<Icon name="question circle outline" />}
//                             content="Get text message alerts when you're almost up next in line!"
//                             position="top center"
//                         />,
//                     ]}
//                 />
//             </Form.Field>
//             {showNumber && (
//                 <Form.Field>
//                     <label>Cell Phone Number</label>
//                     <Form.Input
//                         placeholder="9876543210"
//                         defaultValue={props.user.phoneNumber}
//                         name="phoneNumber"
//                         onChange={handleInputChange}
//                         disabled={loading}
//                     />
//                 </Form.Field>
//             )}
//             <Button
//                 color="blue"
//                 type="submit"
//                 disabled={disabled || loading}
//                 loading={loading}
//                 onClick={onSubmit}
//             >
//                 Save
//             </Button>
//         </Form>
//     );
// };

// export default NewUserForm;
const NewUserForm = (props) => {
    return <span></span>;
};
export default NewUserForm;
