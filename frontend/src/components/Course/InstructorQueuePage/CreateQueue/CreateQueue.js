import React, { useState } from 'react';
import { Grid, Segment, Header, Form, Button } from 'semantic-ui-react';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';

/* GRAPHQL QUERIES/MUTATIONS */
const CREATE_QUEUE = gql`
  mutation CreateQueue($input: CreateQueueInput!) {
    createQueue(input: $input) {
      queue {
        id
      }
    }
  }
`;

const CreateQueue = (props) => {
  /* GRAPHQL QUERIES/MUTATIONS */
  const [createQueue, { loading, data }] = useMutation(CREATE_QUEUE);

  /* STATE */
  const [disabled, setDisabled] = useState(true);
  const [error, setError] = useState(false);
  const [input, setInput] = useState({
    name: null,
    description: null,
    tags: [],
    startEndTimes: [],
    courseId: props.courseId
  });

  /* HANDLER FUNCTIONS */
  const handleInputChange = (e, { name, value }) => {
    input[name] = value;
    setInput(input);
    setDisabled(!input.name || !input.description);
  };

  const onSubmit = async () => {
    try{
      await createQueue({
      variables: {
        input: input
        }
      });
      await props.refetch();
      props.backFunc('queues');
      props.successFunc();
    } catch (e){
      setError(true);
    }
  };

  return (
    <Grid.Column width={13}>
      <Grid.Row>
        <Segment basic>
          <Header as="h3">
            Create New Queue
          </Header>
        </Segment>
      </Grid.Row>
      <Grid.Row>
        <Segment basic>
          <Form>
            <Form.Field required>
              <label>Name</label>
              <Form.Input
                placeholder="Name"
                name='name'
                disabled={ loading }
                onChange={ handleInputChange }/>
            </Form.Field>
            <Form.Field required>
              <label>Description</label>
              <Form.Input
                placeholder="Description"
                name='description'
                disabled={ loading }
                onChange={ handleInputChange }/>
            </Form.Field>
            <Button
              content='Submit'
              color='blue'
              type='submit'
              disabled={ disabled || loading }
              loading={loading}
              onClick={ onSubmit }/>
            <Button
              content='Cancel'
              type='submit'
              onClick={ props.backFunc }/>
          </Form>
        </Segment>
      </Grid.Row>
      <Snackbar open={ error } autoHideDuration={6000} onClose={ () => setError(false) }>
        <Alert severity="error" onClose={ () => setError(false) }>
          <span>There was an error creating this queue. Try changing the name.</span>
        </Alert>
      </Snackbar>
    </Grid.Column>
  )
};

export default CreateQueue;
