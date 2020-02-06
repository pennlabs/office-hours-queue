import React from 'react';
import { Segment, Header, Grid } from 'semantic-ui-react';
import CourseForm from './CourseForm';

const CourseSettings = (props) => {
  return (
    <Grid.Column width={13}>
      <Grid.Row>
        <Segment basic>
          <Header as="h1">
            Course Settings
          </Header>
        </Segment>
      </Grid.Row>
      <Grid.Row>
        <Segment basic>
          <CourseForm course={ props.course }/>
        </Segment>
      </Grid.Row>
    </Grid.Column>
  );
}

export default CourseSettings;