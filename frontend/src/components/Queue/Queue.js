import React from 'react';
import { Segment, Menu, Header, Grid, Image } from 'semantic-ui-react';
import QuestionCard from './QuestionCard';
import { fakeMainQueue, fakeDebuggingQueue } from './questiondata.js';
import * as ROUTES from '../../constants/routes';


import { withAuthorization } from '../Session';
import { compose } from 'recompose';

class Queue extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
          showMainQueueMore: false,
          showDebugQueueMore: false,
          mainQueueQuestions: [],
          debuggingQueueQuestions: [],
        };

        this.handleMainQueueChange = this.handleMainQueueChange.bind(this);
        this.handleDebugQueueChange = this.handleDebugQueueChange.bind(this);

        this.handleAnswerQuestion = this.handleAnswerQuestion.bind(this);
        this.handleDeleteQuestion = this.handleDeleteQuestion.bind(this);
    
      }
    
      handleArchivedChange() {
        this.setState({ showArchived: !this.state.showArchived });
      }

      handleMainQueueChange() {
        this.setState({ showMainQueueMore: !this.state.showMainQueueMore });
      }  
      
      handleDebugQueueChange() {
        this.setState({ showDebugQueueMore: !this.state.showDebugQueueMore });
      }
      
      handleDeleteQuestion(isMainQueue, isDebugQueue) {
        // TODO
        var queue;
        if(isMainQueue){
          queue = this.mainQueueQuestions;
        }
        else{
          queue = this.debuggingQueueQuestions;
        }
        
      }

      handleAnswerQuestion(isMainQueue, isDebugQueue){
        // TODO
      }
    
      componentDidMount() {
        this.setState({
          mainQueueQuestions: fakeMainQueue,
          debuggingQueueQuestions: fakeDebuggingQueue
        });
      }

      render() {
        return (
          <Grid columns={3} divided="horizontally">
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
            <Grid.Column width={6}>
              <Grid padded>
                <Segment basic padded>
                  <Header as="h2">
                    <Header.Content>
                      Main Queue
                    </Header.Content>
                  </Header>
                </Segment>
                {/* add main queue cards */}
                <Grid.Row columns={1} padded="true">
                    {
                      this.state.mainQueueQuestions.map(question => (
    
                        !question.isDeleted && !question.isAnswered &&
                        <Grid.Row>
                          <QuestionCard
                            asker={question.asker}
                            text={question.text}
                            time_asked={question.time_asked}
                            tags={question.tags[0]}
                          />
                        </Grid.Row>
                      ))
                    }
                  </Grid.Row>
                </Grid>
                </Grid.Column>
                <Grid.Column width={6}>
                  <Grid padded>
                <Segment basic padded>
                  <Header as="h2">
                    <Header.Content>
                      Debugging Queue
                    </Header.Content>
                  </Header>
                </Segment>
                {/* add Debugging queue cards */}
                <Grid.Row columns={1} padded="true">
                    {
                      this.state.debuggingQueueQuestions.map(question => (
    
                        !question.isAnswered && !question.isDeleted &&
                        <Grid.Column>
                          <QuestionCard
                            asker={question.asker}
                            text={question.text}
                            time_asked={question.time_asked}
                            tags={question.tags[0]}
                          />
                        </Grid.Column>
                      ))
                    }
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
