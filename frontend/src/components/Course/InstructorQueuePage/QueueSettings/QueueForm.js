import React, { useState, useEffect } from 'react';
import { Form, Button, Modal } from 'semantic-ui-react';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';

/* GRAPHQL QUERIES/MUTATIONS */
const UPDATE_QUEUE = gql`
  mutation UpdateQueue($input: UpdateQueueInput!) {
    updateQueue(input: $input) {
      queue {
        id
      }
    }
  }
`;

const QueueForm = (props) => {
  /* GRAPHQL QUERIES/MUTATIONS */
  const [updateQueue, { data, loading }] = useMutation(UPDATE_QUEUE);

  /* STATE */
  const [success, setSuccess] = useState(false);
  const [queue, setQueue] = useState(props.queue);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState({
    name: queue.name,
    description: queue.description,
    queueId: queue.id
  });

  /* HANDLER FUNCTIONS */
  const handleInputChange = (e, { name, value }) => {
    input[name] = value;
    setInput(input);
  };

  const onSubmit = async () => {
    await updateQueue({
      variables: {
        input: input
      }
    })
    await props.refetch();
    setSuccess(true);
  };

  const onArchived = async () => {
    await updateQueue({
      variables: {
        input: {
          queueId: queue.id,
          archived: true
        }
      }
    })
    await props.refetch();
    setOpen(false);
    props.backFunc('queues');
  }

  /* PROPS UPDATE */
  useEffect(() => {
    setQueue(props.queue);
  }, [props.queue]);

  return (
    <Form>
      {
        queue &&
        <div>
          <Form.Field>
            <label>Name</label>
            <Form.Input
              defaultValue={ input.name }
              name='name'
              disabled={ loading }
              onChange={ handleInputChange }/>
          </Form.Field>
          <Form.Field>
            <label>Description</label>
            <Form.Input
              defaultValue={ input.description }
              name='description'
              disabled={ loading }
              onChange={ handleInputChange }/>
          </Form.Field>
          <Button type='submit' disabled={ loading }  onClick={ onSubmit }>Submit</Button>
          <Modal open={ open }
            trigger={
              <a style={{"textDecoration":"underline", "cursor":"pointer"}}
                onClick={ () => setOpen(true) }>Archive</a>
            }>
            <Modal.Header>Archive Queue</Modal.Header>
            <Modal.Content>You are about to archive this queue: <b>{queue.name}</b>. This cannot be undone!</Modal.Content>
            <Modal.Actions>
              <Button content="Cancel"
                disabled={ loading }
                onClick={ () => setOpen(false) }/>
              <Button content="Archive"
                onClick={ onArchived }
                disabled={ loading }
                color="red"/>
            </Modal.Actions>
          </Modal>
        </div>
      }
      <Snackbar open={ success } autoHideDuration={2000} onClose={ () => setSuccess(false) }>
        <Alert severity="success" onClose={ () => setSuccess(false) }>
          <span><b>{queue.name}</b> has been updated!</span>
        </Alert>
      </Snackbar>
    </Form>
  )
};

export default QueueForm;
