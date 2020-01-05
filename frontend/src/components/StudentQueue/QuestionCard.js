import React from 'react'
import { Segment, Header, Icon, Button, Popup} from 'semantic-ui-react';

export default class QuestionCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentlyBeingAnswered : false
    };
  }

  answerCard = () => this.setState( {currentlyBeingAnswered: true })

    render() {
      return (
        <Segment> { this.props.text } on queue { this.props.queueName } at { this.props.timeAsked } </Segment>
      );
      // return (
      //   <Segment basic>
      //     <Segment attached="top" color="blue" style={{"height":"50px", "width":"300px"}}>
      //         <Header as="h5" floated='right' color="blue">
      //           {/* <Header.Content>
      //             {this.props.time_asked}
      //           </Header.Content> */}-
      //         </Header>
      //         <Header as="h5" floated='left'>
      //         </Header>
      //     </Segment>
      //     <Segment attached
      //       style={{"height":"80px",  "width":"300px"}}
      //       tertiary={this.props.started}>
      //     { this.props.text }
      //     </Segment>
      //     <Segment attached="bottom" secondary textAlign="right" style={{"height":"50px",  "width":"300px"}}>
      //       <Header as="h5" floated='left'>
      //         {
      //           !this.props.started ?
      //           <Header.Content>
      //             <Button compact
      //               size='mini'
      //               color='red'
      //               content='Delete'
      //               onClick={() => this.props.deleteFunc(this.props.queueIndex, this.props.id)}/>
      //             <Button compact
      //               size='mini'
      //               color='green'
      //               content='Answer'
      //               onClick={() => this.props.answerFunc(this.props.queueIndex, this.props.id)}/>
      //           </Header.Content>
      //             :
      //             <Header.Content>
      //               <Button compact
      //                 size='mini'
      //                 color='green'
      //                 content='Finish'
      //                 onClick={() => this.props.finishFunc(this.props.queueIndex, this.props.id)}/>
      //             </Header.Content>
      //           }
      //         </Header>
      //         <Popup
      //           trigger= {
      //             <Icon name="tags"/>
      //           }
      //           content= {
      //             this.props.tags.map(tag => {
      //               return ' ' + tag
      //             }).toString()
      //           }
      //           basic
      //           position="bottom left"
      //           inverted
      //         />
  
      //     </Segment>
      //   </Segment>
      // );
    }
}
