import React, { useState, useEffect } from 'react';
import { Modal, Segment, Button } from 'semantic-ui-react';

const RejectedQuestionModal = (props) => {
  const [question, setQuestion] = useState(props.question);

  const formatReason = (reason, other) => {
    switch(reason) {
      case 'OTHER': return `Other (${other})`;
      case 'NOT_HERE': return 'Not Here';
      case 'OH_ENDED': return 'OH Ended';
      case 'NOT_SPECIFIC': return 'Not Specific';
      case 'WRONG_QUEUE': return 'Wrong Queue'
      default: return reason;
    }
  }

  useEffect(() => {
    setQuestion(props.question);
  }, [props.question])

  return (
    <Modal open={ props.open }>
      <Modal.Header>Question Rejected</Modal.Header>
      {
        question &&
        <Modal.Content>
          The following question was rejected:<br/>
          <Segment inverted color="blue">{`"${question.text}"`}</Segment>
          The rejected reason was: 
          <b>{ ` ${formatReason(question.rejectedReason, question.rejectedReasonOther)}` }</b><br/>
          If you believe this is an error, please contact course staff.
      </Modal.Content>
      }
      <Modal.Actions>
        <Button content="Done" onClick={ props.closeFunc }/>
      </Modal.Actions>
    </Modal>
  );
}

export default RejectedQuestionModal;