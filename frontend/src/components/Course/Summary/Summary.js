// WIP
import React, { useState, useEffect } from "react";
import {
  Segment,
  Grid,
  Table,
  Dimmer,
  Loader,
  Button,
} from "semantic-ui-react";
import _ from "lodash";
import SummaryForm from "./SummaryForm";

import { gql } from "apollo-boost";
import { useLazyQuery } from "@apollo/react-hooks";

const GET_QUESTIONS = gql`
  query GetQuestions(
    $id: ID!
    $search: String
    $timeAsked_Gt: DateTime
    $timeAsked_Lt: DateTime
    $state: String
    $orderBy: String
    $first: Int
  ) {
    course(id: $id) {
      id
      queues {
        edges {
          node {
            id
            name
            tags
          }
        }
      }
      questions(
        search: $search
        timeAsked_Gt: $timeAsked_Gt
        timeAsked_Lt: $timeAsked_Lt
        state: $state
        orderBy: $orderBy
        first: $first
      ) {
        pageInfo {
          hasNextPage
        }
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
`;

const Summary = (props) => {
  const [getQuestions, { data, loading }] = useLazyQuery(GET_QUESTIONS);

  /* STATE */
  const [questions, setQuestions] = useState(null);
  const [queues, setQueues] = useState(null);
  const [filteredQuestions, setFilteredQuestions] = useState(null);
  const [first, setFirst] = useState(20);
  const [hasNextPage, setHasNextPage] = useState(null);
  const [orderBy, setOrderBy] = useState("-time_asked");
  const [search, setSearch] = useState("");
  const [input, setInput] = useState({});

  const formatState = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  /* HANDLE FILTER CHANGES */
  const onOrderByChange = () => {
    const newOrderBy = orderBy === "-time_asked" ? "time_asked" : "-time_asked";
    const variables = {
      ...input,
      search,
      orderBy: newOrderBy,
      id: props.course.id,
      first: 20,
    };
    getQuestions({
      variables: variables,
    });
    setOrderBy(newOrderBy);
    setFirst(20);
  };

  const onFilterChange = (input) => {
    /* need to filter out empty fields when they clear */
    const filteredInput = {};
    Object.keys(input)
      .filter((key) => {
        return input[key] !== "";
      })
      .forEach((key) => (filteredInput[key] = input[key]));

    const variables = {
      ...filteredInput,
      orderBy,
      search,
      id: props.course.id,
      first: 20,
    };
    getQuestions({ variables });
    setInput(input);
    setFirst(20);
  };

  const filterBySearch = (questions, text) => {
    return questions.filter((question) => {
      return (
        question.text.toUpperCase().includes(text.toUpperCase()) ||
        question.askedBy.toUpperCase().includes(text.toUpperCase()) ||
        question.answeredBy.toUpperCase().includes(text.toUpperCase())
      );
    });
  };

  const onSearchChange = (text) => {
    const filteredInput = {};
    Object.keys(input)
      .filter((key) => {
        return input[key] !== "";
      })
      .forEach((key) => (filteredInput[key] = input[key]));

    const variables = {
      ...filteredInput,
      search: text,
      orderBy,
      id: props.course.id,
      first: 20,
    };
    console.log(variables);
    getQuestions({ variables });
    setSearch(text);
    setFirst(20);
  };

  /* HANDLE PAGE CHANGE */
  const nextPage = () => {
    const filteredInput = {};
    Object.keys(input)
      .filter((key) => {
        return input[key] !== "";
      })
      .forEach((key) => (filteredInput[key] = input[key]));

    const variables = {
      ...filteredInput,
      search,
      orderBy,
      id: props.course.id,
      first: first + 20,
    };
    getQuestions({ variables });
    setFirst(first + 20);
  };

  /* GET QUESTIONS FROM DATA */
  const loadQueues = (data) => {
    const queues = [];
    data.course.queues.edges.forEach((item) => {
      queues.push({
        name: item.node.name,
        tags: item.node.tags,
      });
    });
    return queues;
  };

  const loadQuestions = (data) => {
    const questions = [];
    data.course.questions.edges.forEach((item) => {
      questions.push({
        text: item.node.text,
        tags: item.node.tags,
        queue: item.node.queue.name,
        timeAsked: item.node.timeAsked,
        askedBy: item.node.askedBy ? item.node.askedBy.fullName : "",
        answeredBy: item.node.answeredBy ? item.node.answeredBy.fullName : "",
        rejectedBy: item.node.rejectedBy ? item.node.rejectedBy.fullName : "",
        state: item.node.state,
      });
    });
    return questions;
  };

  /* LOAD DATA AND SORT BY TIME ASKED */
  if (data && data.course) {
    const newQuestions = loadQuestions(data);
    const newQueues = loadQueues(data);
    if (JSON.stringify(newQuestions) !== JSON.stringify(questions)) {
      setQuestions(newQuestions);
      setQueues(newQueues);
      setFilteredQuestions(filterBySearch(newQuestions, search));
      setHasNextPage(data.course.questions.pageInfo.hasNextPage);
    }
  }

  useEffect(() => {
    getQuestions({
      variables: {
        id: props.course.id,
        orderBy: "-time_asked",
        first: 20,
      },
    });
  }, []);

  return (
    <div>
      <Grid.Row>
        <Segment basic>
          <SummaryForm
            filterFunc={onFilterChange}
            queues={queues}
            searchFunc={onSearchChange}
          />
          <Table sortable celled padded striped>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell width={2}>Student</Table.HeaderCell>
                <Table.HeaderCell width={2}>Instructor</Table.HeaderCell>
                <Table.HeaderCell width={4}>Question</Table.HeaderCell>
                <Table.HeaderCell width={2}>Queue</Table.HeaderCell>
                <Table.HeaderCell
                  width={2}
                  sorted={
                    orderBy === "-time_asked" ? "descending" : "ascending"
                  }
                  onClick={onOrderByChange}
                >
                  Time Asked
                </Table.HeaderCell>
                <Table.HeaderCell width={1}>State</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            {loading && <Loader size="big" inverted />}
            {questions && (
              <Table.Body>
                {filteredQuestions.map((qs) => (
                  <Table.Row>
                    <Table.Cell>{qs.askedBy}</Table.Cell>
                    <Table.Cell>
                      {qs.answeredBy !== ""
                        ? qs.answeredBy
                        : qs.rejectedBy !== ""
                        ? qs.rejectedBy
                        : ""}
                    </Table.Cell>
                    <Table.Cell>{qs.text}</Table.Cell>
                    <Table.Cell>{qs.queue}</Table.Cell>
                    <Table.Cell>
                      {new Date(qs.timeAsked).toLocaleString("en-US", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </Table.Cell>
                    <Table.Cell>{formatState(qs.state)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            )}
            <Table.Footer>
              <Table.Row textAlign="right">
                <Table.HeaderCell colSpan="6">
                  <Button
                    primary
                    loading={loading}
                    content="Show More"
                    icon="angle down"
                    disabled={!hasNextPage}
                    onClick={nextPage}
                  />
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>
          <div>
            {filteredQuestions &&
              `${filteredQuestions.length} question${
                filteredQuestions.length === 1 ? "" : "s"
              }`}
          </div>
        </Segment>
      </Grid.Row>
    </div>
  );
};

export default Summary;
