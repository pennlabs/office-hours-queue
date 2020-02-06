import React from 'react'
import { Segment, Header, Button } from 'semantic-ui-react';

// Shows current state of the question asked (which queue it is on, when it was asked)
export default class QuestionCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentlyBeingAnswered: false
    };
  } ß

  answerCard = () => this.setState({ currentlyBeingAnswered: true })

  render() {
    return (
      <Segment basic>
        <Segment attached="top" color="blue" style={{ "height": "50px", "width": "900px" }}>
          <Header as="h5" floated='right' color="blue">
            <Header.Content>
              {this.props.timeAsked}
            </Header.Content>
          </Header>
          <Header as="h5" floated='left'>
            <Header.Content>
              Asked on {this.props.queueName}
            </Header.Content>
          </Header>
        </Segment>
        <Segment attached>
          You are #__ in line, ETA:
          </Segment>
        <Segment attached>
          <b>Question</b>: {this.props.text} <br/>
          <b>Tags</b>: {
            this.props.tags.length > 0 ? this.props.tags.map((tag, index) => (
              tag.isActive ?
                <Header.Content>
                  {tag.name}
                </Header.Content> :
                null
            )) : null
          }
        </Segment>
        <Segment attached="bottom" secondary textAlign="right" style={{ "height": "50px", "width": "900px" }}>
          <Header as="h5" floated='right'>
            {
              <Header.Content>
                <Button compact
                  size='mini'
                  color='red'
                  content='Delete'
                  onClick={() => this.props.deleteFunc()}
                />
                <Button compact
                  size='mini'
                  color='green'
                  content='Edit'
                  onClick={() => this.props.editFunc()}
                />
              </Header.Content>
            }
          </Header>
        </Segment>
      </Segment>
    );
  }
}
