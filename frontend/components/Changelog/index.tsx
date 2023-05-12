import React, { useEffect, useState } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import rehypeReact from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import ReactHtmlParser from "react-html-parser";

import { Grid, Checkbox, Header, Segment } from "semantic-ui-react";
import { diffLines } from "diff";
import { CHANGELOG_TOKEN } from "../../constants";
import readIn from "./changelogfile.md";

type mdLine = {
    content: string;
    color: string;
};

const processor = unified()
    .use(remarkParse)
    .use(rehypeReact)
    .use(rehypeStringify);

const TRANSPARENT = "#00000000";
const GREEN = "#7CFC0070";
const RED = "#FF000070";

export default function Changelog() {
    const initial: mdLine = {
        content: "LOADING...",
        color: TRANSPARENT,
    };
    const [mdLine, setMdLine] = useState<mdLine[]>([initial]);
    const [showSlider, setShowSlider] = useState(false);

    useEffect(() => {
        const savedMd =
            window.localStorage.getItem(CHANGELOG_TOKEN) == null
                ? ""
                : window.localStorage.getItem(CHANGELOG_TOKEN);
        if (readIn !== savedMd) setShowSlider(true);
        const diff = diffLines(savedMd, readIn);
        const newMd: Array<mdLine> = [];
        diff.forEach((part) => {
            let lineColor = TRANSPARENT;
            if (part.added) {
                lineColor = GREEN;
            } else if (part.removed) {
                lineColor = RED;
            }
            newMd.push({
                content: part.value,
                color: lineColor,
            });
        });
        setMdLine(newMd);
        window.localStorage.setItem(CHANGELOG_TOKEN, readIn);
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
                            {ReactHtmlParser(
                                processor.processSync(part.content)
                            )}
                        </div>
                    ))}
                </>
            );
        } else {
            setDisplay(
                <>
                    {mdLine.map(
                        (part) =>
                            part.color !== RED && (
                                <div
                                    style={{
                                        backgroundColor: TRANSPARENT,
                                        display: "block",
                                        padding: "1em",
                                    }}
                                >
                                    {ReactHtmlParser(
                                        processor.processSync(part.content)
                                    )}
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
                    <Header as="h2">Changelog</Header>
                </Segment>
            </Grid.Row>

            <Grid.Row>
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
            </Grid.Row>
        </Grid.Column>
    );
}

export function loadInformation() {}
