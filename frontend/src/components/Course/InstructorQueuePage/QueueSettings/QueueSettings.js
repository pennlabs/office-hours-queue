import React, { useState, useEffect } from 'react';
import { Grid, Segment, Header, Tab } from 'semantic-ui-react';
import QueueForm from './QueueForm';
import TagForm from './TagForm';
import ScheduleForm from './ScheduleForm';

const QueueSettings = (props) => {
  /* STATE */
  const [queue, setQueue] = useState(props.queue);

  /* PROPS UPDATE */
  useEffect(() => {
    setQueue(props.queue);
  }, [props.queue]);

  return (
    <Grid.Column width={13}>
      <Grid.Row>
        <Segment basic>
          <Header as="h3">
            { "Queue Settings: " + queue.name  }
          </Header>
        </Segment>
      </Grid.Row>
      <Grid.Row>
        <Segment basic>
          <Tab menu={{ pointing: true, secondary: true }} panes={
            [{
              menuItem: "General",
              render: () => { return <QueueForm refetch={ props.refetch } queue={ queue }/> }
            }, {
              menuItem: "Tags",
              render: () => { return <TagForm refetch={ props.refetch } queue={ queue }/>}
            }, {
              menuItem: "Schedule",
              render: () => {return <ScheduleForm/>}
            }]}/>
        </Segment>
      </Grid.Row>
    </Grid.Column>
  );
};

export default QueueSettings;
