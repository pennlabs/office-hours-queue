import React from 'react';
import {Button, Modal} from 'semantic-ui-react';

const AboutModal = (props) => {
  return (
    <Modal open={props.open} style={{width: '350px'}}>
      <Modal.Content>
        OHQ was built by Steven Bursztyn, Chris Fischer, Monal Garg, Karen Shen, and Marshall Vail.
        <br/>
        <br/>
        To submit a bug, please use this{' '}
        <a target='_blank'
           rel="noopener noreferrer"
           href={'https://forms.gle/ZABQZ31HRoP6VLhT8'}>
          form
        </a>.
        <br/>
        <br/>
        If you have any questions, feedback, or suggestions you can reach us at{' '}
        <a target='_blank'
           rel="noopener noreferrer"
           href={'mailto:officehourqueue@gmail.com'}>
          officehourqueue@gmail.com
        </a>.
      </Modal.Content>
      <Modal.Actions>
        <Button content="Close" onClick={ () => props.closeFunc() }/>
      </Modal.Actions>
    </Modal>
  );
};

export default AboutModal;
