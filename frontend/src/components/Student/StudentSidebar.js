import React from 'react';
import {Segment, Menu, Grid, Image, Header, List, Icon} from 'semantic-ui-react';
import { withFirebase } from '../Firebase';
import { Link } from 'react-router-dom';
import { prettifyRole } from "../../utils/enums";

const CourseSidebar = (props) => (
  <Grid.Column width={3}>
    <Segment basic>
    <Link to='/home'>
      <Image src='../../../ohq.png' size='tiny' style={{"marginTop":"10px"}}/>
    </Link>
    <Menu vertical secondary fluid>
      <Menu.Item style={{whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden"}}
        name="Queues"
        icon='hourglass one'
        active={props.active === 'queues'}
        color='blue'
        onClick={ () => props.clickFunc('queues') }/>
    </Menu>
    </Segment>
    { props.leadership &&
      <Segment basic>
        <Header as='h3'>Instructors</Header>
        {
          props.leadership.map((courseUser) => {
            return (
              <List>
                <List.Item>
                  <Image avatar><Icon name='user'/></Image>
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
);

export default withFirebase(CourseSidebar);
