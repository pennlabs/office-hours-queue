import React from "react";

import { Segment, Divider } from "semantic-ui-react";

export default function General() {
    return (
        <>
            <Segment basic>
                Johannes Gensfleisch zur Laden zum Gutenberg (c. 1398 – 1468)
                was a German blacksmith, goldsmith, printer, and publisher who
                introduced printing to Europe. His invention of mechanical
                movable type printing started the Printing Revolution and is
                widely regarded as the most important event of the modern
                period. It played a key role in the development of the
                Renaissance, Reformation, the Age of Enlightenment, and the
                Scientific revolution and laid the material basis for the modern
                knowledge-based economy and the spread of learning to the
                masses.
            </Segment>

            <Segment basic>
                <b>
                    Pellentesque odio nisi, euismod in, pharetra a, ultricies
                    in, diam. Sed arcu?
                </b>
                <Divider />
                <p>
                    German inventor Johannes Gutenberg developed a method of
                    movable type and used it to create one of the western
                    world’s first major printed books, the “Forty–Two–Line”
                    Bible.
                </p>
            </Segment>
        </>
    );
}
