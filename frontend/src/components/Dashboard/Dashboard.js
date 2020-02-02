import React from 'react';
import { Segment, Header, Grid } from 'semantic-ui-react';
import ArchivedCourseCard from './ArchivedCourseCard';
import InstructorCourses from './InstructorCourses';
import StudentCourses from './StudentCourses';


import Sidebar from '../Sidebar';

import { withAuthorization } from '../Session';
import { compose } from 'recompose';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showArchived: false
    };

    this.handleArchivedChange = this.handleArchivedChange.bind(this);
  }

  handleArchivedChange() {
    this.setState({ showArchived: !this.state.showArchived });
  }

  
  render() {
    console.log(this.props.firebase.auth.currentUser ? this.props.firebase.auth.currentUser.email : "hello");

    return (
      <Grid columns={2} divided="horizontally" style={{"width":"100%"}}>
        <Sidebar active={'dashboard'}/>
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
            <a style={{"textDecoration":"underline", "cursor":"pointer"}} onClick={this.handleArchivedChange}>
              { this.state.showArchived ? "Hide Archived Courses" : "See Archived Courses"}
            </a>
            {/* add archived instructor courses if "see archived" is toggled (NEED TO MOVE) */}
            <Grid.Row columns={4} padded="true">
                {
                  this.state.courseUsers && this.state.courseUsers.map(courseUser => (

                    this.state.showArchived &&
                    courseUser.course.isArchived &&
                    courseUser.kind != "STUDENT" &&
                    <Grid.Column>
                      <ArchivedCourseCard
                        name={courseUser.course.name}
                        description={courseUser.course.description}
                        isArchived={courseUser.course.isArchived}
                        year={courseUser.course.year}
                      />
                    </Grid.Column>
                  ))
                }
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
)(Dashboard);
