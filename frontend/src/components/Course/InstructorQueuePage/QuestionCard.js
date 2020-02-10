import React, { useState } from 'react'
import { Segment, Header, Icon, Button, Popup} from 'semantic-ui-react';
import DeleteQuestionModal from './DeleteQuestionModal';

/*
export default class CourseCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentlyBeingAnswered : false
    };

    var d = new Date(this.props.timeAsked);
    console.log(d.getHours());
  }

  answerCard = () => this.setState( {currentlyBeingAnswered: true })

    render() {
      return (
        <Segment basic>
          <Segment attached="top" color="blue" style={{"height":"50px", "width":"300px"}}>
              <Header as="h5" floated='right' color="blue">
                <Header.Content>
                  {this.props.timeAsked}
                </Header.Content>
              </Header>
              <Header as="h5" floated='left'>
                <Header.Content>
                  { this.props.asker.preferredName }
                </Header.Content>
              </Header>
          </Segment>
          <Segment attached
            style={{"height":"80px",  "width":"300px"}}
            tertiary={this.props.started}>
          {this.props.text && (this.props.text.length < 100 ? this.props.text : this.props.text.substring(0, 99) + "...")}
          </Segment>
          <Segment attached="bottom" secondary textAlign="right" style={{"height":"50px",  "width":"300px"}}>
            <Header as="h5" floated='left'>
              {
                !this.props.started ?
                <Header.Content>
                  <Button compact
                    size='mini'
                    color='red'
                    content='Delete'
                    onClick={() => this.props.deleteFunc(this.props.queueIndex, this.props.id)}/>
                  <Button compact
                    size='mini'
                    color='green'
                    content='Answer'
                    onClick={() => this.props.answerFunc(this.props.queueIndex, this.props.id)}/>
                </Header.Content>
                  :
                  <Header.Content>
                    <Button compact
                      size='mini'
                      color='green'
                      content='Finish'
                      onClick={() => this.props.finishFunc(this.props.queueIndex, this.props.id)}/>
                  </Header.Content>
                }
              </Header>
              <Popup
                trigger= {
                  <Icon name="tags"/>
                }
                content= {
                  this.props.tags && this.props.tags.map(tag => {
                    return ' ' + tag
                  }).toString()
                }
                basic
                position="bottom left"
                inverted
              />
  
          </Segment>
        </Segment>
      );
    }
}
*/

const QuestionCard = (props) => {
  const [question, setQuestion] = useState(props.question);
  const [open, setOpen] = useState(false);

  const timeString = (date) => {
    var d = new Date(date);
    var hour = d.getHours() > 12 ? d.getHours() - 12 : d.getHours();
    var meridiem = d.getHours() > 12 ? "pm" : "am";
    return `${hour}:${d.getMinutes()} ${meridiem}`;
  }

  const triggerModal = () => {
    setOpen(!open);
  } 

  return (
    question && <Segment basic>
        <DeleteQuestionModal open={open} question={question} closeFunc={triggerModal}/>
          <Segment attached="top" color="blue" style={{"height":"50px", "width":"300px"}}>
              <Header as="h5" floated='right' color="blue">
                <Header.Content>
                  { timeString(question.timeAsked) }
                </Header.Content>
              </Header>
              <Header as="h5" floated='left'>
                <Header.Content>
                  { question.askedBy.preferredName }
                </Header.Content>
              </Header>
          </Segment>
          <Segment attached
            style={{"height":"80px",  "width":"300px"}}
            tertiary={props.started}>
          { question.text && (question.text.length < 100 ? 
            question.text : question.text.substring(0, 99) + "...") }
          </Segment>
          <Segment attached="bottom" secondary textAlign="right" style={{"height":"50px",  "width":"300px"}}>
            <Header as="h5" floated='left'>
              {
                !props.started ?
                <Header.Content>
                  <Button compact
                    size='mini'
                    color='red'
                    content='Delete'
                    onClick={triggerModal}/>
                  <Button compact
                    size='mini'
                    color='green'
                    content='Answer'/>
                </Header.Content>
                  :
                  <Header.Content>
                    <Button compact
                      size='mini'
                      color='green'
                      content='Finish'/>
                  </Header.Content>
              }
              </Header>
              <Popup
                trigger= {
                  <Icon name="tags"/>
                }
                content= {
                  question.tags && question.tags.map(tag => {
                    return ' ' + tag
                  }).toString()
                }
                basic
                position="bottom left"
                inverted/>
          </Segment>
        </Segment>
  );
}

export default QuestionCard;
