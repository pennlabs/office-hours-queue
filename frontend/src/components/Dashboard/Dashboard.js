import React from 'react';
import { Segment, Header, Grid } from 'semantic-ui-react';
import CourseCard from './CourseCard';
import ArchivedCourseCard from './ArchivedCourseCard';
import AddCard from './AddCard';
import ModalAddStudentCourse from './ModalAddStudentCourse';
import ModalAddInstructorCourse from './ModalAddInstructorCourse';
import ModalCreateCourse from './ModalCreateCourse';
import { fakeCourseUsers, fakeSearchCourses } from './coursedata.js';

import Sidebar from '../Sidebar';

import { withAuthorization } from '../Session';
import { compose } from 'recompose';

import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';

const TEST = gql`
  {
    joinableCourses(department: "ECON") {
      edges {
        node {
          name
        }
      }
    }
  }
`;

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
      instructorModalOpen: false
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


  render() {
    console.log(this.props.firebase.auth.currentUser ? this.props.firebase.auth.currentUser.email : "hello");


    return (
      <Grid columns={2} divided="horizontally" style={{"width":"100%"}}>
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
          closeFunc={ this.closeInstructorModal }
          open={ this.state.instructorModalOpen }
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
