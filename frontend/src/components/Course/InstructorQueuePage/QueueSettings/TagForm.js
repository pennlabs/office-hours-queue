import React, { useState, useEffect } from 'react';
import { Segment, Header, Input, Label, Icon } from 'semantic-ui-react';
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
  const [newTag, setNewTag] = useState("");
  const [input, setInput] = useState({
    queueId: queue.id,
    tags: queue.tags
  });

  /* HANDLER FUNCTIONS */
  const handleInputChange = (e, { name, value }) => {
    setNewTag(value);
  };

  const onSubmit = async () => {
    if (newTag && newTag.length !== 0) {
      input.tags.push(newTag);
      setInput(input);
      await updateQueue({
        variables: {
          input: input
        }
      })
      setNewTag("");
      await props.refetch();
      setSuccess(true);
    }
  };

  const onDelete = async (oldTag) => {
    input.tags = queue.tags.filter((tag) => tag !== oldTag);
    await updateQueue({
      variables: {
        input: input
      }
    })
    await props.refetch();
    setSuccess(true);
    setNewTag(newTag);
  };

  /* PROPS UPDATE */
  useEffect(() => {
    setQueue(props.queue);
  }, [props.queue]);

  return (
    <div>
      <Segment basic>
      <Header content="Current Tags"/>
      {
        queue && queue.tags.length > 0 && queue.tags.map(tag => (
          <Label as="a"
            onClick={() => { if (!loading) { onDelete(tag) } }}>
            { tag }
            <Icon name="delete"/>
          </Label>
        ))
      }
      {
        queue && queue.tags.length === 0 && !newTag && <Label color="blue" content="No Tags"/>
      }
      {
        !loading && newTag && <Label color="green" content={ newTag }/>
      }
    </Segment>
    <Segment basic>
      <Header content="Add New Tags"/>
        <Input icon="tag"
          iconPosition="left"
          placeholder="New Tag Here..."
          action={{
            color: "blue",
            content: "Submit",
            onClick: () => { if (!loading) { onSubmit() } }
          }}
          name="newTag"
          disabled={ loading }
          value={ newTag }
          onChange={ handleInputChange }/>
      </Segment>
    </div>
  )
};

export default QueueForm;
