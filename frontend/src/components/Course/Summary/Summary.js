// WIP
import React, { useState } from 'react';
import { Segment, Header, Grid, Table } from 'semantic-ui-react';
import _ from 'lodash';
import SummaryForm from './SummaryForm';

import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';

const GET_QUESTIONS = gql`
  query GetQuestions($id: ID!) {
    course(id: $id) {
      id
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
                  state
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
  };

  /* FILTER USERS BASED ON INPUT */
  const filterQuestions = (input) => {
    const newFilteredQuestions = questions.filter((qs) => {
      return (
        qs.text.toUpperCase().includes(input.search) ||
        qs.askedBy.toUpperCase().includes(input.search) ||
        qs.answeredBy.toUpperCase().includes(input.search) ||
        qs.rejectedBy.toUpperCase().includes(input.search)
        //&& (!input.role || user.role === input.role)
      );
    });
    setFilteredQuestions(newFilteredQuestions);
    setTableState({ direction: null, column: null })
  };

  const closeModal = async () => {
    await refetch();
    triggerModal();
  };

  const formatState = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
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
  };

  /* GET QUESTIONS FROM DATA */
  const queues = [];
  const loadQuestions = (data) => {
    const questions = [];
    data.course.queues.edges.forEach(item => {
      queues.push({
        name: item.node.name,
        tags: item.node.tags
      });
      item.node.questions.edges.forEach(qs => {
        questions.push({
          text: qs.node.text,
          tags: qs.node.tags,
          queue: qs.node.queue.name,
          timeAsked: qs.node.timeAsked,
          askedBy: qs.node.askedBy.fullName,
          answeredBy: qs.node.answeredBy ? qs.node.answeredBy.fullName : "",
          rejectedBy: qs.node.rejectedBy ? qs.node.rejectedBy.fullName : "",
          state: qs.node.state
        })
      })
    });
    return questions;
  };

  /* LOAD DATA AND SORT BY TIME ASKED */
  if (data && data.course) {
    const newQuestions = loadQuestions(data);
    if (JSON.stringify(newQuestions) !== JSON.stringify(questions)) {
      setQuestions(newQuestions);
      setFilteredQuestions(_.sortBy(newQuestions, 'timeAsked').reverse());
      setTableState({
        column: 'timeAsked',
        direction: 'ascending',
      });
    }
  }

  /*
    Still TODO:
      - Add a couple more fields to table (rejected, etc.)
      - Add filtering abilities
      - Format the table nicely.
  */

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
        <Segment basic>
           { questions && <SummaryForm filterFunc={ filterQuestions } queues={ queues } /> }
          <Table sortable celled padded>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell
                  sorted={tableState.column === 'asker' ? tableState.direction : null}
                  onClick={() => handleSort('asker')}
                  width={2}>Asked By</Table.HeaderCell>
                <Table.HeaderCell
                  sorted={tableState.column === 'answerer' ? tableState.direction : null}
                  onClick={() => handleSort('answerer')}
                  width={2}>Answered By</Table.HeaderCell>
                <Table.HeaderCell
                  sorted={tableState.column === 'questionAsked' ? tableState.direction : null}
                  onClick={() => handleSort('questionAsked')}
                  width={4}>Question</Table.HeaderCell>
                <Table.HeaderCell
                  sorted={tableState.column === 'queue' ? tableState.direction : null}
                  onClick={() => handleSort('queue')}
                  width={2}>Queue/Tags</Table.HeaderCell>
                <Table.HeaderCell
                  sorted={tableState.column === 'timeAsked' ? tableState.direction : null}
                  onClick={() => handleSort('timeAsked')}
                  width={2}>Time Asked</Table.HeaderCell>
                <Table.HeaderCell
                  sorted={tableState.column === 'state' ? tableState.direction : null}
                  onClick={() => handleSort('state')}
                  width={1}>Result</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {
                filteredQuestions.map(qs => (
                  <Table.Row>
                    <Table.Cell>{ qs.askedBy }</Table.Cell>
                    <Table.Cell>
                      {
                        qs.answeredBy !== '' ? qs.answeredBy :
                        qs.rejectedBy !== '' ? "Rejected by: " + qs.rejectedBy : ""
                      }
                    </Table.Cell>
                    <Table.Cell>{ qs.text }</Table.Cell>
                    <Table.Cell>
                      { qs.queue }
                      <br/>
                      {qs.tags.length !== 0 ? qs.tags.join(', ') : ''}
                    </Table.Cell>
                    <Table.Cell>
                      {
                        new Date(Date.parse(qs.timeAsked))
                          .toLocaleString('en-US', {dateStyle: 'short', timeStyle: 'short'})
                      }
                    </Table.Cell>
                    <Table.Cell>
                      {
                        formatState(qs.state)
                      }
                    </Table.Cell>
                  </Table.Row>
                ))
              }
            </Table.Body>
          </Table>
        </Segment>
      }
      </Grid.Row>
    </div>
  );
};

export default Summary;
