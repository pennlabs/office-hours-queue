// WIP
import React, { useState } from 'react';
import { Segment, Header, Grid, Table } from 'semantic-ui-react';
import _ from 'lodash';

import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';

const GET_QUESTIONS = gql`
  query GetQuestions($id: ID!) {
    course(id: $id) {
      id
      name
      queues {
        edges {
          node {
            id
            name
            tags
            questions {
              edges {
                node {
                  id
                  text
                  tags
                  queue {
                    name
                  }
                  timeAsked
                  timeWithdrawn
                  timeRejected
                  timeStarted
                  timeAnswered
                  rejectedReason
                  rejectedBy {
                    id
                    fullName
                    preferredName
                  }
                  askedBy {
                    id
                    fullName
                    preferredName
                  }
                  answeredBy {
                    id
                    fullName
                    preferredName
                  }
                }
              }
            }  
          }
        }
      }
    }
  }
`;

const Summary = (props) => {
  const { loading, error, data, refetch } = useQuery(GET_QUESTIONS, { variables: {
    id: props.course.id
  }});

  /* STATE */
  const [questions, setQuestions] = useState(null);
  const [filteredQuestions, setFilteredQuestions] = useState(null);
  const [open, setOpen] = useState(false);
  const [tableState, setTableState] = useState({ direction: null, column: null })

  /* MODAL FUNCTIONS */
  const triggerModal = () => {
    setOpen(!open);
  }

  /* TABLE FUNCTIONS */
  const handleSort = (clickedColumn) => {
    if (tableState.column !== clickedColumn) {
      setTableState({
        column: clickedColumn,
        direction: 'ascending',
      });
      setFilteredQuestions(_.sortBy(filteredQuestions, clickedColumn));
    } else {
      setTableState({
        column: tableState.column,
        direction: tableState.direction === 'ascending' ? 'descending' : 'ascending',
      });
      setFilteredQuestions(filteredQuestions.reverse());
    }
  }

  /* GET QUESTIONS FROM DATA */
  const loadQuestions = (data) => {
    var questions = []
    data.course.queues.edges.map((item) => {
      item.node.questions.edges.map((qs) => {
        questions.push({
          text: qs.node.text,
          tags: qs.node.tags,
          queue: qs.node.queue.name,
          timeAsked: new Date(Date.parse(qs.node.timeAsked)).toLocaleString('en-US'),
          askedBy: qs.node.askedBy.fullName,
          answeredBy: qs.node.answeredBy.fullName,
        })
      })
    });
    console.log(questions)
    return questions;
  }

  /* LOAD DATA */
  if (data && data.course) {
    var newQuestions = loadQuestions(data);
    if (JSON.stringify(newQuestions) !== JSON.stringify(questions)) {
      setQuestions(newQuestions);
      setFilteredQuestions(newQuestions);
    }
  }

  return (
    <div>
      <Grid.Row>
        <Segment basic>
          <Header as="h3">
            Question Summary
          </Header>
        </Segment>
      </Grid.Row>
      <Grid.Row>
      {
        questions &&
        <Table sortable celled padded>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell
                sorted={tableState.column === 'fullName' ? tableState.direction : null}
                onClick={() => handleSort('fullName')}
                width={3}>Student Name</Table.HeaderCell>
              <Table.HeaderCell
                sorted={tableState.column === 'instructorName' ? tableState.direction : null}
                onClick={() => handleSort('instructorName')}
                width={3}>Instructor Name</Table.HeaderCell>
              <Table.HeaderCell
                sorted={tableState.column === 'questionAsked' ? tableState.direction : null}
                onClick={() => handleSort('questionAsked')}
                width={3}>Question Asked</Table.HeaderCell>
              <Table.HeaderCell
                sorted={tableState.column === 'tags' ? tableState.direction : null}
                onClick={() => handleSort('tags')}
                width={3}>Tags</Table.HeaderCell>
              <Table.HeaderCell
                sorted={tableState.column === 'queue' ? tableState.direction : null}
                onClick={() => handleSort('queue')}
                width={3}>Queue</Table.HeaderCell>
              <Table.HeaderCell
                sorted={tableState.column === 'timeAsked' ? tableState.direction : null}
                onClick={() => handleSort('timeAsked')}
                width={3}>Time Asked</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              filteredQuestions.map(question => (
                <Table.Row>
                  <Table.Cell>{ question.askedBy }</Table.Cell>
                  <Table.Cell>{ question.answeredBy }</Table.Cell>
                  <Table.Cell>{ question.text }</Table.Cell>
                  <Table.Cell>{ question.tags.join(', ') }</Table.Cell>
                  <Table.Cell>{ question.queue }</Table.Cell>
                  <Table.Cell>{ question.timeAsked }</Table.Cell>
                </Table.Row>
              ))
            }
          </Table.Body>
        </Table>
      }
      </Grid.Row>
    </div>
  );
}

export default Summary;