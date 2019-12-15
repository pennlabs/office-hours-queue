import React from 'react';
import { Segment, Menu, Header, Grid, Image } from 'semantic-ui-react';
import CourseCard from './CourseCard';
import ArchivedCourseCard from './ArchivedCourseCard';
import AddCard from './AddCard';
import ModalAddStudentCourse from './ModalAddStudentCourse';
import { fakeCourseUsers, fakeSearchCourses } from './coursedata.js';
import * as ROUTES from '../../constants/routes';

import SignOutButton from '../SignOut';



import { withAuthorization } from '../Session';
import { compose } from 'recompose';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showArchived: false,
      courseUsers: [],
      searchCourses: [],
      searchResults: [],
      newStudentCourse: {},
      studentModalOpen: false,
      instructorModalOpen: false,
      newInstructorCourse: {}
    };

    this.handleArchivedChange = this.handleArchivedChange.bind(this);

    this.handleStudentCourseSubmit = this.handleStudentCourseSubmit.bind(this);
    this.handleStudentCourseChange = this.handleStudentCourseChange.bind(this);
    this.openStudentModal = this.openStudentModal.bind(this);
    this.closeStudentModal = this.closeStudentModal.bind(this);

    this.handleInstructorCourseSubmit = this.handleInstructorCourseSubmit.bind(this);
    this.handleInstructorCourseChange = this.handleInstructorCourseChange.bind(this);
    this.openInstructorModal = this.openInstructorModal.bind(this);
    this.closeInstructorModal = this.closeInstructorModal.bind(this);

    this.handleCourseSearch = this.handleCourseSearch.bind(this);
  }

  handleArchivedChange() {
    this.setState({ showArchived: !this.state.showArchived });
  }

  openStudentModal() {
    this.setState({ studentModalOpen: true });
  }

  closeStudentModal() {
    this.setState({ studentModalOpen: false, newStudentCourse: {}, searchResults: [] });
  }

  openInstructorModal() {
    this.setState({ instructorModalOpen: true });
  }

  closeInstructorModal() {
    this.setState({ instructorModalOpen: false });
  }

  handleStudentCourseSubmit() {
    if (this.state.newStudentCourse && this.state.newStudentCourse.course) {
      var newCourseUsers = this.state.courseUsers;
      var newCourseUser = {
        course: {
          name: this.state.newStudentCourse.course.name,
          description: this.state.newStudentCourse.course.description,
          isArchived: false,
          year: 2019,
          semester: "FALL",
          totalQueues: "1",
          openQueues: "1"
        },
        kind: "STUDENT"
      };

      newCourseUsers.push(newCourseUser)
      this.setState({
        courseUsers: newCourseUsers,
        studentModalOpen: false,
        searchResults: [],
        newStudentCourse: {}
      });
    }
  }

  handleStudentCourseChange(e, { name, value }) {
    var course = this.state.newStudentCourse;
    course[name] = value;
    this.setState({ newStudentCourse: course });
  }

  handleCourseSearch() {
    var name = this.state.newStudentCourse.name;
    var results = [];

    this.state.searchCourses.forEach(course => {
      if (course.name.includes(name)) {
        results.push(course);
      }
    });

    console.log(name);

    this.fillOptions(results);
  }

  fillOptions(courses) {
    var options = [];
    courses.forEach(course => {
      options.push({
        key: course.name,
        value: { name: course.name, description: course.description },
        text: course.description + " (" + course.name + ")"
      });
    });

    this.setState({ searchResults: options });
  }

  handleInstructorCourseSubmit() {
    var newCourseUsers = this.state.courseUsers;
    var newCourseUser = {
      course: {
        name: this.state.newInstructorCourse.name,
        description: this.state.newInstructorCourse.description,
        isArchived: false,
        year: 2019,
        semester: "FALL",
        totalQueues: "1",
        openQueues: "0"
      },
      kind: "TA"
    };

    newCourseUsers.push(newCourseUser)
    this.setState({ courseUsers: newCourseUsers, instructorModalOpen: false });
  }

  handleInstructorCourseChange(e, { name, value }) {
    var course = this.state.newInstructorCourse;
    course[name] = value;
    this.setState({ newInstructorCourse: course });
  }

  componentDidMount() {
    this.setState({
      courseUsers: fakeCourseUsers,
      searchCourses: fakeSearchCourses
    });
  }

  render() {
    return (
      <Grid columns={2} divided="horizontally">
        <Grid.Column width={3}>
          <Segment basic>
          <Image src='../../../ohq.png' size='tiny'/>
          <Menu vertical secondary fluid>
            <Menu.Item
              name="Dashboard"
              icon='dashboard'
              href={ROUTES.DASHBOARD}
              active={true}
              color={'blue'}
            />
            <Menu.Item
              name="Sample Queue"
              icon='hourglass one'
              href={ROUTES.QUEUE}
            />
            <Menu.Item
              name="Sample Roster"
              icon='users'
              href={ROUTES.ROSTER}
            />
            <SignOutButton />
          </Menu>
          </Segment>
        </Grid.Column>
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
                  <AddCard clickFunc={this.openStudentModal}/>
                  <ModalAddStudentCourse
                    changeFunc={this.handleStudentCourseChange}
                    submitFunc={this.handleStudentCourseSubmit}
                    closeFunc={this.closeStudentModal}
                    open={this.state.studentModalOpen}
                    searchFunc={this.handleCourseSearch}
                    results={this.state.searchResults}
                  />
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
                  <AddCard clickFunc={this.openInstructorModal}/>
                  <ModalAddStudentCourse
                    changeFunc={this.handleInstructorCourseChange}
                    submitFunc={this.handleInstructorCourseSubmit}
                    closeFunc={this.closeInstructorModal}
                    open={this.state.instructorModalOpen}
                  />
                </Grid.Column>
            </Grid.Row>
            <a style={{"textDecoration":"underline"}} onClick={this.handleArchivedChange}>
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
