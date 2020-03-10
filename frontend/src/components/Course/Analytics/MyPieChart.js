import React from 'react';
import Chart from 'chart.js';

export default class MyPieChart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dataset: this.props.dataset
    }
  };

  componentDidMount() {
    const node = this.node;
    new Chart(node, this.state.dataset);
  }

  render() {
    return (
      <canvas ref={node => (this.node = node)}/>
    )
  }
}