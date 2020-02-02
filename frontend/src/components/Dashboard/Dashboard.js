import React from 'react';
import { Segment, Header, Grid } from 'semantic-ui-react';
import CourseCard from './CourseCard';
import ArchivedCourseCard from './ArchivedCourseCard';
import AddCard from './AddCard';
import ModalAddStudentCourse from './ModalAddStudentCourse';
import ModalAddInstructorCourse from './ModalAddInstructorCourse';
import { fakeCourseUsers, fakeSearchCourses } from './coursedata.js';

import Sidebar from '../Sidebar';

import { withAuthorization } from '../Session';
import { compose } from 'recompose';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showArchived: false,
      courseUsers: [],
      studentModalOpen: false,
      instructorModalOpen: false
    };

    this.handleArchivedChange = this.handleArchivedChange.bind(this);
    this.triggerStudentModal = this.triggerStudentModal.bind(this);
    this.triggerInstructorModal = this.triggerInstructorModal.bind(this);
  }

  componentDidMount() {
    this.setState({
      courseUsers: fakeCourseUsers
    });
  }

  handleArchivedChange() {
    this.setState({ showArchived: !this.state.showArchived });
  }

  /* STUDENT AND INSTRUCTOR FUNCTIONS */

  triggerStudentModal() {
    this.setState({ studentModalOpen: !this.state.studentModalOpen });
  }

  triggerInstructorModal() {
    this.setState({ instructorModalOpen: !this.state.instructorModalOpen });
  }

  
  render() {
    console.log(this.props.firebase.auth.currentUser ? this.props.firebase.auth.currentUser.email : "hello");

    return (
      <Grid columns={2} divided="horizontally" style={{"width":"100%"}}>
        <ModalAddStudentCourse
          open={ this.state.studentModalOpen }
          closeFunc={ this.triggerStudentModal }
        />
        <ModalAddInstructorCourse
          open={ this.state.instructorModalOpen }
          closeFunc={ this.triggerInstructorModal }
        />
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
            {/* add student course cards */}
            <Grid.Row columns={4} padded="true">
                {
                  this.state.courseUsers.map(courseUser => (

                    !courseUser.course.isArchived &&
                    courseUser.kind == "STUDENT" &&
                    <Grid.Column>
                      <CourseCard
                        name={courseUser.course.name}
                        description={courseUser.course.description}
                        totalQueues={courseUser.course.totalQueues}
                        openQueues={courseUser.course.openQueues}
                        isArchived={courseUser.course.isArchived}
                      />
                    </Grid.Column>
                  ))
                }
                <Grid.Column>
                <AddCard clickFunc={ this.triggerStudentModal }/>
                </Grid.Column>
            </Grid.Row>
            <Segment basic padded>
              <Header as="h2">
                <Header.Content>
                  Instructor Courses
                </Header.Content>
              </Header>
            </Segment>
            {/* add instructor course cards */}
            <Grid.Row columns={4} padded="true">
                {
                  this.state.courseUsers.map(courseUser => (
                    !courseUser.course.isArchived &&
                    courseUser.kind != "STUDENT" &&
                    <Grid.Column>
                      <CourseCard
                        name={courseUser.course.name}
                        description={courseUser.course.description}
                        totalQueues={courseUser.course.totalQueues}
                        openQueues={courseUser.course.openQueues}
                        isArchived={courseUser.course.isArchived}
                      />
                    </Grid.Column>
                  ))
                }
                <Grid.Column>
                  <AddCard clickFunc={this.triggerInstructorModal}/>
                </Grid.Column>
            </Grid.Row>
            <a style={{"textDecoration":"underline", "cursor":"pointer"}} onClick={this.handleArchivedChange}>
              { this.state.showArchived ? "Hide Archived Courses" : "See Archived Courses"}
            </a>
            {/* add archived instructor courses if "see archived" is toggled */}
            <Grid.Row columns={4} padded="true">
                {
                  this.state.courseUsers.map(courseUser => (

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
