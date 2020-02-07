import React, { useState } from 'react';
import { Header, Label, Grid, Segment } from 'semantic-ui-react';

const Queue = (props) => {
  const [queue, setQueue] = useState(props.queue);

  return (
    <Segment basic>
      <Header as="h3">
        { queue.name }
        <Header.Subheader>
            { queue.description }
        </Header.Subheader>
      </Header>
      <Label
        content={ 5 + " users" }
        color="blue"
        icon="user"
      />
      <Label content="30 mins" color="blue" icon="clock"/>
      <Label as="a"
        content="Edit"
        color="grey"
        icon="cog"
        onClick={ props.editFunc }
      />
      <Grid.Row columns={1} padded="true">
          {/* map on questions */}
      </Grid.Row>
    </Segment>
  );
}

export default Queue;