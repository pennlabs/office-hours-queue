import React from "react";
import { Container } from "semantic-ui-react";

export default function Footer() {
    return (
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
            </a>
            , Steven Bursztyn, Chris Fischer, Monal Garg, Karen Shen, and
            Marshall Vail
        </Container>
    );
}
