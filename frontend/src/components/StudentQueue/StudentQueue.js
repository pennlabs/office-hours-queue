import React from 'react';
import { Segment, Menu, Header, Grid, Image, Label, Modal, Form, Button, Input, Message } from 'semantic-ui-react';
import AddQuestion from './AddQuestion'
import QuestionCard from './QuestionCard.js'
import { fakeCourse } from './questiondata.js';
import AskQuestionModal from './AskQuestionModal.js';
import Sidebar from '../Sidebar';

import { withAuthorization } from '../Session';
import { compose } from 'recompose';

class Queue extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
          newQuestionOpen : false,
          questionAsked: false,
          queueIndexQuestionAskedOn: 0,
          question: {},
          course: {},
          allTags: []
        };

        this.numberOfActiveQuestions = this.numberOfActiveQuestions.bind(this);

        this.openQuestionModal = this.openQuestionModal.bind(this);
        
        this.handleQuestionSubmit = this.handleQuestionSubmit.bind(this);
        this.handleQuestionChange = this.handleQuestionChange.bind(this);
        this.closeQuestionModal = this.closeQuestionModal.bind(this);
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

      renderQuestion(){
        if (this.state.questionAsked){
          return <QuestionCard 
            text={this.state.question.text}
            queueName={this.state.course.queues[this.state.question.queueIndex].name}
            timeAsked={this.state.question.timeAsked}
          />
        }
        return null;
      }

      /* ADDING NEW QUESTIONS */

      openQuestionModal(queueIndex){
          var q = this.state.question;
          q['queueIndex'] = queueIndex;
          this.setState({ 
              newQuestionOpen: true, 
              question: q
          });
      }

      /* QUESTION FORM */

      handleQuestionChange(e, {name, value} ){
          var question = this.state.question;
          question[name] = value;
          this.setState({ question : question });
      }

      handleQuestionSubmit(){
          var date = new Date();
          var dateText = date.toString();
          dateText = dateText.split(' ')[4];
          
          var q = this.state.question;
          q['timeAsked'] = dateText;

          this.setState({ 
              questionAsked: true, 
              newQuestionOpen: false, 
              question : q
           });
      }

      closeQuestionModal(){
        this.setState({ 
            newQuestionOpen: false 
         });
      }

      render() {
        return (
          <Grid columns={2} divided="horizontally" style={{"width":"100%"}}>
            <AskQuestionModal
                funcs = {{
                    changeFunc: this.handleQuestionChange,
                    submitFunc: this.handleQuestionSubmit,
                    closeFunc: this.closeQuestionModal,
                }}
                attrs = {{
                    open: this.state.newQuestionOpen
                }}
            />
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
                  { this.renderQuestion() }
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column>
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
                        <div>
                            {
                                !this.state.questionAsked ? 
                                <AddQuestion clickFunc={() => this.openQuestionModal(0)}/> :
                                <Header>Asked Question, you are _ in line out of {this.numberOfActiveQuestions(0)}</Header>
                            }
                        </div>
                      </div> :
                      <div>
                      <Header as="h3">No Active Queues</Header>
                      </div>
                    }
                  </Grid.Column>
                  <Grid.Column>
                    {
                      this.state.course.queues &&
                      this.state.course.queues.length > 1 &&
                      <div>
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
                        <div>
                        {
                                !this.state.questionAsked ? 
                                <AddQuestion clickFunc={() => this.openQuestionModal(1)}/> : 
                                <Header>Asked Question, you are _ in line out of {this.numberOfActiveQuestions(1)}</Header>
                            }
                        </div>
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
