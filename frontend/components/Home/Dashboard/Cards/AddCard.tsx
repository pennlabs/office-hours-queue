import React, { useState } from "react";
import { Segment, Header } from "semantic-ui-react";

const cardStyle = {
    height: "120px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    border: "dashed #21ba45",
};

const hoverStyle = {
    height: "120px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    border: "dashed #21ba45",
    backgroundColor: "#b5f4c4",
};
interface AddCardProps {
    isStudent: boolean;
    clickFunc: () => void;
}
const AddCard = (props: AddCardProps) => {
    const { isStudent, clickFunc } = props;
    const [hovered, setHovered] = useState(false);

    return (
        <Segment basic>
            <Segment
                style={hovered ? hoverStyle : cardStyle}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={clickFunc}
            >
                <Header
                    color="green"
                    style={{
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                    }}
                    content={isStudent ? "Join Course" : "Create Course"}
                />
            </Segment>
        </Segment>
    );
};

export default AddCard;
