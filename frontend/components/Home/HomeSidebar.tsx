import React, { useState } from "react";

import { Segment, Menu, Grid, Image } from "semantic-ui-react";
import Link from "next/link";

import SignOutButton from "../SignOut";
import styles from "../../styles/landingpage.module.css";
import AboutModal from "../LandingPage/AboutModal";

const Sidebar = (props) => {
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
                        active={props.active === "dashboard"}
                        color="blue"
                        onClick={() => props.clickFunc("dashboard")}
                    />
                    <Menu.Item
                        style={{
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                        }}
                        name="Account Settings"
                        icon="setting"
                        active={props.active === "account_settings"}
                        color="blue"
                        onClick={() => props.clickFunc("account_settings")}
                    />
                    <SignOutButton />
                </Menu>
            </Segment>
            <div
                className={`${styles.about} ${styles["about-dashboard"]}`}
                onClick={() => setShowAboutModal(true)}
            >
                <label>Feedback</label>
            </div>
            <AboutModal
                open={showAboutModal}
                closeFunc={() => setShowAboutModal(false)}
            />
        </Grid.Column>
    );
};

export default Sidebar;
