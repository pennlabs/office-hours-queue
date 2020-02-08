import React from 'react';
import { Segment, Header, Grid } from 'semantic-ui-react';
import CourseForm from './CourseForm';

const CourseSettings = (props) => {
  return (
    <div>
      {
        props.course && props.course.id &&
        <div>
        <Grid.Row>
          <Segment basic>
            <Header as="h3">
              Course Settings
            </Header>
          </Segment>
        </Grid.Row>
        <Grid.Row>
          <Segment basic>
            <CourseForm course={ props.course } refetch={ props.refetch }/>
          </Segment>
        </Grid.Row>
        </div>
      }
    </div>
  );
}

export default CourseSettings;