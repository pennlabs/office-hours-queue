import React, { useState, useEffect } from 'react';
import { Segment, Message } from 'semantic-ui-react';

const LastQuestionCard = (props) => {
  const [question, setQuestion] = useState(props.question);

  const timeString = (date) => {
    return new Date(date).toLocaleString('en-US', {dateStyle: 'short', timeStyle: 'short'})
  };

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
  }, [props.question]);

  return (
    <Segment basic>
      <Segment padded attached="top"
        color={ question.state === "REJECTED" ? "red" : "green" }>
        {
          question.state === "REJECTED" ?
          <div>
            The following question you asked on <b>{ timeString(question.timeAsked) }</b> was rejected by <b>{question.rejectedBy.preferredName}</b>:<br/>
            <Message error>{`"${question.text}"`}</Message>
            The rejected reason was: 
            <b>{ ` ${formatReason(question.rejectedReason, question.rejectedReasonOther)}` }</b>
          </div> : <div>
            The following question you asked at <b>{timeString(question.timeAsked)}</b> was answered by <b>{question.answeredBy.preferredName}</b>:<br/>
            <Message success>{`"${question.text}"`}</Message>
          </div>
        }
      </Segment>
      <Message attached="bottom" warning>
        If you believe this is an error, please contact course staff!
      </Message>
    </Segment>
  )
}

export default LastQuestionCard;