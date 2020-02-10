import React, { useState } from 'react';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';
import { Form, Button } from 'semantic-ui-react';

/* GRAPHQL QUERIES/MUTATIONS */
const DELETE_QUESTION = gql`
  mutation RejectQuestion($input: RejectQuestionInput!) {
    rejectQuestion(input: $input) {
      question {
        id
      }
    }
  }
`;

/* DROPDOWN OPTIONS */
const deleteOptions = [
  {key: 'NOT_HERE', value: 'NOT_HERE', text: 'Not Here'},
  {key: 'OH_ENDED', value: 'OH_ENDED', text: 'OH Ended'},
  {key: 'NOT_SPECIFIC', value: 'NOT_SPECIFIC', text: 'Not Specific'},
  {key: 'WRONG_QUEUE', value: 'WRONG_QUEUE', text: 'Wrong Queue'},
  {key: 'OTHER', value: 'OTHER', text: 'Other'}
]
