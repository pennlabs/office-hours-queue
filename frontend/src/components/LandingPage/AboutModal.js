import React from 'react';
import {Button, Modal} from 'semantic-ui-react';

const AboutModal = (props) => {
  return (
    <Modal open={props.open} style={{width: '350px'}}>
      <Modal.Content>
        OHQ was built by Steven Bursztyn, Chris Fischer, Monal Garg, Karen Shen, and Marshall Vail.
        <br/>
        <br/>
        If you have any question, feedback, or suggestions you can reach us at{' '}
        <a href={'mailto:officehourqueue@gmail.com'}>officehourqueue@gmail.com</a>.
      </Modal.Content>
      <Modal.Actions>
        <Button content="Close" onClick={ () => props.closeFunc() }/>
      </Modal.Actions>
    </Modal>
  );
};

export default AboutModal;
