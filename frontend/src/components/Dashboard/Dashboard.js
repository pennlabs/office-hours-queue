import React from 'react';
import { Segment, Menu, Header, Grid, Image } from 'semantic-ui-react';
import CourseCard from './CourseCard';
import ArchivedCourseCard from './ArchivedCourseCard';
import AddCard from './AddCard';
import ModalAddStudentCourse from './ModalAddStudentCourse';
import { fakeStudentCourses, fakeInstructorCourses, fakeSearchCourses } from './coursedata.js';
import * as ROUTES from '../../constants/routes';

import SignOutButton from '../SignOut';



import { withAuthorization } from '../Session';
import { compose } from 'recompose';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showArchived: false,
      studentCourses: [],
      instructorCourses: [],
      searchCourses: [],
      searchResults: [],
      newStudentCourse: {
        code: "",
        course: {},
      },
      studentModalOpen: false,
      instructorModalOpen: false,
      newInstructorCourse: {
        code: "",
        title: "",
      }
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
    this.setState({ studentModalOpen: false });
  }

  openInstructorModal() {
    this.setState({ instructorModalOpen: true });
  }

  closeInstructorModal() {
    this.setState({ instructorModalOpen: false });
  }

  handleStudentCourseSubmit() {
    var newStudentCourses = this.state.studentCourses;
    var newCourse = {
      code: this.state.newStudentCourse.course.code,
      title: this.state.newStudentCourse.course.title,
      totalQueues: "1",
      openQueues: "1",
      isArchived: false,
      year: 2019,
      semester: 0
    };
    newStudentCourses.push(newCourse)
    this.setState({ studentCourses: newStudentCourses, studentModalOpen: false });
  }

  handleStudentCourseChange(e, { name, value }) {
    var course = this.state.newStudentCourse;
    course[name] = value;
    this.setState({ newStudentCourse: course });
  }

  handleCourseSearch() {
    var code = this.state.newStudentCourse.code;
    var results = [];

    this.state.searchCourses.forEach(course => {
      if (course.code.includes(code)) {
        results.push(course);
      }
    });

    this.fillOptions(results);
  }

  fillOptions(courses) {
    var options = [];
    courses.forEach(course => {
      options.push({
        key: course.title,
        value: { code: course.code, title: course.title },
        text: course.title + " (" + course.code + ")"
      });
    });

    this.setState({ searchResults: options });
  }

  handleInstructorCourseSubmit() {
    var newInstructorCourses = this.state.instructorCourses;
    var newCourse = {
      code: this.state.newInstructorCourse.code,
      title: this.state.newInstructorCourse.title,
      totalQueues: "1",
      openQueues: "0",
      isArchived: false,
      year: 2019,
      semester: 0
    };
    newInstructorCourses.push(newCourse)
    this.setState({ instructorCourses: newInstructorCourses, instructorModalOpen: false });
  }

  handleInstructorCourseChange(e, { name, value }) {
    var course = this.state.newInstructorCourse;
    course[name] = value;
    this.setState({ newInstructorCourse: course });
  }

  componentDidMount() {
    this.setState({
      studentCourses: fakeStudentCourses,
      instructorCourses: fakeInstructorCourses,
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
                  this.state.studentCourses.map(course => (

                    !course.isArchived &&
                    <Grid.Column>
                      <CourseCard
                        code={course.code}
                        title={course.title}
                        totalQueues={course.totalQueues}
                        openQueues={course.openQueues}
                        isArchived={course.isArchived}
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
                  this.state.instructorCourses.map(course => (

                    !course.isArchived &&
                    <Grid.Column>
                      <CourseCard
                        code={course.code}
                        title={course.title}
                        totalQueues={course.totalQueues}
                        openQueues={course.openQueues}
                        isArchived={course.isArchived}
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
                  this.state.instructorCourses.map(course => (

                    this.state.showArchived && course.isArchived &&
                    <Grid.Column>
                      <ArchivedCourseCard
                        code={course.code}
                        title={course.title}
                        isArchived={course.isArchived}
                        year={course.year}
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
