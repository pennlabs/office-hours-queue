import React, { useState } from 'react'
import { Segment, Header, Button, Popup, Icon } from 'semantic-ui-react';
import EditQuestionModal from './EditQuestionModal';

const QuestionCard = (props) => {
  const [question, setQuestion] = useState(props.question);
  const [open, setOpen] = useState(false);

  const timeString = (date) => {
    const d = new Date(date);
    const hour = d.getHours() > 12 ? d.getHours() - 12 : d.getHours();
    const meridiem = d.getHours() > 12 ? "pm" : "am";
    const minutes = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
    return `${hour}:${minutes} ${meridiem}`;
  };

  return (
    <div style={{"marginTop":"10px"}}>
      <EditQuestionModal open={ open } queue={ props.queue } question={ props.question }/>
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
              content='Edit'
              onClick={ () => setOpen(true) }/>
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
};

export default QuestionCard;
