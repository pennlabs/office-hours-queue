import React, { useState } from 'react'
import { Segment, Header, Icon, Button, Popup} from 'semantic-ui-react';
import DeleteQuestionModal from './DeleteQuestionModal';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks'

const START_QUESTION = gql`
  mutation StartQuestion($input: StartQuestionInput!) {
    startQuestion(input: $input) {
      question {
        id
      }
    }
  }
`

const QuestionCard = (props) => {
  const [question, setQuestion] = useState(props.question);
  const [open, setOpen] = useState(false);
  const [startQuestion, { loading, error }] = useMutation(START_QUESTION);

  const timeString = (date) => {
    var d = new Date(date);
    var hour = d.getHours() > 12 ? d.getHours() - 12 : d.getHours();
    var meridiem = d.getHours() > 12 ? "pm" : "am";
    var minutes = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes()
    return `${hour}:${minutes} ${meridiem}`;
  }

  const triggerModal = () => {
    setOpen(!open);
  } 

  const onAnswer = () => {
    startQuestion({
      variables: {
        input: {
          questionId: question.id
        }
      }
    }).then(() => {
      props.refetch();
    });
  }

  return (
    question && <Segment basic>
        <DeleteQuestionModal open={open} question={question} closeFunc={triggerModal} refetch={ props.refetch }/>
          <Segment attached="top" color="blue" style={{"height":"50px", "width":"300px"}}>
              <Header as="h5" floated='right' color="blue">
                <Header.Content>
                  { timeString(question.timeAsked) }
                </Header.Content>
              </Header>
              <Header as="h5" floated='left'>
                <Header.Content>
                  { question.askedBy.preferredName }
                </Header.Content>
              </Header>
          </Segment>
          <Segment attached
            style={{"height":"80px",  "width":"300px"}}
            tertiary={props.started}>
          { question.text && (question.text.length < 100 ? 
            question.text : question.text.substring(0, 99) + "...") }
          </Segment>
          <Segment attached="bottom" secondary textAlign="right" style={{"height":"50px",  "width":"300px"}}>
            <Header as="h5" floated='left'>
              {
                !props.started ?
                <Header.Content>
                  <Button compact
                    size='mini'
                    color='red'
                    content='Delete'
                    onClick={triggerModal}/>
                  <Button compact
                    size='mini'
                    color='green'
                    content='Answer'
                    onClick={onAnswer}/>
                </Header.Content>
                  :
                  <Header.Content>
                    <Button compact
                      size='mini'
                      color='green'
                      content='Finish'/>
                  </Header.Content>
              }
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
                basic
                position="bottom left"
                inverted/>
          </Segment>
        </Segment>
  );
}

export default QuestionCard;
