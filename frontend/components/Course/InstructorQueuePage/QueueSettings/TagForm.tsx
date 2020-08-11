import React, { useState, useEffect, useRef } from 'react';
import { Segment, Header, Input, Label, Icon } from 'semantic-ui-react';
// import { gql } from 'apollo-boost';
// import { useMutation } from '@apollo/react-hooks';

/* GRAPHQL QUERIES/MUTATIONS */
// const UPDATE_QUEUE = gql`
//   mutation UpdateQueue($input: UpdateQueueInput!) {
//     updateQueue(input: $input) {
//       queue {
//         id
//         tags
//       }
//     }
//   }
// `;

const TagForm = (props) => {
  /* GRAPHQL QUERIES/MUTATIONS */
  const [updateQueue, { loading }] = useMutation(UPDATE_QUEUE);

  /* STATE */
  const [queue, setQueue] = useState(props.queue);
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState(props.queue.tags);

  const tagInput = useRef();

  /* HANDLER FUNCTIONS */
  const handleInputChange = (e, { value }) => {
    setNewTag(value);
  };

  const onSubmit = async () => {
    if (newTag && newTag.length !== 0) {
      const result = await updateQueue({
        variables: {
          input: {
            queueId: props.queue.id,
            tags: [...tags, newTag],
          }
        }
      });
      setTags(result.data.updateQueue.queue.tags);
      setNewTag("");
      await props.refetch();
    }
  };

  const onDelete = async (oldTag) => {
    const filteredTags = queue.tags.filter((tag) => tag !== oldTag);
    const result = await updateQueue({
      variables: {
        input: {
          queueId: props.queue.id,
          tags: filteredTags,
        }
      }
    });
    setTags(result.data.updateQueue.queue.tags);
    await props.refetch();
  };

  const handleKeyDown = async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      await onSubmit();
      tagInput.current.focus();
    }
  };

  /* PROPS UPDATE */
  useEffect(() => {
    setQueue(props.queue);
  }, [props.queue]);

  return (
    <div>
      <Segment basic>
        <Header content="Current Tags" />
        {
          queue && queue.tags.length > 0 && queue.tags.map(tag => (
            <Label>
              {tag}
              <Icon name="delete" disabled={loading} onClick={() => onDelete(tag)} />
            </Label>
          ))
        }
        {
          queue && queue.tags.length === 0 && !newTag && <Label color="blue" content="No Tags" />
        }
        {
          !loading && newTag && <Label color="green" content={newTag} />
        }
      </Segment>
      <Segment basic>
        <Header content="Add New Tags" />
        <Input
          icon="tag"
          iconPosition="left"
          placeholder="Tag"
          action={{
            color: "blue",
            content: "Add",
            type: "submit",
            onClick: onSubmit,
          }}
          name="newTag"
          disabled={loading}
          loading={loading}
          value={newTag}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          ref={tagInput} />
      </Segment>
    </div>
  )
};

export default TagForm;
