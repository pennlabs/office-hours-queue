import React from "react";
import { useRouter } from "next/router";
import { Menu, Icon } from "semantic-ui-react";

const SignOutButton = () => {
    const router = useRouter();
    return (
        <Menu.Item
            style={{
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
            }}
            name="Signout"
            active={false}
            onClick={() => {
                fetch("/api/accounts/logout").then(() => {
                    router.replace("/");
                    router.reload();
                });
            }}
        >
            <Icon name="sign-out" />
            Sign Out
        </Menu.Item>
    );
};

export default SignOutButton;
