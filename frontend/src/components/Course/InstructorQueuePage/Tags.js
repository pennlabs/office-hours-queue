import React, { useState, useEffect } from 'react';
import { Segment, Header, Label, Grid } from 'semantic-ui-react';

const Tags = (props) => {
  /* STATE */
  const [tags, setTags] = useState(props.tags);

  /* HANDLER FUNCTIONS */
  const clearTags = () => {
    var newTags = tags;
    newTags.map((tag) => {
      tag.isActive = false;
    });
    setTags(newTags);
  }

  const handleTagClick = (index) => {
    var newTags = tags;
    newTags[index].isActive = !newTags[index].isActive;
    setTags(newTags);
  }

  /* PROPS UPDATE */
  useEffect(() => {
    setTags(props.tags);
  }, [props.tags]);

  return (
    <Grid.Row>
      <Grid.Column>
      <Segment basic>
        <Header as="h3" content="Tags (select to filter)"/>
        {
          tags && tags.length > 0 ? tags.map((tag, index) => (
            <Label
              as="a"
              color={ tag.isActive ? "blue" : ""}
              onClick={ () => handleTagClick(index) }
              content = { tag.name }/>
          )) : <Label color="blue" content="No Tags"/>
        }
        <a style={{
            "marginLeft":"12px",
            "textDecoration":"underline",
            "cursor":"pointer"
          }}
          onClick={ clearTags }>Clear All</a>
      </Segment>
      </Grid.Column>
    </Grid.Row>
  );
}

export default Tags;