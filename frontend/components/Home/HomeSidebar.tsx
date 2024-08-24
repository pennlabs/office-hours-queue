import { useState } from "react";

import { Segment, Menu, Grid, Image } from "semantic-ui-react";
import Link from "next/link";

import { useRouter } from "next/router";
import SignOutButton from "../SignOut";
import AboutModal from "../common/AboutModal";

const Sidebar = () => {
    const router = useRouter();
    const [showAboutModal, setShowAboutModal] = useState(false);

    return (
        <Grid.Column width={3}>
            <Segment basic>
                <Link href="/" as="/" legacyBehavior>
                    <Image
                        src="../../../ohq.png"
                        size="tiny"
                        style={{ marginTop: "10px", cursor: "pointer" }}
                    />
                </Link>
                <Menu vertical secondary fluid>
                    <Link href="/" as="/" legacyBehavior>
                        <Menu.Item
                            style={{
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                            }}
                            name="Dashboard"
                            icon="dashboard"
                            active={router.pathname === "/"}
                            color="blue"
                        />
                    </Link>
                    <Link href="/settings" as="/settings" legacyBehavior>
                        <Menu.Item
                            style={{
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                            }}
                            name="Account Settings"
                            icon="setting"
                            active={router.pathname === "/settings"}
                            color="blue"
                        />
                    </Link>
                    <Link href="/faq" as="/faq" legacyBehavior>
                        <Menu.Item
                            style={{
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                            }}
                            name="FAQ"
                            icon="question circle"
                            active={router.pathname === "/faq"}
                            color="blue"
                        />
                    </Link>
                    <SignOutButton />
                </Menu>
            </Segment>
            <AboutModal
                open={showAboutModal}
                closeFunc={() => setShowAboutModal(false)}
            />
        </Grid.Column>
    );
};

export default Sidebar;
