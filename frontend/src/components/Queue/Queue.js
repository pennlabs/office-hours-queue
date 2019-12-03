import React from 'react';
import { Segment, Menu, Header, Grid, Image, Label } from 'semantic-ui-react';
import QuestionCard from './QuestionCard';
import { fakeMainQueue, fakeDebuggingQueue } from './questiondata.js';
import * as ROUTES from '../../constants/routes';


import { withAuthorization } from '../Session';
import { compose } from 'recompose';

class Queue extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
          code: "CIS 121",
          title: "Introduction to Data Structures and Algorithms",
          queues: [],
          tags: [
            { name: "hw3", isActive: false },
            { name: "dijkstra", isActive: false }
          ]
        };

        this.handleAnswerQuestion = this.handleAnswerQuestion.bind(this);
        this.handleDeleteQuestion = this.handleDeleteQuestion.bind(this);
        this.handleTagClick = this.handleTagClick.bind(this);
        this.handleTagClear = this.handleTagClear.bind(this);
        this.containsActiveTag = this.containsActiveTag.bind(this);
      }

      handleArchivedChange() {
        this.setState({ showArchived: !this.state.showArchived });
      }

      handleAnswerQuestion(queueIndex) {
      }

      handleDeleteQuestion(queueIndex, questionIndex) {
        var queues = this.state.queues;
        var queue = queues[queueIndex];
        var questions = queue.questions;
        var question = questions[questionIndex];
        question.isDeleted = true;

        this.setState({ queues: queues });
      }

      handleTagClick(index) {
        var tags = this.state.tags;
        var tag = tags[index];
        tag.isActive = !tag.isActive;
        this.setState({ tags: tags });
      }

      handleTagClear() {
        var tags = this.state.tags;
        tags.map(tag => {
          tag.isActive = false;
        });

        this.setState({ tags: tags });
      }

      containsActiveTag(question) {
        //why tf do i hav to do it this way
        var bool = false;
        var activeTags = this.state.tags.filter(tag => {
          return tag.isActive;
        }).map(tag => tag.name);

        if (activeTags.length == 0) {
          bool = true;;
        }

        question.tags.forEach(tag => {
          console.log(activeTags);
          console.log(tag);
          if (activeTags.includes(tag)) {
            bool = true;
          }
        });

        return bool;
      }

      componentDidMount() {
        this.setState({
          queues: [fakeMainQueue, fakeDebuggingQueue]
        });
      }

      render() {
        return (
          <Grid columns={2} divided="horizontally" style={{"width":"100%"}}>
            <Grid.Column width={3}>
              <Segment basic>
                <Image src='../../../ohq.png' size='tiny'/>
                <Menu vertical secondary fluid>
                  <Menu.Item
                    name='Dashboard'
                    href={ROUTES.DASHBOARD}
                    icon='dashboard'
                  />
                  <Menu.Item
                    name="Sample Queue"
                    href={ROUTES.QUEUE}
                    icon='hourglass one'
                    active={true}
                    color={'blue'}
                  />
                  <Menu.Item
                    name="Sample Roster"
                    icon='users'
                    href={ROUTES.ROSTER}
                    />
                </Menu>
              </Segment>
            </Grid.Column>
            <Grid.Column width={13}>
              <Grid columns={2} padded>
                <Grid.Row>
                  {/* COURSE HEADER */}
                  <Segment basic>
                    <Header as="h1">
                      {this.state.code}
                      <Header.Subheader>
                        {this.state.title}
                      </Header.Subheader>
                    </Header>
                  </Segment>
                </Grid.Row>
                <Grid.Row>
                  <Segment basic>
                    <Header as="h3" content="Tags (select to filter)"/>
                    {
                      this.state.tags.map((tag, index) => (
                        <Label
                          as="a"
                          color={tag.isActive ? "blue" : ""}
                          onClick={() => {this.handleTagClick(index)}}
                        >
                          { tag.name }
                        </Label>
                      ))
                    }
                    <a style={{"margin-left":"12px", "text-decoration":"underline"}}
                      onClick={this.handleTagClear}
                    >Clear All</a>
                  </Segment>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column>
                    <Header as="h3">
                      <Header.Content>
                        { this.state.queues.length > 0 && this.state.queues[0].title }
                      </Header.Content>
                    </Header>
                    {/* add main queue cards */}
                    <Grid.Row columns={1} padded="true">
                        {
                          this.state.queues.length > 0 &&
                          this.state.queues[0].questions.map((question, index) => (
                            !question.isDeleted && !question.isAnswered &&
                            this.containsActiveTag(question) &&
                            <Grid.Row>
                              <QuestionCard
                                asker={question.asker}
                                text={question.text}
                                time_asked={question.time_asked}
                                tags={question.tags[0]}
                                queueIndex={0}
                                id={index}
                                deleteFunc={this.handleDeleteQuestion}
                              />
                            </Grid.Row>
                          ))
                        }
                    </Grid.Row>
                  </Grid.Column>
                  <Grid.Column>
                    <Header as="h3">
                      <Header.Content>
                        { this.state.queues.length > 1 && this.state.queues[1].title }
                      </Header.Content>
                    </Header>
                    {/* add Debugging queue cards */}
                    <Grid.Row columns={1} padded="true">
                        {
                          this.state.queues.length > 1 &&
                          this.state.queues[1].questions.map((question, index) => (
                            !question.isAnswered && !question.isDeleted &&
                            this.containsActiveTag(question) &&
                            <Grid.Column>
                              <QuestionCard
                                asker={question.asker}
                                text={question.text}
                                time_asked={question.time_asked}
                                tags={question.tags[0]}
                                queueIndex={1}
                                id={index}
                                deleteFunc={this.handleDeleteQuestion}
                              />
                            </Grid.Column>
                          ))
                        }
                    </Grid.Row>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Grid.Column>
          </Grid>
        );
      }

}

const condition = authUser => !!authUser;

export default compose(
  withAuthorization(condition),
)(Queue);
