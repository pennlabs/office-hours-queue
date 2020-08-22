import React from "react";
import { Segment, Header, Label, Grid } from "semantic-ui-react";

// TODO: eventually implement tags on questions
const Tags = (props) => {
    const { tags } = props;

    /* HANDLER FUNCTIONS */
    const clearTags = () => {
        tags.forEach((tag) => {
            // eslint-disable-next-line no-param-reassign
            tag.isActive = false;
        });
    };

    const handleTagClick = (index) => {
        tags[index].isActive = !tags[index].isActive;
    };

    return (
        <Grid.Row>
            <Grid.Column>
                <Segment basic>
                    <Header as="h3" content="Tags (select to filter)" />
                    {tags && tags.length > 0 ? (
                        tags.map((tag, index) => (
                            <Label
                                as="a"
                                color={tag.isActive ? "blue" : "grey"}
                                onClick={() => handleTagClick(index)}
                                content={tag.name}
                            />
                        ))
                    ) : (
                        <Label color="blue" content="No Tags" />
                    )}
                    <a
                        role="button"
                        style={{
                            marginLeft: "12px",
                            textDecoration: "underline",
                            cursor: "pointer",
                        }}
                        onClick={clearTags}
                    >
                        Clear All
                    </a>
                </Segment>
            </Grid.Column>
        </Grid.Row>
    );
};

export default Tags;
