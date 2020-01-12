import React from 'react';
import { Modal, Tab, Button, Label, Icon, Header, Segment, Input } from 'semantic-ui-react';

export default class TagModal extends React.Component {
  render() {
    return (
      <Modal open={this.props.attrs.open}>
        <Modal.Header>Edit Tags</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <Tab menu={{ pointing: true, secondary: true }} panes={
              this.props.queues.map((queue, queueIndex) => {
                  return {
                    menuItem: queue.name,
                    render: () => {
                      return (
                        <Tab.Pane attached={false}>
                          <Segment basic>
                            <Header content="Current Tags"/>
                            {
                              queue.tags.map((tag, tagIndex) => (
                                <Label
                                  as="a"
                                  onClick={() => {this.props.funcs.deleteFunc(queueIndex, tagIndex)}}
                                >
                                  { tag }
                                  <Icon name="delete"/>
                                </Label>
                              ))
                            }
                            { this.props.newTag &&
                              <Label color="green">
                                { this.props.newTag }
                              </Label>
                            }
                          </Segment>
                          <Segment basic>
                            <Header content="Add New Tags"/>
                            <Input icon="tag"
                              iconPosition="left"
                              placeholder="New Tag Here..."
                              action={{
                                color: "blue",
                                content: "Add",
                                onClick: () => { this.props.funcs.addFunc(queueIndex) }
                              }}
                              value={this.props.newTag}
                              onChange={ this.props.funcs.inputFunc }
                            />
                          </Segment>
                        </Tab.Pane>
                      );
                    }
                  }
              })
            }/>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button content="Done" compact color="blue" onClick={this.props.funcs.closeFunc}/>
        </Modal.Actions>
      </Modal>
    );
  }
}
