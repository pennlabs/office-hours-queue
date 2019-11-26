import React from 'react'
import { Segment, Header, Icon } from 'semantic-ui-react';

export default class CourseCard extends React.Component {

  render() {
    return (
      <Segment basic>
        <Segment attached="top" color="blue" style={{"height":"70px", "width":"205px"}}>
          <Header
            content={this.props.code}
            href='/Queue' // should link to course page, which should then have queues, roster, etc.
            subheader={this.props.title.length < 28 ? this.props.title : this.props.title.substring(0, 25) + "..."}
          />
        </Segment>
        <Segment attached="bottom" secondary textAlign="right" style={{"height":"40px"}}>
          <Header as="h6">
            <Header.Content>
              <Icon name="circle" color={ this.props.openQueues == 0 ? "red" : "green" }/>
              {this.props.openQueues} / { this.props.totalQueues } Queues
            </Header.Content>
          </Header>
        </Segment>
      </Segment>
    );
  }
}
