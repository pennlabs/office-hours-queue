import React, { useState, useEffect } from 'react'
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
    const d = new Date(date);
    const hour = d.getHours() > 12 ? d.getHours() - 12 : d.getHours();
    const meridiem = d.getHours() > 12 ? "pm" : "am";
    const minutes = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
    return `${hour}:${minutes} ${meridiem}`;
  };

  const triggerModal = () => {
    setOpen(!open);
  };

  const onAnswer = async () => {
    await startQuestion({
      variables: {
        input: {
          questionId: question.id
        }
      }
    })
    props.refetch();
  };

  const onFinish = async () => {
    await finishQuestion({
      variables: {
        input: {
          questionId: question.id
        }
      }
    })
    props.refetch();
  };

  const isLoading = () => {
    return startQuestionRes && startQuestionRes.loading && finishQuestionRes && finishQuestionRes.loading;
  };


  useEffect(() => {
    setQuestion(props.question);
  }, [props.question]);

  return (
    question && <div style={{"marginTop":"10px"}}>
      <DeleteQuestionModal open={open} question={question} closeFunc={triggerModal} refetch={ props.refetch }/>
        <Segment attached="top" color="blue" style={{"height":"50px"}}>
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
          tertiary={ question.timeStarted !== null }>
          { question.text }
        </Segment>
        <Segment attached="bottom" secondary textAlign="right" style={{"height":"50px"}}>
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
                  `Started by ${question.answeredBy.preferredName} 
                  at ${timeString(question.timeStarted)}`
                }
                basic inverted
                position="bottom right"/>
            }
            <Popup
              trigger= {
                <Icon name="tags"/>
              }
              content= {
                question.tags && question.tags.length > 0 ? question.tags.map(tag => {
                  return " " + tag
                }).toString() : <i>No Tags</i>
              }
              basic inverted
              position="bottom left"/>
        </Segment>
      </div>
  );
}

export default QuestionCard;
