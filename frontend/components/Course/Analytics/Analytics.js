import React, { useState } from 'react';
import { Segment, Header, Grid, Message } from 'semantic-ui-react';
import MyPieChart from './MyPieChart';

import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';

const GET_COURSE = gql`
  query GetCourse($id: ID!) {
    course(id: $id) {
      id
      queues {
        edges {
          node {
            id
            name
            archived
            tags
            questions {
              edges {
                node {
                  id
                  tags
                  timeAsked
                  askedBy {
                    id
                    preferredName
                  }
                  answeredBy {
                    id
                    preferredName
                  }
                  state
                }
              }
            }
          }
        }
      }
    }
  }
`;

const Analytics = (props) => {
  const { data } = useQuery(GET_COURSE, {
    variables: {
      id: props.course.id
    }
  });
  const [pieChartData, setPieChartData] = useState(null);
  const [lineChartData, setLineChartData] = useState(null);

  const getRandomColor = () => {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  const getPieChartData = (node) => {
    const counts = {};
    let noTagCount = 0;

    node.questions.edges.forEach(question => {
      if (question.node.tags.length === 0) noTagCount += 1;
      question.node.tags.forEach(tag => {
        counts[tag] = counts[tag] ? counts[tag] + 1 : 1;
      });
    });

    const labels = Object.keys(counts).sort();
    const datapoints = labels.map(label => counts[label]);

    if (noTagCount > 0) {
      labels.push("N/A");
      datapoints.push(noTagCount);
    }

    return {
      data: {
        labels: labels,
        datasets: [{
          data: datapoints,
          backgroundColor: [...Array(datapoints.length)].map(item => {
            return getRandomColor();
          })
        }]
      },
      type: 'pie',
      options: {
        title: {
          display: true,
          text: `Tag Categories: ${node.name}`
        }
      }
    };
  }

  const lineChartHelper = (node) => {
    const counts = {}
    node.questions.edges.forEach(question => {
      const dateAsked = new Date(question.node.timeAsked);
      counts[dateAsked.toDateString()] = counts[dateAsked.toDateString()] ?
        counts[dateAsked.toDateString()] + 1 : 1;
    });

    return counts;
  }

  const getLineChartData = (edges) => {
    const countMaps = edges.filter(item => !item.node.archived).map(item => lineChartHelper(item.node));
    const allCounts = {};

    countMaps.forEach(map => {
      Object.keys(map).forEach(key => allCounts[key] = map[key])
    });

    const stringLabels = Object.keys(allCounts).sort();
    const dateLabels = stringLabels.map(label => new Date(label));
    const datasets = edges.filter(item => !item.node.archived).map((item, i) =>{
      const color = getRandomColor();
      return {
        fill: false,
        label: item.node.name,
        data: stringLabels.map(label => {
          return countMaps[i][label] ? countMaps[i][label] : 0;
        }),
        borderColor: color,
        backgroundColor: color,
        lineTension: 0
      }
    });

    return {
      data: {
        labels: dateLabels,
        datasets: datasets
      },
      type: 'scatter',
      options: {
        fill: false,
        responsive: true,
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              displayFormats: {
                hour: 'MMM D hA'
              }
            },
            scaleLabel: {
              display: true,
              labelString: "Date"
            }
          }],
          yAxes: [{
            ticks: {
              beginAtZero: true,
            },
            display: true,
            scaleLabel: {
              display: true,
              labelString: "Number of Students",
            }
          }]
        }
      }
    }
  }

  if (data && data.course) {
    if (!pieChartData) {
      setPieChartData(data.course.queues.edges.filter(item => !item.node.archived).map(item => {
        return getPieChartData(item.node)
      }));
    }

    if (!lineChartData) {
      setLineChartData(getLineChartData(data.course.queues.edges));
    }
  }

  return (
    <Grid.Row>
      <Grid.Row style={{"marginTop":"10px"}}>
          <Message icon="exclamation triangle" header="Work in Progress"
            content="We're working on adding new analytics tools - stay tuned!" warning/>
      </Grid.Row>
      <Segment basic>
        <Header as="h3">Questions by Type</Header>
        {
          pieChartData && pieChartData.map(dataset => {
            return <MyPieChart dataset={ dataset } />
          })
        }
      </Segment>
      <Segment basic>
        <Header as="h3">Queue Traffic</Header>
        {
          lineChartData &&  <MyPieChart dataset={ lineChartData } />
        }
      </Segment>
    </Grid.Row>
  );
}

/*
class Analytics extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      people: [],
      direction: null,
      column: null
    };
  };

  componentDidMount() {
    this.setState({
      people: fakePeople
    });
    const node = this.node;
    const node2 = this.node2;
    const node3 = this.node3;
    const node4 = this.node4;

    new Chart(node, options);
    new Chart(node2, options2);
    new Chart(node3, options3);
    new Chart(node4, options4)
  }

  handleSort = (clickedColumn) => () => {
    const { column, people, direction } = this.state

    if (column !== clickedColumn) {
      this.setState({
        column: clickedColumn,
        people: _.sortBy(people, [clickedColumn]),
        direction: 'ascending',
      })

      return
    }

    this.setState({
      people: people.reverse(),
      direction: direction === 'ascending' ? 'descending' : 'ascending',
    })
  }

  render(){
    const { column, direction } = this.state
    return(
      <Grid.Row>
        <Segment basic>
          <Header as="h3">Usage Trends of Queues</Header>
          <canvas
            style={{ width: 800, height: 300 }}
            ref={node => (this.node = node)}
          />
          <Header as="h3">Other Usage Trends</Header>
          <canvas
            style={{ width: 800, height: 300 }}
            ref={node2 => (this.node2 = node2)}
          />
          <Header as="h3">Questions by Type</Header>
          <canvas
            style={{ width: 800, height: 300 }}
            ref={node3 => (this.node3 = node3)}
          />
          <Header as="h3">Questions by Lecture Topic</Header>
          <canvas
            style={{ width: 800, height: 300 }}
            ref={node4 => (this.node4 = node4)}
          />

          <Header as="h3">Student Participation</Header>
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell
                  sorted={column === 'fullName' ? direction : null}
                  onClick={this.handleSort('fullName')}
                >
                  Full Name</Table.HeaderCell>
                <Table.HeaderCell
                  sorted={column === 'preferredName' ? direction : null}
                  onClick={this.handleSort('preferredName')}
                >Email</Table.HeaderCell>
                <Table.HeaderCell
                  sorted={column === 'email' ? direction : null}
                  onClick={this.handleSort('email')}
                >Number of Questions Asked</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {this.state.people.map(person => (
                <Table.Row>
                  <Table.Cell>{person.fullName}</Table.Cell>
                  <Table.Cell>{person.email}</Table.Cell>
                  <Table.Cell>{3}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Segment>
      </Grid.Row>
    );
  }
}*/

export default Analytics;
