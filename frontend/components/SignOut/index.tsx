import React from "react";
import { Menu, Icon } from "semantic-ui-react";

const SignOutButton = () => {
    return (
        <Menu.Item
            style={{
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
            }}
            name="Signout"
            active={false}
            href="/api/accounts/logout/?next=/"
        >
            <Icon name="sign-out" />
            Sign Out
        </Menu.Item>
    );
};

export default SignOutButton;
