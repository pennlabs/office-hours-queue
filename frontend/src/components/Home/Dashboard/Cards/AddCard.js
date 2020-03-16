import React, { useState }from 'react';
import { Segment, Header } from 'semantic-ui-react';

const cardStyle = {
  height:"110px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  border: "dashed #21ba45"
};

const hoverStyle = {
  height:"110px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  border: "dashed #21ba45",
  backgroundColor: "#b5f4c4"
}

const AddCard = (props) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Segment basic>
      <Segment style={ hovered ? hoverStyle : cardStyle }
        onMouseEnter={ () => setHovered(true) }
        onMouseLeave={ () => setHovered(false) }
        onClick={ props.clickFunc }>
        <Header color="green" style={{whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden"}}
          content={ props.isStudent ? "Join Course" : "Create Course" }/>
      </Segment>
    </Segment>
  )
}

export default AddCard;
