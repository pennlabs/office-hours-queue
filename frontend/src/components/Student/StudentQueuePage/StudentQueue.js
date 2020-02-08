import React, { useState, useEffect } from 'react';
import { Segment, Label, Header, Grid } from 'semantic-ui-react';

const StudentQueue = (props) => {
  const [queue, setQueue] = useState(props.queue);

  useEffect(() => {
    setQueue(props.queue);
  }, [props.queue]);

  return (
    <Segment basic>
      <Header as="h3">
        { queue.name }
        <Header.Subheader>
            { queue.description }
        </Header.Subheader>
      </Header>
      <Label
        content={ "5 users" }
        color="blue"
        icon="user"
      />
      <Label content={ queue.estimatedWaitTime + " mins"} color="blue" icon="clock"/>
      <Grid.Row columns={1} padded="true">
        
      </Grid.Row>
    </Segment>
  );
}

export default StudentQueue;