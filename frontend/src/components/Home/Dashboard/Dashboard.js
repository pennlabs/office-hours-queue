import React, { useState, useEffect } from 'react';
import { Segment, Header, Grid, Placeholder } from 'semantic-ui-react';
import InstructorCourses from './InstructorCourses';
import StudentCourses from './StudentCourses';
import _ from 'lodash';

const Dashboard = (props) => {
  const getCourses = (allCourses, isStudent) => {
    if (!allCourses) { return [] }
    return allCourses.filter((course) => {
      return (isStudent && course.kind === 'STUDENT') ||
        (!isStudent && course.kind !== 'STUDENT');
    });
  };

  /* STATE */
  const [courses, setCourses] = useState(props.courses);
  const [hasInstructorCourses, setHasInstructorCourses] = useState(getCourses(props.courses).length > 0);

  /* UPDATE ON PROPS CHANGE */
  useEffect(() => {
    setCourses(props.courses);
    setHasInstructorCourses(getCourses(props.courses).length > 0)
  }, [props.courses]);

  return (
    <Grid.Column width={13}>
    {
      courses &&
      <Grid padded stackable>
        <Segment basic padded>
          <Header as="h2">
            <Header.Content>
              Student Courses
            </Header.Content>
          </Header>
        </Segment>
        { props.loading ?
          <Grid style={{"width":"100%"}} stackable>
            <Grid.Row padded="true" stackable>
              { _.times(3, () => (
                <Grid.Column style={{width: "240px", height: "110px"}}>
                  <Segment basic>
                    <Segment raised>
                      <Placeholder>
                        <Placeholder.Header>
                          <Placeholder.Line/>
                          <Placeholder.Line/>
                        </Placeholder.Header>
                        <Placeholder.Paragraph>
                          <Placeholder.Line length='medium'/>
                          <Placeholder.Line length='short'/>
                        </Placeholder.Paragraph>
                      </Placeholder>
                    </Segment>
                  </Segment>
                </Grid.Column>
                ))
              }
            </Grid.Row>
          </Grid> :
          <StudentCourses courses={ getCourses(courses, true) } refetch={ props.refetch }/>
        }
        { !props.loading && hasInstructorCourses && [
            <Segment basic padded>
              <Header as="h2">
                <Header.Content>
                  Instructor Courses
                </Header.Content>
              </Header>
            </Segment>,
            <InstructorCourses courses={ getCourses(courses, false) } refetch={ props.refetch }/>
          ]
        }
      </Grid>
    }
    </Grid.Column>
  );
};

export default Dashboard;
