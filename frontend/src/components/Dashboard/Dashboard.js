import React from 'react';
import { Segment, Sidebar, Icon, Menu, Card, Header, Grid } from 'semantic-ui-react';
import CourseCard from './CourseCard';
import ArchivedCourseCard from './ArchivedCourseCard';
import AddCard from './AddCard';
import { fakeStudentCourses, fakeInstructorCourses } from './coursedata.js';

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showArchived: false,
      studentCourses: [],
      instructorCourses: []
    };

    this.handleArchivedChange = this.handleArchivedChange.bind(this);
    this.addStudentCourse = this.addStudentCourse.bind(this);
  }

  handleArchivedChange() {
    this.setState({ showArchived: !this.state.showArchived });
  }

  addStudentCourse() {
    var newStudentCourses = this.state.studentCourses;
    //dummy class
    newStudentCourses.push({
      code: "CIS 545",
      title: "Big Data Analytics",
      totalQueues: "1",
      openQueues: "0",
      isArchived: false,
      year: 2019,
      semester: 0
    });

    this.setState({ studentCourses: newStudentCourses });
  }

  componentDidMount() {
    this.setState({
      studentCourses: fakeStudentCourses,
      instructorCourses: fakeInstructorCourses
    });
  }

  render() {
    return (
      <Grid columns={2} divided="horizontally">
        <Grid.Column width={3}>
          <Segment basic>
          <Menu vertical secondary fluid>
            <Menu.Item
              name="Dashboard"
              onClick={function(){}}
            />
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
            <Grid.Row columns={4} padded>
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
                  <AddCard clickFunc={this.addStudentCourse}/>
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
            <Grid.Row columns={4} padded>
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
            </Grid.Row>
            <a style={{"text-decoration":"underline"}} onClick={this.handleArchivedChange}>
              { this.state.showArchived ? "Hide Archived Courses" : "See Archived Courses"}
            </a>
            {/* add archived instructor courses if "see archived" is toggled */}
            <Grid.Row columns={4} padded>
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
