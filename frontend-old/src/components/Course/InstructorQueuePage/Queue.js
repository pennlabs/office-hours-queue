import React, { useState, useEffect } from 'react';
import { Header, Label, Grid, Segment, Button } from 'semantic-ui-react';
import { gql } from 'apollo-boost';
import {useMutation, useQuery} from '@apollo/react-hooks';
import Linkify from 'react-linkify';
import Questions from './Questions';
import QueueFilterForm from './QueueFilterForm';
import ClearQueueModal from './ClearQueueModal';
import { linkifyComponentDecorator } from '../../../utils';

import UIFx from 'uifx';
import notificationMp3 from './notification.mp3';
import firebase from "../../Firebase";

const notification = new UIFx(notificationMp3);

const GET_QUESTIONS = gql`
  query GetQuestions($id: ID!) {
    queue(id: $id) {
      id
      tags
      queueQuestions {
        edges {
          node {
            id
            text
            tags
            state
            timeAsked
            timeStarted
            timeAnswered
            orderKey
            videoChatUrl
            askedBy {
              id
              preferredName
              fullName
              email
            }
            answeredBy {
              id
              preferredName
            }
          }
        }
      }
    }
  }
`;

const ACTIVATE_QUEUE = gql`
  mutation ManuallyActivateQueue($input: ManuallyActivateQueueInput!) {
    manuallyActivateQueue(input: $input) {
      queue {
        id
      }
    }
  }
`;

const DEACTIVATE_QUEUE = gql`
  mutation ManuallyDeactivateQueue($input: ManuallyDeactivateQueueInput!) {
    manuallyDeactivateQueue(input: $input) {
      queue {
        id
      }
    }
  }
`;

const Queue = (props) => {
  const pollInterval = 3000 + Math.random() * 500
  const { data, refetch, startPolling, stopPolling } = useQuery(GET_QUESTIONS, {
    variables: {
      id: props.queue.id
    },
    pollInterval: pollInterval,
    skip: !props.queue.id
  });
  const [activateQueue, activateQueueRes] = useMutation(ACTIVATE_QUEUE);
  const [deactivateQueue, deactivateQueueRes] = useMutation(DEACTIVATE_QUEUE);

  /* STATE */
  const [queue, setQueue] = useState(props.queue);
  const [active, setActive] = useState(props.queue.activeOverrideTime !== null);
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [tags, setTags] = useState([]);
  const [filters, setFilters] = useState({ tags: [], status: null });
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const getQuestions = (data) => {
    if (!data) { return [] }
    return data.queue.queueQuestions.edges.map((item) => {
      return {
        id: item.node.id,
        orderKey: item.node.orderKey,
        text: item.node.text,
        tags: item.node.tags,
        state: item.node.state,
        timeAsked: item.node.timeAsked,
        askedBy: item.node.askedBy,
        timeStarted: item.node.timeStarted,
        timeAnswered: item.node.timeAnswered,
        answeredBy: item.node.answeredBy,
        videoChatUrl: item.node.videoChatUrl
      };
    });
  };

  const onOpen = async () => {
    firebase.analytics.logEvent('queue_activate');
    await activateQueue({
      variables: {
        input: {
          queueId: props.queue.id
        }
      }
    });
    // Update UI immediately
    setActive(true);
    props.refetch();
  };

  const onClose = async () => {
    firebase.analytics.logEvent('queue_deactivate');
    await deactivateQueue({
      variables: {
        input: {
          queueId: props.queue.id
        }
      }
    });
    // Update UI immediately
    setActive(false);
    props.refetch();
  };

  const filter = (questions, filters) => {
    return questions.filter(question => {
      return isSubset(question.tags, filters.tags);
    });
  };

  // Returns true if l1 is a subset of l2
  const isSubset = (l1, l2) => {
    if (l2.length === 0)  return true;
    return l1.filter(value => l2.includes(value)).length > 0;
  };

  const handleFilterChange = (input) => {
    setFilters(input);
    setFilteredQuestions(filter(questions, input));
  };

  if (data && data.queue) {
    const newQuestions = getQuestions(data);
    if (JSON.stringify(newQuestions) !== JSON.stringify(questions)) {
      if (!isFirstLoad && questions.length === 0) {
        notification.play();
      }
      setQuestions(newQuestions);
      setFilteredQuestions(filter(newQuestions, filters));
    }

    if (JSON.stringify(data.queue.tags) !== JSON.stringify(tags)) {
      setTags(data.queue.tags);
    }

    !active && data.queue.queueQuestions.edges.length === 0 ? stopPolling() : startPolling(pollInterval);

    if (isFirstLoad) { setIsFirstLoad(false) }
  }

  useEffect(() => {
    setQueue(props.queue);
    setActive(props.queue.activeOverrideTime !== null)
  }, [props.queue]);

  const queueQuestions = filter(questions, { tags: [] });

  return (
    <Segment basic>
      <ClearQueueModal
        open={ clearModalOpen }
        queue={ queue }
        refetch={ props.refetch }
        closeFunc={ () => setClearModalOpen(false) }/>
      <Header as="h3">
        { queue.name }
        <Header.Subheader>
          <Linkify componentDecorator={linkifyComponentDecorator}>
            { queue.description }
          </Linkify>
        </Header.Subheader>
      </Header>
      <Grid>
        <Grid.Row columns="equal">
          <Grid.Column width={5} only="computer mobile">
            { (queue.activeOverrideTime || queueQuestions.length !== 0) &&
              <Label
                content={ queueQuestions.length + ` user${queueQuestions.length === 1 ? '' : 's'}` }
                color="blue"
                icon="user"/>
            }
            {
              /*
              <Label content={queue.estimatedWaitTime + " mins"} color="blue" icon="clock"/>
              */
            }
          </Grid.Column>
          <Grid.Column textAlign="right" floated="right">
            { props.leader &&
              <Button
                size="mini"
                content="Edit"
                icon="cog"
                onClick={ props.editFunc }/>
            }
            <Button
              size="mini"
              content="Close"
              color={ !active ? null : "red" }
              disabled={ !active || (deactivateQueueRes && deactivateQueueRes.loading) }
              loading={ deactivateQueueRes && deactivateQueueRes.loading  }
              onClick={ onClose }/>
            <Button size="mini"
              content="Open"
              color={ active ? null : "green" }
              disabled={ active || (activateQueueRes && activateQueueRes.loading) }
              loading={ activateQueueRes && activateQueueRes.loading }
              onClick={ onOpen }/>
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <Grid style={{marginTop: "-5px"}}>
        <Grid.Row columns="equal">
          {
            tags.length > 0 &&
            <Grid.Column>
              <QueueFilterForm tags={ tags } changeFunc={ handleFilterChange }/>
            </Grid.Column>
          }
          {
            !active && questions.length > 0 &&
            <Grid.Column textAlign="right" floated="right" only="computer mobile">
              <Button
                content="Clear Queue"
                fluid size="medium"
                basic color="red"
                onClick={ () => setClearModalOpen(true) }/>
            </Grid.Column>
          }
        </Grid.Row>
      </Grid>
      <Grid.Row columns={1}>
        <Questions
          questions={ filteredQuestions }
          filters={ filters }
          refetch={ refetch }
          active={ active }
          userId={ props.userId }/>
      </Grid.Row>
    </Segment>
  );
};

export default Queue;
