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
    name: queue.name,
    description: queue.description,
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
          <Button type='submit' onClick={ () => { if (!loading) { onSubmit() } }}>Submit</Button>
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