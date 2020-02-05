import React from 'react';
import { Segment, Header, Grid } from 'semantic-ui-react';
import CourseForm from './CourseForm';

import { withAuthorization } from '../Session';
import { compose } from 'recompose';

class CourseSettings extends React.Component{
  render() {
    return (
      <Grid columns={3} divided="horizontally" style={{"width":"100%"}}>
        <Grid.Column width={10}>
          <Grid columns={2} padded>
            <Grid.Row>
              <Segment basic>
                <Header as="h1">
                  Course Settings
                </Header>
              </Segment>
            </Grid.Row>
            <Grid.Row>
              <Segment basic>
                <CourseForm courseId={ this.props.location.state.courseId }/>
              </Segment>
            </Grid.Row>
          </Grid>
        </Grid.Column>
      </Grid>
    );
  }
}

const condition = authUser => !!authUser;

export default compose(
  withAuthorization(condition),
)(CourseSettings);