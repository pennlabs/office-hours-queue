import React, { useState } from 'react'
import { Segment, Header, Button, Popup, Icon } from 'semantic-ui-react';

const QuestionCard = (props) => {
  const [question, setQuestion] = useState(props.question);

  const timeString = (date) => {
    var d = new Date(date);
    var hour = d.getHours() > 12 ? d.getHours() - 12 : d.getHours();
    var meridiem = d.getHours() > 12 ? "pm" : "am";
    var minutes = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes()
    return `${hour}:${minutes} ${meridiem}`;
  }
  return (
    <div style={{"marginTop":"10px"}}>
      <Segment attached="top" color="blue" style={{"height":"50px"}}>
          <Header as="h5" floated='right' color="blue">
            <Header.Content>
              { timeString(question.timeAsked) }
            </Header.Content>
          </Header>
          <Header as="h5" floated='left'>
              <Header.Content>
                { "Position: #" + (question.questionsAhead + 1) }
              </Header.Content>
            </Header>
      </Segment>
      <Segment attached
        tertiary={ question.timeStarted }>
        { question.text }
      </Segment>
      <Segment attached="bottom" secondary textAlign="right" style={{"height":"50px"}}>
        <Header as="h5" floated='left'>
          <Header.Content>
            <Button compact
              size='mini'
              color='red'
              content='Delete'/>
            <Button compact
              size='mini'
              color='green'
              content='Edit'/>
          </Header.Content>
        </Header>
          <Popup
            trigger= {
              <Icon name="tags"/>
            }
            content= {
              question.tags && question.tags.map(tag => {
                return ' ' + tag
              }).toString()
            }
            basic inverted
            position="bottom left"/>
      </Segment>
    </div>
  );
}

export default QuestionCard;