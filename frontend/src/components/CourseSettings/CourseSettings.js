import React from 'react';
import { Segment, Header, Grid } from 'semantic-ui-react';
import Sidebar from '../Sidebar';
import CourseForm from './CourseForm';

import { withAuthorization } from '../Session';
import { compose } from 'recompose';

class CourseSettings extends React.Component{
      render() {
        return (
          <Grid columns={2} divided="horizontally" style={{"width":"100%"}}>
            <Sidebar active={'course_settings'}/>
            <Grid.Column width={13}>
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
                    <CourseForm courseId="Q291cnNlTm9kZTo2ZDlhYjI1Ny1jYTUzLTRmMDQtYTdhYi05NTIxNjQ0YmRkOTU="/>
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