import React, { useState } from 'react';
import { Modal, Segment, Button } from 'semantic-ui-react';
import { useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';

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
  const [withdrawQuestion, { loading, error, data }] = useMutation(WITHDRAW_QUESTION);

  const onDelete = async () => {
    await withdrawQuestion({
      variables: {
        input: {
          questionId: question.id
        }
      }
    })
    await props.refetch();
    props.setOpen(false);
  }

  return (
    <Modal open={ props.open }>
      <Modal.Header>Delete Question</Modal.Header>
      <Modal.Content>
          You are about to delete your question from <b>{queue.name}</b>:<br/>
          <Segment inverted color="blue">{`"${question.text}"`}</Segment>
          <b>Once you withdraw from the queue, you cannot regain your spot!</b>
      </Modal.Content>
      <Modal.Actions>
        <Button content="Cancel"
          disabled={ loading }
          onClick={() => { props.setOpen(false) }}/>
        <Button content="Delete"
          disabled={ loading } color="red"
          onClick={ onDelete }/>
      </Modal.Actions>
    </Modal>
  )
}

export default DeleteQuestionModal;
