import { useState } from "react";

import { Segment, Menu, Grid, Image } from "semantic-ui-react";
import Link from "next/link";
import { useMediaQuery } from "@material-ui/core";

import { useRouter } from "next/router";
import SignOutButton from "../SignOut";
import styles from "../../styles/landingpage.module.css";
import AboutModal from "../common/AboutModal";
import Feedback from "../common/Feedback";
import { MOBILE_BP } from "../../constants";

const Sidebar = () => {
    const router = useRouter();
    const [showAboutModal, setShowAboutModal] = useState(false);
    const isMobile = useMediaQuery(`(max-width: ${MOBILE_BP})`);

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
            {!isMobile && (
                <div role="button" className={`${styles["about-dashboard"]}`}>
                    <Feedback />
                </div>
            )}
            <AboutModal
                open={showAboutModal}
                closeFunc={() => setShowAboutModal(false)}
            />
        </Grid.Column>
    );
};

export default Sidebar;
