import React from 'react';
import { Segment, Header, Grid, Dropdown, Checkbox, Form, Button } from 'semantic-ui-react';
import Sidebar from '../Sidebar';

import { withAuthorization } from '../Session';
import { compose } from 'recompose';

const semesterOptions = [
  {
    key: 'Fall',
    text: 'Fall',
    value: 'Fall',
  },
  {
    key: 'Spring',
    text: 'Spring',
    value: 'Spring',
  },
  {
    key: 'Summer',
    text: 'Summer',
    value: 'Summer',
  },
]

const departmentOptions = [
  {
    key: 'CIS',
    text: 'CIS',
    value: 'CIS',
  },
  {
    key: 'MATH',
    text: 'MATH',
    value: 'MATH',
  },
  {
    key: 'PSYC',
    text: 'PSYC',
    value: 'PSYC',
  },
]

class CourseSettings extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
          course: {
            name: 'CIS 121',
            department: 'CIS',
            number: '121',
            description: 'Introduction to Data Structures and Algorithms',
            year: '2019',
            semester: 'Spring',
            active: true
          },
        };
      }

      render() {
        return (
          <Grid columns={2} divided="horizontally" style={{"width":"100%"}}>
            <Sidebar active={'course_settings'}/>
            <Grid.Column width={13}>
              <Grid columns={2} padded>
                <Grid.Row>
                  {/* COURSE HEADER */}
                  <Segment basic>
                    <Header as="h1">
                      {this.state.course.name}
                      <Header.Subheader>
                        {this.state.course.description}
                      </Header.Subheader>
                    </Header>
                  </Segment>
                </Grid.Row>
                <Grid.Row>
                  <Segment basic>
                    <Form>
                      <Form.Field>
                        <label>Course Department</label>
                        <Dropdown
                          placeholder='Select Department'
                          fluid
                          selection
                          options={departmentOptions}
                          defaultValue={this.state.course.department}
                        />
                      </Form.Field>
                      <Form.Field>
                        <label>Course Number</label>
                        <input placeholder='Course Number' defaultValue={this.state.course.number} />
                      </Form.Field>
                      <Form.Field>
                        <label>Course Description</label>
                        <input placeholder='Course Description' defaultValue={this.state.course.description}/>
                      </Form.Field>
                      <Form.Field>
                        <label>Year</label>
                        <input placeholder='Year' defaultValue={this.state.course.year} />
                      </Form.Field>
                      <Form.Field>
                        <label>Semester</label>
                        <Dropdown
                          placeholder='Select Semester'
                          fluid
                          selection
                          options={semesterOptions}
                          defaultValue={this.state.course.semester}
                        />
                      </Form.Field>
                      <Form.Field>
                        <Checkbox toggle label='Course Active?' defaultChecked={this.state.course.active} />
                      </Form.Field>
                      <Button type='submit'>Submit</Button>
                    </Form>
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
