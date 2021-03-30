import React, { useState } from "react";
import { Icon, Popup, Button } from "semantic-ui-react";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import { Membership, MembershipInvite } from "../../../types";

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
    const {
        disabled,
        id,
        userName,
        isInvited,
        successFunc,
        mutateInvites,
        mutateMemberships,
    } = props;
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const onSubmit = async () => {
        setLoading(true);
        if (isInvited) {
            await mutateInvites(id, null, { method: "DELETE" });
        } else {
            await mutateMemberships(id, null, { method: "DELETE" });
        }
        setLoading(false);
        setOpen(false);
        successFunc(userName);
    };

    const removeContent = (
        <Button
            color="red"
            content={isInvited ? "Revoke" : "Remove"}
            disabled={loading}
            onClick={onSubmit}
        />
    );
    const disabledContent = "Cannot remove only user in leadership role";

    return (
        <Popup
            trigger={
                <Icon
                    disabled={disabled || loading}
                    name="remove circle"
                    style={{ cursor: "pointer" }}
                    loading={loading}
                />
            }
            content={disabled ? disabledContent : removeContent}
            on={disabled ? "hover" : "click"}
            onClose={() => {
                setOpen(false);
            }}
            onOpen={() => {
                setOpen(true);
            }}
            open={open}
            position={disabled ? "left center" : "top center"}
        />
    );
};

export default RemoveButton;
