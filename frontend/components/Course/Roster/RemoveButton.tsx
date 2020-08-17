import React, { useState } from "react";
import { Icon, Popup, Button } from "semantic-ui-react";
import {
    Membership,
    MembershipInvite,
    mutateResourceListFunction,
} from "../../../types";

interface RemoveButtonProps {
    disabled?: boolean;
    id: number;
    userName?: string;
    isInvited: boolean;
    successFunc: (userName?: string) => void;
    mutateInvites: mutateResourceListFunction<MembershipInvite>;
    mutateMemberships: mutateResourceListFunction<Membership>;
}
const RemoveButton = (props: RemoveButtonProps) => {
    const { mutateInvites, mutateMemberships } = props;
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const onSubmit = async () => {
        setLoading(true);
        if (props.isInvited) {
            await mutateInvites(props.id, null, "DELETE");
        } else {
            await mutateMemberships(props.id, null, "DELETE");
        }
        setLoading(false);
        setOpen(false);
        props.successFunc(props.userName);
    };

    const removeContent = (
        <Button
            color="red"
            content={props.isInvited ? "Revoke" : "Remove"}
            disabled={loading}
            onClick={onSubmit}
        />
    );
    const disabledContent = "Cannot remove only user in leadership role";

    return (
        <Popup
            trigger={
                <Icon
                    disabled={props.disabled || loading}
                    name="remove circle"
                    style={{ cursor: "pointer" }}
                    loading={loading}
                />
            }
            content={props.disabled ? disabledContent : removeContent}
            on={props.disabled ? "hover" : "click"}
            onClose={() => {
                setOpen(false);
            }}
            onOpen={() => {
                setOpen(true);
            }}
            open={open}
            position={props.disabled ? "left center" : "top center"}
        />
    );
};

export default RemoveButton;
