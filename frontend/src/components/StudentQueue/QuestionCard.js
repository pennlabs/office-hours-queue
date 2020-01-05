import React from 'react'
import { Segment, Header, Icon, Button, Popup} from 'semantic-ui-react';

export default class QuestionCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentlyBeingAnswered : false
    };
  }

  answerCard = () => this.setState( {currentlyBeingAnswered: true })

    render() {
      return (
        <Segment basic>
          <Segment attached="top" color="blue" style={{"height":"50px", "width":"900px"}}>
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
            Question: { this.props.text } 
          </Segment>
          <Segment attached="bottom" secondary textAlign="right" style={{"height":"50px",  "width":"900px"}}>
            <Header as="h5" floated='left'>
              {
                <Header.Content>
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
