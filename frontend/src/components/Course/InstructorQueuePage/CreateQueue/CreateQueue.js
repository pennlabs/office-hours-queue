import React, { useState } from 'react';
import { Grid, Segment, Header, Form, Button } from 'semantic-ui-react';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';

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
  const [success, setSuccess] = useState(false);
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
  }

  const onSubmit = () => {
    createQueue({
      variables: {
        input: input
      }
    }).then(() => {
      props.refetch();
      setSuccess(true);
    })
  }

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
            <Form.Field>
              <label>Name</label>
              <Form.Input
                placeholder="Name"
                name='name'
                disabled={ loading }
                onChange={ handleInputChange }/>
            </Form.Field>
            <Form.Field>
              <label>Description</label>
              <Form.Input
                placeholder="Description"
                name='description'
                disabled={ loading} 
                onChange={ handleInputChange }/>
            </Form.Field>
            <Button type='submit' onClick={ () => { if (!loading ) { onSubmit() }} }>Submit</Button>
            {
              loading && <span>Creating...</span>
            }
            {
              success && !loading && <span>Created!</span>
            }
          </Form>
        </Segment>
      </Grid.Row>
    </Grid.Column>
  );
}

export default CreateQueue;