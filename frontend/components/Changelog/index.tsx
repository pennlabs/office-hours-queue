import React, { useEffect, useState } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import rehypeReact from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import ReactHtmlParser from "react-html-parser";

import {
    Grid,
    Checkbox,
    Header,
    Segment,
    Message,
    SemanticCOLORS,
} from "semantic-ui-react";
import { diffLines } from "diff";

type mdLine = {
    content: string;
    color: SemanticCOLORS;
};

const processor = unified()
    .use(remarkParse)
    .use(rehypeReact)
    .use(rehypeStringify);

export default function Changelog() {
    const initial: mdLine = {
        content: "LOADING...",
        color: "grey",
    };
    const [mdLine, setMdLine] = useState<mdLine[]>([initial]);
    const [showSlider, setShowSlider] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch("./changelog.md").then((md) => md.text()),
            window.localStorage.getItem("changelogsaved") == null
                ? ""
                : window.localStorage.getItem("changelogsaved")!,
        ]).then(([readIn, savedMd]) => {
            if (readIn !== savedMd) setShowSlider(true);
            const diff = diffLines(savedMd, readIn);
            const newMd: Array<mdLine> = [];
            diff.forEach((part) => {
                let lineColor: SemanticCOLORS = "grey";
                if (part.added) {
                    lineColor = "green";
                } else if (part.removed) {
                    lineColor = "red";
                }
                newMd.push({
                    content: part.value,
                    color: lineColor,
                });
            });
            setMdLine(newMd);
            window.localStorage.setItem("changelogsaved", readIn);
        });
    }, []);

    const [display, setDisplay] = useState(<div />);

    const [buttonToggle, setButtonToggle] = useState(true);

    useEffect(() => {
        if (buttonToggle) {
            setDisplay(
                <>
                    {mdLine.map((part) => (
                        <Message color={part.color}>
                            <>
                                {ReactHtmlParser(
                                    processor.processSync(part.content)
                                )}
                            </>
                        </Message>
                    ))}
                </>
            );
        } else {
            setDisplay(
                <div style={{ display: "block", padding: "1em" }}>
                    <>
                        <Message color="grey">
                            {mdLine.map(
                                (part) =>
                                    part.color !== "red" && (
                                        <div>
                                            {ReactHtmlParser(
                                                processor.processSync(
                                                    part.content
                                                )
                                            )}
                                        </div>
                                    )
                            )}
                        </Message>
                    </>
                </div>
            );
        }
    }, [buttonToggle, mdLine]);
    return (
        <Grid.Column width={13} style={{ padding: "1rem" }}>
            <Grid.Row
                style={{
                    marginTop: "1rem",
                    paddingLeft: "1.5em",
                    paddingTop: "1.5em",
                }}
            >
                <Grid.Column>
                    <Header as="h2">
                        <Header.Content>Change Log</Header.Content>
                    </Header>
                    {showSlider && (
                        <Segment compact>
                            <Checkbox
                                label="Show new changes"
                                checked={buttonToggle}
                                onChange={(event, data) =>
                                    setButtonToggle(
                                        data.checked ? data.checked : false
                                    )
                                }
                                slider
                            />
                        </Segment>
                    )}
                </Grid.Column>
            </Grid.Row>
            <Grid.Row style={{ marginTop: "1rem", padding: "1em" }}>
                <div
                    style={{
                        boxShadow: "0 0 2px grey",
                        padding: "1em",
                    }}
                >
                    {display}
                </div>
            </Grid.Row>
        </Grid.Column>
    );
}

export function loadInformation() {}
