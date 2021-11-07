import React, { useEffect, useState } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import rehypeReact from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import ReactHtmlParser from "react-html-parser";

import { Grid, Checkbox, Header, Segment } from "semantic-ui-react";
import { diffLines } from "diff";

type mdLine = {
    content: string;
    color: string;
};

const processor = unified()
    .use(remarkParse)
    .use(rehypeReact)
    .use(rehypeStringify);

export default function Changelog() {
    const initial: mdLine = {
        content: "LOADING...",
        color: "#00000000",
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
                let lineColor = "#00000000";
                if (part.added) {
                    lineColor = "#7CFC0070";
                } else if (part.removed) {
                    lineColor = "#FF000070";
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
                        <div
                            style={{
                                backgroundColor: part.color,
                                display: "block",
                                padding: "1em",
                            }}
                        >
                            <>
                                {ReactHtmlParser(
                                    processor.processSync(part.content)
                                )}
                            </>
                        </div>
                    ))}
                </>
            );
        } else {
            setDisplay(
                <>
                    {mdLine.map(
                        (part) =>
                            part.color !== "#FF000070" && (
                                <div
                                    style={{
                                        backgroundColor: "#00000000",
                                        display: "block",
                                        padding: "1em",
                                    }}
                                >
                                    <>
                                        {ReactHtmlParser(
                                            processor.processSync(part.content)
                                        )}
                                    </>
                                </div>
                            )
                    )}
                </>
            );
        }
    }, [buttonToggle, mdLine]);
    return (
        <Grid.Column width={13}>
            <Grid.Row>
                <Segment basic>
                    <Header as="h2">Updates</Header>
                </Segment>
            </Grid.Row>

            <Grid.Row>
                <Segment basic>
                    {showSlider && (
                        <Segment compact basic>
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
                    {display}
                </Segment>
            </Grid.Row>
        </Grid.Column>
    );
}

export function loadInformation() {}
