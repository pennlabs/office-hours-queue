import React, { useState, useEffect } from 'react';
import { Modal, Segment, Button } from 'semantic-ui-react';
import { useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import firebase from "../../Firebase";

const WITHDRAW_QUESTION = gql`
  mutation WithdrawQuestion($input: WithdrawQuestionInput!) {
    withdrawQuestion(input: $input) {
      question {
        id
      }
    }
  }
`;

const DeleteQuestionModal = (props) => {
  const [question, setQuestion] = useState(props.question);
  const [queue, setQueue] = useState(props.queue);
  const [withdrawQuestion, { loading }] = useMutation(WITHDRAW_QUESTION);

  const onDelete = async () => {
    try {
      await withdrawQuestion({
        variables: {
          input: {
            questionId: question.id
          }
        }
      });
      firebase.analytics.logEvent('question_withdrawn');
      await props.refetch();
      props.setOpen(false);
      props.toastFunc("Question withdrawn!", null);
    } catch (e) {
      props.setOpen(false);
      props.toastFunc(null, e);
    }
  };

  useEffect(() => {
    setQuestion(props.question);
  }, [props.question]);

  useEffect(() => {
    setQueue(props.queue)
  }, [props.queue]);

  return (
    <Modal open={ props.open }>
      <Modal.Header>Withdraw Question</Modal.Header>
      <Modal.Content>
          You are about to withdraw your question from <b>{queue.name}</b>:<br/>
          <Segment inverted color="red">{`"${question.text}"`}</Segment>
          <b>Once you withdraw from the queue, you cannot regain your spot!</b>
      </Modal.Content>
      <Modal.Actions>
        <Button
          content="Cancel"
          disabled={ loading }
          onClick={() => { props.setOpen(false) }}/>
        <Button
          content="Withdraw"
          disabled={ loading }
          loading={ loading }
          color="red"
          onClick={ onDelete }/>
      </Modal.Actions>
    </Modal>
  )
};

export default DeleteQuestionModal;
