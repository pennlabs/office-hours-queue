import React, { useState, useEffect } from 'react';
import { Form, Button } from 'semantic-ui-react';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';

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
  const [input, setInput] = useState({
    name: null,
    description: null,
    queueId: queue.id
  });

  /* HANDLER FUNCTIONS */
  const handleInputChange = (e, { name, value }) => {
    input[name] = value;
    setInput(input);
  }

  const onSubmit = () => {
    updateQueue({
      variables: {
        input: input
      }
    }).then(() => {
      props.refetch();
      setSuccess(true);
    })
  }

  /* PROPS UPDATE */
  useEffect(() => {
    setQueue(props.queue);
  }, [props.queue])

  return (
    <Form>
      {
        !loading && queue &&
        <div>
          <Form.Field>
            <label>Name</label>
            <Form.Input
              defaultValue={ queue.name }
              name='name' required
              onChange={ handleInputChange }/>
          </Form.Field>
          <Form.Field>
            <label>Description</label>
            <Form.Input
              defaultValue={ queue.description }
              name='description' required
              onChange={ handleInputChange }/>
          </Form.Field>
          <Button type='submit' onClick={ onSubmit }>Submit</Button>
        </div>
      }
      {
        loading && <span>Updating...</span>
      }
      {
        success && !loading && <span>Updated!</span>
      }
    </Form>
  )
}

export default QueueForm;