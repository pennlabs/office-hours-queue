import React from 'react'
import { Segment, Header, Icon, Button, Label } from 'semantic-ui-react';

export default class CourseCard extends React.Component {

  render() {
    return (
      <Segment basic>
        <Segment attached="top" color="blue" style={{"height":"50px", "width":"300px"}}>
            <Header as="h5" floated='right' color="blue">
              <Header.Content>
                {this.props.time_asked}
              </Header.Content>
            </Header>
            <Header as="h5" floated='left'>
              <Header.Content>
                {this.props.asker}
              </Header.Content>
            </Header>
        </Segment>
        <Segment attached style={{"height":"80px",  "width":"300px"}}>
        {this.props.text.length < 100 ? this.props.text : this.props.text.substring(0, 99) + "..."}
        </Segment>
        <Segment attached="bottom" secondary textAlign="right" style={{"height":"50px",  "width":"300px"}}>
          <Header as="h5" floated='left'>
              <Header.Content>
              <Button compact size='mini' color='red'>Delete</Button>
                <Button compact size='mini' color='green'>Answer</Button>
              </Header.Content>
            </Header>
          <Header as="h6" floated='right'>
            <Header.Content href='Queue'> 
              <Icon name="tags" color="blue"/>
              <Label>
                {this.props.tags}
              </Label>
            </Header.Content>
          </Header>
        </Segment>
      </Segment>
    );
  }
}