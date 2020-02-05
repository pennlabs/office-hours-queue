import React from 'react';
import { Segment, Header, Grid } from 'semantic-ui-react';
import InstructorCourses from './InstructorCourses';
import StudentCourses from './StudentCourses';

import { withAuthorization } from '../../Session';
import { compose } from 'recompose';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Grid.Column width={13}>
        <Grid padded>

          <Segment basic padded>
            <Header as="h2">
              <Header.Content>
                Student Courses
              </Header.Content>
            </Header>
          </Segment>
          <StudentCourses/>

          <Segment basic padded>
            <Header as="h2">
              <Header.Content>
                Instructor Courses
              </Header.Content>
            </Header>
          </Segment>
          <InstructorCourses/>
        </Grid>
      </Grid.Column>
    );
  }
}

const condition = authUser => !!authUser;

export default compose(
  withAuthorization(condition),
)(Dashboard);
