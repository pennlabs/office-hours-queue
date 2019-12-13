import React from 'react';
import { Segment, Menu, Header, Grid, Image, Label, Modal, Form, Button, Input } from 'semantic-ui-react';
import QuestionCard from './QuestionCard';
import DeleteQuestionModal from './DeleteQuestionModal';
import { fakeCourse } from './questiondata.js';
import * as ROUTES from '../../constants/routes';


import { withAuthorization } from '../Session';
import { compose } from 'recompose';


class Queue extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
          course: "",
          allTags: [],
          questionToDelete: {},
          deleteModal: {
            open: false,
            reason: "",
            textDisabled: true,
            text: ""
          }
        };

        this.handleStartQuestion = this.handleStartQuestion.bind(this);
        this.handleAnswerQuestion = this.handleAnswerQuestion.bind(this);

        this.handleTagClick = this.handleTagClick.bind(this);
        this.handleTagClear = this.handleTagClear.bind(this);
        this.containsActiveTag = this.containsActiveTag.bind(this);
        this.addNewTag = this.addNewTag.bind(this);

        this.handleDeleteDropdownChange = this.handleDeleteDropdownChange.bind(this);
        this.openDeleteModal = this.openDeleteModal.bind(this);
        this.closeDeleteModal = this.closeDeleteModal.bind(this);
        this.handleDeleteQuestion = this.handleDeleteQuestion.bind(this);
      }

      componentDidMount() {
        var tags = [];

        fakeCourse.queues.forEach(queue => {
            queue.tags.forEach(tag => {
              tags.push({ name: tag, isActive: false });
            });
        });

        this.setState({
          course: fakeCourse,
          allTags: tags
        });
      }

      /* ANSWER QUESTIONS FUNCTIONS */

      handleStartQuestion(queueIndex, questionIndex) {
        var course = this.state.course;
        var queue = course.queues[queueIndex];
        var question = queue.questions[questionIndex];
        question.timeStarted = "fake time";

        this.setState({ course: course });
      }

      handleAnswerQuestion(queueIndex, questionIndex) {
        var course = this.state.course;
        var queue = course.queues[queueIndex];
        var question = queue.questions[questionIndex];
        question.timeAnswered = "fake time";

        this.setState({ course: course });
      }

      /* TAG FUNCTIONS */

      handleTagClick(index) {
        var tags = this.state.allTags;
        var tag = tags[index];
        tag.isActive = !tag.isActive;
        this.setState({ allTags: tags });
      }

      handleTagClear() {
        var tags = this.state.allTags;
        tags.map(tag => {
          tag.isActive = false;
        });

        this.setState({ allTags: tags });
      }

      containsActiveTag(question) {
        //why tf do i hav to do it this way
        var bool = false;
        var activeTags = this.state.allTags.filter(tag => {
          return tag.isActive;
        }).map(tag => tag.name);

        if (activeTags.length == 0) {
          bool = true;;
        }

        question.tags.forEach(tag => {
          if (activeTags.includes(tag)) {
            bool = true;
          }
        });

        return bool;
      }

      addNewTag() {

      }

      /* DELETE QUESTION FUNCTIONS */

      openDeleteModal(queueIndex, questionIndex) {
        var deleteModal = this.state.deleteModal;
        deleteModal.open = true;

        var queue = this.state.course.queues[queueIndex];
        var questionToDelete = queue.questions[questionIndex];
        questionToDelete.queueIndex = queueIndex;
        questionToDelete.questionIndex = questionIndex;

        this.setState({ deleteModal: deleteModal, questionToDelete: questionToDelete });
      }

      handleDeleteDropdownChange(e, { value }) {
        var deleteModal = this.state.deleteModal;
        deleteModal.reason = value;
        deleteModal.textDisabled = deleteModal.reason != "OTHER";
        this.setState({ deleteModal: deleteModal });
      }

      handleDeleteQuestion() {
        var course = this.state.course;
        var queue = course.queues[this.state.questionToDelete.queueIndex];
        var question = queue.questions[this.state.questionToDelete.questionIndex];
        question.timeRejected = "fake time";

        this.setState({ course: course, questionToDelete: question });
        this.closeDeleteModal();
      }

      closeDeleteModal() {
        var deleteModal = {
          open: false,
          reason: "",
          textDisabled: true,
          text: ""
        }

        this.setState({ deleteModal: deleteModal });
      }

      render() {
        return (
          <Grid columns={2} divided="horizontally" style={{"width":"100%"}}>
            <DeleteQuestionModal
              attrs={this.state.deleteModal}
              question={this.state.questionToDelete}
              funcs={{
                dropdownFunc: this.handleDeleteDropdownChange,
                closeFunc: this.closeDeleteModal,
                deleteFunc: this.handleDeleteQuestion
              }}
            />
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
                      {this.state.course.department + " " + this.state.course.name}
                      <Header.Subheader>
                        {this.state.course.description}
                      </Header.Subheader>
                    </Header>
                  </Segment>
                </Grid.Row>
                <Grid.Row>
                  <Segment basic>
                    <Header as="h3" content="Tags (select to filter)"/>
                    {
                      this.state.allTags.map((tag, index) => (
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
                  <Segment basic>
                    <Input style={{"margin-top":"-50px"}} placeholder="Add New Tag..." icon="tag"/>
                    <Button
                      style={{"margin-left":"12px"}}
                      color="green"
                      content="Add"
                    />
                  </Segment>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column>
                    <Header as="h3">
                      {
                        this.state.course.queues &&
                        this.state.course.queues.length > 0 &&
                        this.state.course.queues[0].name
                      }
                      <Header.Subheader>
                        {
                          this.state.course.queues &&
                          this.state.course.queues.length > 0 &&
                          this.state.course.queues[0].description
                        }
                      </Header.Subheader>
                    </Header>
                    {/* add main queue cards */}
                    <Grid.Row columns={1} padded="true">
                        {
                          this.state.course.queues &&
                          this.state.course.queues.length > 0 &&
                          this.state.course.queues[0].questions.map((question, index) => (
                            !question.timeRejected && !question.timeAnswered &&
                            this.containsActiveTag(question) &&
                            <Grid.Row>
                              <QuestionCard
                                asker={question.asker}
                                text={question.text}
                                time_asked={question.timeAsked}
                                tags={question.tags}
                                queueIndex={0}
                                id={index}
                                deleteFunc={this.openDeleteModal}
                                answerFunc={this.handleStartQuestion}
                                finishFunc={this.handleAnswerQuestion}
                                started={question.timeStarted}
                              />
                            </Grid.Row>
                          ))
                        }
                    </Grid.Row>
                  </Grid.Column>
                  <Grid.Column>
                    <Header as="h3">
                      {
                        this.state.course.queues &&
                        this.state.course.queues.length > 1 &&
                        this.state.course.queues[1].name
                      }
                      <Header.Subheader>
                        {
                          this.state.course.queues &&
                          this.state.course.queues.length > 1 &&
                          this.state.course.queues[1].description
                        }
                      </Header.Subheader>
                    </Header>
                    {/* add Debugging queue cards */}
                    <Grid.Row columns={1} padded="true">
                        {
                          this.state.course.queues &&
                          this.state.course.queues.length > 1 &&
                          this.state.course.queues[1].questions.map((question, index) => (
                            !question.timeAnswered && !question.timeRejected &&
                            this.containsActiveTag(question) &&
                            <Grid.Column>
                              <QuestionCard
                                asker={question.asker}
                                text={question.text}
                                time_asked={question.timeAsked}
                                tags={question.tags}
                                queueIndex={1}
                                id={index}
                                deleteFunc={this.openDeleteModal}
                                answerFunc={this.handleStartQuestion}
                                finishFunc={this.handleAnswerQuestion}
                                started={question.timeStarted}
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
