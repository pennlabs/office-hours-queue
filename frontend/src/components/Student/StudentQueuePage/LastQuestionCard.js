import React, { useState, useEffect } from 'react';
import { Segment, Message } from 'semantic-ui-react';

const LastQuestionCard = (props) => {
  const [question, setQuestion] = useState(props.question);

  const timeString = (date) => {
    return new Date(date).toLocaleString('en-US', {dateStyle: 'short', timeStyle: 'short'});
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

  const segmentColor = (state) => {
    switch (state) {
      case "REJECTED": return "red";
      case "ANSWERED": return "green";
      default: return "blue"
    }
  }

  useEffect(() => {
    setQuestion(props.question);
  }, [props.question]);

  return (
    <Segment basic>
      <Segment padded attached="top"
        color={ segmentColor(question.state) }>
        {
          question.state === "REJECTED" &&
          <div>
            The following question you asked on{' '}
            <b>{ timeString(question.timeAsked) }</b>{' '}
            was rejected{ question.rejectedBy && [' by ', <b>{question.rejectedBy.preferredName}</b>]}:
            <br/>
            <Message error>{`"${question.text}"`}</Message>
            The reason for rejection was:
            <b>{ ` ${formatReason(question.rejectedReason, question.rejectedReasonOther)}` }</b>
          </div>
        }
        {
          question.state === "ANSWERED" &&
          <div>
            The following question you asked on{' '}
            <b>{timeString(question.timeAsked)}</b>{' '}
            was answered{ question.answeredBy && [' by ', <b>{question.answeredBy.preferredName}</b>]}:
            <br/>
            <Message success>{`"${question.text}"`}</Message>
          </div>
        }
        {
          question.state === "WITHDRAWN" &&
          <div>
            You withdrew the following question on <b>{timeString(question.timeWithdrawn)}</b>:
            <Message info>{`"${question.text}"`}</Message>
          </div>
        }
      </Segment>
      <Message
        attached="bottom"
        error={question.state === "REJECTED"}
        success={question.state === "ANSWERED"}
        info={question.state === "WITHDRAWN"}
      >
        If you believe this is an error, please contact course staff!
      </Message>
    </Segment>
  )
};

export default LastQuestionCard;
