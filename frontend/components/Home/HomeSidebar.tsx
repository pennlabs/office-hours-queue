import React, { useState } from "react";

import { Segment, Menu, Grid, Image } from "semantic-ui-react";
import Link from "next/link";

import { useRouter } from "next/router";
import SignOutButton from "../SignOut";
import styles from "../../styles/landingpage.module.css";
import AboutModal from "../common/AboutModal";

const Sidebar = () => {
    const router = useRouter();
    const [showAboutModal, setShowAboutModal] = useState(false);

    return (
        <Grid.Column width={3}>
            <Segment basic>
                <Link href="/">
                    <Image
                        src="../../../ohq.png"
                        size="tiny"
                        style={{ marginTop: "10px" }}
                    />
                </Link>
                <Menu vertical secondary fluid>
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
                        href="/"
                    />
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
                        href="/settings"
                    />
                    <SignOutButton />
                </Menu>
            </Segment>
            <div
                role="button"
                className={`${styles.about} ${styles["about-dashboard"]}`}
            >
                <a
                    href="https://airtable.com/shrIZxIjyAE3gOUSg"
                    target="_blank"
                >
                    <p>Feedback</p>
                </a>
            </div>
            <AboutModal
                open={showAboutModal}
                closeFunc={() => setShowAboutModal(false)}
            />
        </Grid.Column>
    );
};

export default Sidebar;
