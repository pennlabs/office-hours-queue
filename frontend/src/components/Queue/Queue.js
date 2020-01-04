import React from 'react';
import { Segment, Menu, Header, Grid, Image, Label, Modal, Form, Button, Input, Message } from 'semantic-ui-react';
import QuestionCard from './QuestionCard';
import DeleteQuestionModal from './DeleteQuestionModal';
import TagModal from './TagModal';
import EditQueueModal from './EditQueueModal';
import { fakeCourse } from './questiondata.js';
import * as ROUTES from '../../constants/routes';
import Sidebar from '../Sidebar';


import { withAuthorization } from '../Session';
import { compose } from 'recompose';


class Queue extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
          course: {},
          allTags: [],
          questionToDelete: {},
          deleteModal: {
            open: false,
            reason: "",
            textDisabled: true,
            text: ""
          },
          tagModal: {
            open: false
          },
          tagToAdd: "",
          editQueueModal: {
            open: false,
            queue: {}
          }
        };

        this.updateTags = this.updateTags.bind(this);
        this.numberOfActiveQuestions = this.numberOfActiveQuestions.bind(this);

        this.handleStartQuestion = this.handleStartQuestion.bind(this);
        this.handleAnswerQuestion = this.handleAnswerQuestion.bind(this);

        this.handleTagClick = this.handleTagClick.bind(this);
        this.handleTagClear = this.handleTagClear.bind(this);
        this.containsActiveTag = this.containsActiveTag.bind(this);
        this.addNewTag = this.addNewTag.bind(this);
        this.openTagModal = this.openTagModal.bind(this);
        this.closeTagModal = this.closeTagModal.bind(this);
        this.handleNewTagChange = this.handleNewTagChange.bind(this);
        this.deleteTag = this.deleteTag.bind(this);

        this.handleDeleteDropdownChange = this.handleDeleteDropdownChange.bind(this);
        this.openDeleteModal = this.openDeleteModal.bind(this);
        this.closeDeleteModal = this.closeDeleteModal.bind(this);
        this.handleDeleteQuestion = this.handleDeleteQuestion.bind(this);

        this.openEditQueueModal = this.openEditQueueModal.bind(this);
        this.closeEditQueueModal = this.closeEditQueueModal.bind(this);
      }

      componentDidMount() {
        var tags = [];
        fakeCourse.queues.forEach(queue => {
            if (queue.tags) {
              queue.tags.forEach(tag => {
                if (!tags.includes(tag)) {
                  tags.push({ name: tag, isActive: false });
                }
              });
            }
        });
        this.setState({ course: fakeCourse, allTags: tags });
      }

      numberOfActiveQuestions(queueIndex) {
        var count = 0;
        if (this.state.course.queues[queueIndex].questions) {
          this.state.course.queues[queueIndex].questions.forEach(question => {
            if (!question.timeAnswered && !question.timeRejected) {
              count = count + 1;
            }
          });
        }

        return count;
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

      openTagModal() {
        var tagModal = this.state.tagModal;
        tagModal.open = true;

        this.setState({ tagModal: tagModal })
      }

      updateTags() {
        var course = this.state.course;
        var tags = [];
        var tagNames = [];

        course.queues.forEach(queue => {
            queue.tags.forEach(tag => {
              if (!tagNames.includes(tag)) {
                tags.push({ name: tag, isActive: false });
                tagNames.push(tag);
              }
            });
        });

        this.setState({ allTags: tags });
      }

      closeTagModal() {
        var tagModal = this.state.tagModal;
        tagModal.open = false;
        this.updateTags();
        this.setState({ tagModal: tagModal });
      }

      handleNewTagChange(e) {
        this.setState({ tagToAdd: e.target.value });
      }

      addNewTag(queueIndex) {
        var course = this.state.course;
        var tags = course.queues[queueIndex].tags;

        if (this.state.tagToAdd && !tags.includes(this.state.tagToAdd)) {
          tags.push(this.state.tagToAdd);
        }

        this.setState({ course: course, tagToAdd: "" });
      }

      deleteTag(queueIndex, tagIndex) {
        var course = this.state.course;
        var tags = course.queues[queueIndex].tags;
        tags.splice(tagIndex, 1);

        this.setState({ course: course });
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

      /* EDIT QUEUE MODAL FUNCTIONS */

      openEditQueueModal(queueIndex) {
        var editQueueModal = {
          open: true,
          queue: this.state.course.queues[queueIndex]
        }

        this.setState({ editQueueModal: editQueueModal });
      }

      closeEditQueueModal() {
        var editQueueModal = {
          open: false,
          queue: {}
        }

        this.setState({ editQueueModal: editQueueModal });
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
            {
              this.state.course.queues &&
                <TagModal
                attrs={this.state.tagModal}
                newTag={this.state.tagToAdd}
                funcs={{
                  inputFunc: this.handleNewTagChange,
                  addFunc: this.addNewTag,
                  deleteFunc: this.deleteTag,
                  closeFunc: this.closeTagModal
                }}
                queues={this.state.course.queues}
              />
            }
            <Sidebar active={'queue'}/>
            <Grid.Column width={13}>
              <Grid columns={2} padded>
                <Grid.Row>
                  {/* COURSE HEADER */}
                  <Segment basic>
                    <Header as="h1">
                      {this.state.course.name}
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
                      this.state.allTags.length > 0 ? this.state.allTags.map((tag, index) => (
                        <Label
                          as="a"
                          color={tag.isActive ? "blue" : ""}
                          onClick={() => {this.handleTagClick(index)}}
                        >
                          { tag.name }
                        </Label>
                      )) : <Label color="blue">No Tags</Label>
                    }
                    <Label as="a" color="grey" onClick={this.openTagModal} content="Edit" icon="cog"/>
                    <a
                      style={{
                        "marginLeft":"12px",
                        "textDecoration":"underline",
                        "cursor":"pointer"
                      }}
                      onClick={this.handleTagClear}>
                      Clear All
                    </a>
                  </Segment>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column>
                    <EditQueueModal
                      attrs={this.state.editQueueModal}
                      funcs={{
                        closeFunc: this.closeEditQueueModal
                      }}
                    />
                    {
                      this.state.course.queues &&
                      this.state.course.queues.length > 0 &&
                      this.state.course.queues[0].name ?
                      <div>
                        <Header as="h3">
                          { this.state.course.queues[0].name }
                          <Header.Subheader>
                              { this.state.course.queues[0].description }
                          </Header.Subheader>
                        </Header>
                        <Label
                          content={ this.numberOfActiveQuestions(0) + " users" }
                          color="blue"
                          icon="user"
                        />
                        <Label content="30 mins" color="blue" icon="clock"/>
                        <Label as="a"
                          content="Edit"
                          color="grey"
                          icon="cog"
                          onClick={() => {this.openEditQueueModal(0)}}
                        />
                        {/* add main queue cards */}
                        <Grid.Row columns={1} padded="true">
                            {
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
                      </div> :
                      <div>
                      <Header as="h3">
                        Queue #1
                        <Header.Subheader>
                            Your first queue description.
                        </Header.Subheader>
                      </Header>
                      <Label
                        content="N/A users"
                        color="blue"
                        icon="user"
                      />
                      <Label content="N/A mins" color="blue" icon="clock"/>
                      <Label as="a"
                        content="Edit"
                        color="grey"
                        icon="cog"
                        onClick={() => {this.openEditQueueModal(0)}}
                      />
                      <Segment basic>
                        <Message
                          header="Queue DNE"
                          content="You can edit this queue to open it!"
                        />
                      </Segment>
                      </div>
                    }
                  </Grid.Column>
                  <Grid.Column>
                    {
                      this.state.course.queues &&
                      this.state.course.queues.length > 1 &&
                      <div>
                        <EditQueueModal
                          attrs={this.state.editQueueModal}
                          funcs={{
                            closeFunc: this.closeEditQueueModal
                          }}
                        />
                        <Header as="h3">
                          { this.state.course.queues[1].name }
                          <Header.Subheader>
                            { this.state.course.queues[1].description }
                          </Header.Subheader>
                        </Header>
                        <Label
                          content={ this.numberOfActiveQuestions(1) + " users" }
                          color="blue" icon="user"
                        />
                        <Label content="30 mins" color="blue" icon="clock"/>
                        <Label as="a"
                          content="Edit"
                          color="grey"
                          icon="cog"
                          onClick={() => {this.openEditQueueModal(1)}}
                        />
                        {/* add Debugging queue cards */}
                        <Grid.Row columns={1} padded="true">
                            {
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
                      </div>
                    }
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
