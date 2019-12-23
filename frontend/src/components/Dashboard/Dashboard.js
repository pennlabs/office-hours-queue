import React from 'react';
import { Segment, Menu, Header, Grid, Image } from 'semantic-ui-react';
import CourseCard from './CourseCard';
import ArchivedCourseCard from './ArchivedCourseCard';
import AddCard from './AddCard';
import ModalAddStudentCourse from './ModalAddStudentCourse';
import ModalAddInstructorCourse from './ModalAddInstructorCourse';
import ModalCreateCourse from './ModalCreateCourse';
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
      searchCourses: {
        student: [],
        instructor: []
      },
      searchResults: {
        student: [],
        instructor: []
      },
      studentModalOpen: false,
      newStudentCourse: {},
      instructorModalOpen: false,
      newInstructorCourse: {},
      createModalOpen: false
    };

    this.handleArchivedChange = this.handleArchivedChange.bind(this);

    this.handleStudentCourseSubmit = this.handleStudentCourseSubmit.bind(this);
    this.handleStudentCourseChange = this.handleStudentCourseChange.bind(this);
    this.handleStudentCourseSearch = this.handleStudentCourseSearch.bind(this);
    this.openStudentModal = this.openStudentModal.bind(this);
    this.closeStudentModal = this.closeStudentModal.bind(this);

    this.handleInstructorCourseSubmit = this.handleInstructorCourseSubmit.bind(this);
    this.handleInstructorCourseChange = this.handleInstructorCourseChange.bind(this);
    this.handleInstructorCourseSearch = this.handleInstructorCourseSearch.bind(this);
    this.openInstructorModal = this.openInstructorModal.bind(this);
    this.closeInstructorModal = this.closeInstructorModal.bind(this);

    this.openCreateModal = this.openCreateModal.bind(this);
  }

  componentDidMount() {
    this.setState({
      courseUsers: fakeCourseUsers,
      searchCourses: fakeSearchCourses
    });
  }

  handleArchivedChange() {
    this.setState({ showArchived: !this.state.showArchived });
  }

  /* ADD STUDENT COURSE FUNCTIONS */

  openStudentModal() {
    this.setState({ studentModalOpen: true });
  }

  closeStudentModal() {
    this.setState({ studentModalOpen: false, newStudentCourse: {}, searchResults: {} });
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
        searchResults: {},
        newStudentCourse: {}
      });
    }
  }

  handleStudentCourseChange(e, { name, value }) {
    var course = this.state.newStudentCourse;
    course[name] = value;
    this.setState({ newStudentCourse: course });
  }

  handleStudentCourseSearch() {
    var name = this.state.newStudentCourse.name;
    var results = [];

    this.state.searchCourses.student.forEach(course => {
      if (course.name.includes(name)) {
        results.push(course);
      }
    });
    this.fillStudentOptions(results);
  }

  fillStudentOptions(courses) {
    var options = [];
    courses.forEach(course => {
      options.push({
        key: course.name,
        value: { name: course.name, description: course.description },
        text: course.description + " (" + course.name + ")"
      });
    });

    this.setState({ searchResults: { student: options } });
  }

  /* ADD INSTRUCTOR COURSE FUNCTIONS */

  openInstructorModal() {
    this.setState({ instructorModalOpen: true });
  }

  closeInstructorModal() {
    this.setState({
      instructorModalOpen: false,
      searchResults: {},
      newInstructorCourse: {}
    });
  }

  handleInstructorCourseSubmit() {
    if (this.state.newInstructorCourse && this.state.newInstructorCourse.course) {
      var newCourseUsers = this.state.courseUsers;
      var newCourseUser = {
        course: {
          name: this.state.newInstructorCourse.course.name,
          description: this.state.newInstructorCourse.course.description,
          isArchived: false,
          year: 2019,
          semester: "FALL",
          totalQueues: "1",
          openQueues: "1"
        },
        kind: "TA"
      };

      newCourseUsers.push(newCourseUser)
      this.setState({
        courseUsers: newCourseUsers,
        instructorModalOpen: false,
        searchResults: {},
        newInstructorCourse: {}
      });
    }
  }

  handleInstructorCourseChange(e, { name, value }) {
    var course = this.state.newInstructorCourse;
    course[name] = value;
    this.setState({ newInstructorCourse: course });
  }

  handleInstructorCourseSearch() {
    var name = this.state.newInstructorCourse.name;
    var results = [];

    this.state.searchCourses.instructor.forEach(course => {
      if (course.name.includes(name)) {
        results.push(course);
      }
    });
    this.fillInstructorOptions(results);
  }

  fillInstructorOptions(courses) {
    var options = [];
    courses.forEach(course => {
      options.push({
        key: course.name,
        value: { name: course.name, description: course.description },
        text: course.description + " (" + course.name + ")"
      });
    });

    this.setState({ searchResults: { instructor: options } });
  }

  /* CREATE NEW COURSE MODAL FUNCTIONS */

  openCreateModal() {
    console.log("hello");
    this.setState({
      openInstructorModal: false,
      searchResults: {},
      newInstructorCourse: {}
    });
  }

  render() {
    return (
      <Grid columns={2} divided="horizontally">
        <ModalAddStudentCourse
          funcs = {{
            changeFunc: this.handleStudentCourseChange,
            submitFunc: this.handleStudentCourseSubmit,
            closeFunc: this.closeStudentModal,
            searchFunc: this.handleStudentCourseSearch
          }}
          attrs = {{
            open: this.state.studentModalOpen,
            results: this.state.searchResults.student
          }}
        />
        <ModalAddInstructorCourse
          funcs={{
            changeFunc: this.handleInstructorCourseChange,
            submitFunc: this.handleInstructorCourseSubmit,
            closeFunc: this.closeInstructorModal,
            searchFunc: this.handleInstructorCourseSearch,
            createFunc: this.openCreateModal
          }}
          attrs={{
            open: this.state.instructorModalOpen,
            results: this.state.searchResults.instructor
          }}
        />
        <ModalCreateCourse
          funcs={{}}
          attrs={{
            open: this.state.createModalOpen
          }}
        />
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
