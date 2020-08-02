import React, { useState } from 'react';
import { Grid, Segment, Header, Form, Button } from 'semantic-ui-react';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import CreatableSelect from 'react-select/creatable';

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
  const [createQueue, { loading }] = useMutation(CREATE_QUEUE);

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
  const [tags, setTags] = useState([]);
  const [tagsInputValue, setTagsInputValue] = useState('');
  const [refetchLoading, setRefetchLoading] = useState(false);

  /* HANDLER FUNCTIONS */
  const handleInputChange = (e, { name, value }) => {
    input[name] = value;
    setInput(input);
    setDisabled(!input.name || !input.description);
  };

  const onSubmit = async () => {
    try {
      await createQueue({
        variables: {
          input: { ...input, tags: tags.map(i => i.value) }
        }
      });
      await setRefetchLoading(true);
      await props.refetch();
      await setRefetchLoading(false);
      props.backFunc('queues');
      props.successFunc();
    } catch (e) {
      setError(true);
    }
  };

  const handleTagChange = (items) => {
    setTags(items || []);
  };

  const handleTagsInputChange = (inputValue) => {
    setTagsInputValue(inputValue);
  };

  const handleTagsKeyDown = (event) => {
    if (!tagsInputValue) return;
    switch (event.key) {
      case 'Enter':
      case 'Tab':
        setTagsInputValue('');
        setTags([...tags, {label: tagsInputValue, value: tagsInputValue}]);
        event.preventDefault();
        return;
      default: return;
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
                disabled={ loading || refetchLoading }
                onChange={ handleInputChange }/>
            </Form.Field>
            <Form.Field required>
              <label>Description</label>
              <Form.Input
                placeholder="Description"
                name='description'
                disabled={ loading || refetchLoading }
                onChange={ handleInputChange }/>
            </Form.Field>
            <Form.Field>
              <label>Tags</label>
              <CreatableSelect
                components={{ DropdownIndicator: null }}
                inputValue={tagsInputValue}
                isClearable
                isMulti
                menuIsOpen={false}
                onChange={handleTagChange}
                onInputChange={handleTagsInputChange}
                onKeyDown={handleTagsKeyDown}
                placeholder="Type a tag and press enter..."
                value={tags}
              />
            </Form.Field>
            <Button
              content='Create'
              color='blue'
              type='submit'
              disabled={ disabled || loading || refetchLoading }
              loading={ loading }
              onClick={ onSubmit }/>
            <Button
              content='Cancel'
              type='submit'
              disabled={ loading || refetchLoading }
              onClick={ props.backFunc }/>
          </Form>
        </Segment>
      </Grid.Row>
      <Snackbar open={ error } autoHideDuration={6000} onClose={ () => setError(false) }>
        <Alert severity="error" onClose={ () => setError(false) }>
          <span>There was an error creating this queue. Names must be unique.</span>
        </Alert>
      </Snackbar>
    </Grid.Column>
  )
};

export default CreateQueue;
