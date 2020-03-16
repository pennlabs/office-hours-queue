import React, { useState, useEffect } from 'react';
import { Segment, Menu, Grid, Image, Header, List, Icon } from 'semantic-ui-react';
import { withFirebase } from '../Firebase';
import { Link } from 'react-router-dom';
import { prettifyRole } from "../../utils/enums";

const CourseSidebar = (props) => {
  const [leadership, setLeadership] = useState(props.leadership);
  const [leader, setLeader] = useState(props.leader);

  useEffect(() => {
    setLeadership(props.leadership)
  }, [props.leadership]);

  useEffect(() => {
    setLeader(props.leader)
  }, [props.leader]);

  return (
    <Grid.Column width={3}>
      <Segment basic>
        <Link to='/home'>
          <Image src='../../../ohq.png' size='tiny' style={{"marginTop":"10px"}}/>
        </Link>
        <Menu vertical secondary fluid>
          <Menu.Item
            name="Queues"
            icon='hourglass one'
            onClick={() => props.clickFunc('queues')}
            active={props.active === 'queues'}
            color='blue'/>
          <Menu.Item
            name="Roster"
            icon='users'
            onClick={() => props.clickFunc('roster')}
            active={props.active === 'roster'}
            color='blue'/>
          <Menu.Item
            name="Analytics"
            icon='chart bar'
            onClick={ () => props.clickFunc('analytics') }
            active={props.active === 'analytics'}
            color='blue'/>
          <Menu.Item
            name="Question Summary"
            icon='list ol'
            onClick={ () => props.clickFunc('summary') }
            active={props.active === 'summary'}
            color='blue'/>
          {
            leader &&
            <Menu.Item
              name="Course Settings"
              icon='settings'
              onClick={ () => props.clickFunc('settings') }
              active={props.active === 'settings'}
              color='blue'/>
          }
        </Menu>
      </Segment>
      { leadership &&
        <Segment basic>
          <Header as='h3'>Instructors</Header>
          {
            leadership.map((courseUser) => {
              return (
                <List>
                  <List.Item>
                    <Icon name='user'/>
                    <List.Content>
                      <List.Header as='a' href={`mailto:${courseUser.user.email}`}>
                        { courseUser.user.fullName }
                      </List.Header>
                      <List.Description>{ prettifyRole(courseUser.kind) }</List.Description>
                    </List.Content>
                  </List.Item>
                </List>
              );
            })
          }
        </Segment>
      }
    </Grid.Column>
  )
};

export default withFirebase(CourseSidebar);
