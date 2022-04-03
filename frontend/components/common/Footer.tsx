import Link from "next/link";
import { useState } from "react";
import { Container } from "semantic-ui-react";

import AboutModal from "./AboutModal";
import Feedback from "./Feedback";

interface FooterProps {
    showFeedback?: boolean;
}

export default function Footer({ showFeedback }: FooterProps) {
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
                &{" "}
                <span
                    role="button"
                    onClick={() => setShowModal(true)}
                    style={{
                        cursor: "pointer",
                        color: "#4285f5",
                    }}
                >
                    Friends
                </span>{" "}
                |{" "}
                <Link href="/changelog">
                    <a>Changelog</a>
                </Link>
                {showFeedback && (
                    <div role="button" style={{ marginTop: "8px" }}>
                        <Feedback />
                    </div>
                )}
            </Container>
            <AboutModal
                open={showModal}
                closeFunc={() => setShowModal(false)}
            />
        </>
    );
}
