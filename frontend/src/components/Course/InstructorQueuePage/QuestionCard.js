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
`;

const FINISH_QUESTION = gql`
  mutation FinishQuestion($input: FinishQuestionInput!) {
    finishQuestion(input: $input) {
      question {
        id
      }
    }
  }
`;

const QuestionCard = (props) => {
  const [question, setQuestion] = useState(props.question);
  const [open, setOpen] = useState(false);
  const [startQuestion, startQuestionRes] = useMutation(START_QUESTION);
  const [finishQuestion, finishQuestionRes] = useMutation(FINISH_QUESTION);

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

  const onFinish = () => {
    finishQuestion({
      variables: {
        input: {
          questionId: question.id
        }
      }
    }).then(() => {
      props.refetch();
    });
  }

  const isLoading = () => {
    return startQuestionRes && startQuestionRes.loading && finishQuestionRes && finishQuestionRes.loading;
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
            tertiary={ question.timeStarted }>
          { question.text && (question.text.length < 100 ? 
            question.text : question.text.substring(0, 99) + "...") }
          </Segment>
          <Segment attached="bottom" secondary textAlign="right" style={{"height":"50px",  "width":"300px"}}>
            <Header as="h5" floated='left'>
              {
                !question.timeStarted ?
                <Header.Content>
                  <Button compact
                    size='mini'
                    color='red'
                    content='Delete'
                    disabled={ isLoading() }
                    onClick={ triggerModal }/>
                  <Button compact
                    size='mini'
                    color='green'
                    content='Answer'
                    disabled={ isLoading() }
                    onClick={ onAnswer }/>
                </Header.Content>
                  :
                  <Header.Content>
                    <Button compact
                      size='mini'
                      color='green'
                      content='Finish'
                      disabled={ isLoading() }
                      onClick={ onFinish }/>
                  </Header.Content>
              }
              </Header>
              {
                question.timeStarted &&
                <Popup
                  trigger= {
                    <Icon name="sync" loading/>
                  }
                  content= {
                    "Started by: " + question.answeredBy.preferredName
                  }
                  basic inverted
                  position="bottom right"/>
              }
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
        </Segment>
  );
}

export default QuestionCard;
