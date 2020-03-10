import React from 'react';
import { Segment, Menu, Grid, Image } from 'semantic-ui-react';
import { withFirebase } from '../Firebase';
import { Link } from 'react-router-dom';

const CourseSidebar = (props) => {
  const isLeadership = (kind) => {
    return kind === 'PROFESSOR' || kind === 'HEAD_TA'
  }

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
          onClick={ () => props.clickFunc('queues') }
          active={props.active === 'queues'}
          color='blue'/>
        <Menu.Item
          name="Roster"
          icon='users'
          onClick={ () => props.clickFunc('roster') }
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
          isLeadership(props.kind) &&
          <Menu.Item
            name="Course Settings"
            icon='settings'
            onClick={ () => props.clickFunc('course_settings') }
            active={props.active === 'course_settings'}
            color='blue'/>
        }
      </Menu>
      </Segment>
    </Grid.Column>
  )
};

export default withFirebase(CourseSidebar);
