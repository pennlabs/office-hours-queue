import React, { useState, useEffect } from 'react'
import { Segment, Header, Button, Popup, Icon, Grid } from 'semantic-ui-react';
import EditQuestionModal from './EditQuestionModal';
import DeleteQuestionModal from './DeleteQuestionModal';

const QuestionCard = (props) => {
  const [question, setQuestion] = useState(props.question);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const timeString = (date, isLong) => {
    if (isLong) return new Date(date).toLocaleString('en-US', {dateStyle: 'short', timeStyle: 'short'});
    else return new Date(date).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric' })
  };

  useEffect(() => {
    setQuestion(props.question);
  }, [props.question]);

  return (
    <div style={{"marginTop":"10px"}}>
      <EditQuestionModal open={ openEdit }
        queue={ props.queue }
        question={ props.question }
        setOpen={ setOpenEdit }
        toastFunc={ props.toastFunc }
        refetch={ props.refetch}/>
      <DeleteQuestionModal open={ openDelete }
        queue={ props.queue }
        question={ props.question }
        setOpen={ setOpenDelete }
        toastFunc={ props.toastFunc }
        refetch={ props.refetch }/>
      <Segment attached="top" color="blue">
        <Grid>
          <Grid.Row columns="equal">
            <Grid.Column textAlign="left">
              <Header as="h5" style={{whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden"}}>
                { "Position: #" + (question.questionsAhead + 1) }
              </Header>
            </Grid.Column>
            <Grid.Column width={6}>
              <Header as="h5" color="blue" textAlign="right">
                Asked at { timeString(question.timeAsked, false) }
              </Header>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
      <Segment attached tertiary={ question.timeStarted !== null }>
        { question.text }
      </Segment>
      <Segment attached="bottom" secondary>
        <Grid>
          <Grid.Row columns="equal">
            <Grid.Column textAlign="left">
              <Header as="h5">
              {
                !question.timeStarted &&
                <Header.Content>
                  <Button compact
                    size='mini'
                    color='red'
                    content='Withdraw'
                    onClick={ () => setOpenDelete(true) }/>
                    <Button compact
                      size='mini'
                      color='green'
                      content='Edit'
                      onClick={ () => setOpenEdit(true) }/>
                </Header.Content>
              }
              </Header>
            </Grid.Column>
            <Grid.Column textAlign="right" width={5}
              style={{fontSize: "10px", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden"}}>
            {
              question.timeStarted &&
              <Popup wide
                trigger= { <Icon name="sync" loading/> }
                content= {
                  `Started by ${question.answeredBy.preferredName} on ${timeString(question.timeStarted, true)}`
                }
                basic inverted
                position="bottom right"/>
            }
            {
              question.tags && question.tags.length > 0 &&
              <Popup
                trigger= {
                  <span>{ question.tags.map(tag => " " + tag).toString() }</span>
                }
                content= { question.tags.map(tag => " " + tag).toString() }
                basic inverted
                position="bottom left"/>
            }
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </div>
  );
};

export default QuestionCard;
