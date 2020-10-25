import React, { useState } from "react";
import { Container } from "semantic-ui-react";

import AboutModal from "./AboutModal";

export default function Footer() {
    const [showModal, setShowModal] = useState(false);
    return (
        <>
            <Container style={{ marginTop: "auto" }} textAlign="center">
                Made with{" "}
                <span className="icon is-small">
                    <i className="fa fa-heart" style={{ color: "red" }} />
                </span>{" "}
                by{" "}
                <a
                    href="http://pennlabs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Penn Labs
                </a>{" "}
                and{" "}
                <span
                    role="button"
                    onClick={() => setShowModal(true)}
                    style={{
                        cursor: "pointer",
                        color: "#4285f5",
                    }}
                >
                    Friends
                </span>
            </Container>
            <AboutModal
                open={showModal}
                closeFunc={() => setShowModal(false)}
            />
        </>
    );
}
