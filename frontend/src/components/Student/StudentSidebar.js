import React from 'react';
import { Segment, Menu, Grid, Image } from 'semantic-ui-react';
import { withFirebase } from '../Firebase';
import { Link } from 'react-router-dom';

const CourseSidebar = (props) => (
  <Grid.Column width={3}>
    <Segment basic>
    <Link to='/home'>
      <Image src='../../../ohq.png' size='tiny' style={{"marginTop":"10px"}}/>
    </Link>
    <Menu vertical secondary fluid>
      <Menu.Item
        name="Queues"
        icon='hourglass one'
        active={props.active === 'queues'}
        color='blue'
        onClick={ () => props.clickFunc('queues') }/>
    </Menu>
    </Segment>
  </Grid.Column>
);

export default withFirebase(CourseSidebar);
