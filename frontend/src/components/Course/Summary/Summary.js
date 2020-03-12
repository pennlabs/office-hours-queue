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

  /* FILTER USERS BASED ON INPUT */
  const filterQuestions = (input) => {
    const newFilteredQuestions = questions.filter(question => {
      return (
        (
          question.text.toUpperCase().includes(input.search.toUpperCase()) ||
          question.askedBy.toUpperCase().includes(input.search.toUpperCase()) ||
          question.answeredBy.toUpperCase().includes(input.search.toUpperCase())
        ) && (
          (!input.before || new Date(question.timeAsked).getTime() <= new Date(input.before).getTime()) &&
          (!input.after || new Date(question.timeAsked).getTime() >= new Date(input.after).getTime())
        )
      );
    });
    setFilteredQuestions(newFilteredQuestions);
    setTableState({ direction: null, column: null })
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
  
  return (
    <div>
      <Grid.Row>
      {
        questions &&
        <Segment basic>
           { questions && <SummaryForm filterFunc={ filterQuestions } queues={ queues } /> }
          <Table sortable celled padded>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell
                  sorted={tableState.column === 'askedBy' ? tableState.direction : null}
                  onClick={() => handleSort('askedBy')}
                  width={2}>Student</Table.HeaderCell>
                <Table.HeaderCell
                  sorted={tableState.column === 'answeredBy' ? tableState.direction : null}
                  onClick={() => handleSort('answeredBy')}
                  width={2}>Instructor</Table.HeaderCell>
                <Table.HeaderCell
                  sorted={tableState.column === 'text' ? tableState.direction : null}
                  onClick={() => handleSort('text')}
                  width={4}>Question</Table.HeaderCell>
                <Table.HeaderCell
                  sorted={tableState.column === 'queue' ? tableState.direction : null}
                  onClick={() => handleSort('queue')}
                  width={2}>Queue</Table.HeaderCell>
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
                        qs.rejectedBy !== '' ? qs.rejectedBy : ""
                      }
                    </Table.Cell>
                    <Table.Cell>{ qs.text }</Table.Cell>
                    <Table.Cell>{ qs.queue }</Table.Cell>
                    <Table.Cell>
                      {
                        new Date(qs.timeAsked).toLocaleString('en-US', {dateStyle: 'short', timeStyle: 'short'})
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
