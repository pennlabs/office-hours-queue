import React, {useState} from 'react'
import { Segment, Header } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import * as ROUTES from '../../../../constants/routes';

const CourseCard = (props) => {
  const [hovered, setHovered] = useState(false);
  const path = {
      pathname: props.kind === 'STUDENT' ? ROUTES.STUDENT : ROUTES.COURSE,
      state: { courseId: props.id, courseUserId: props.courseUserId }
    };
  
  return (
    <Link to={ path }>
       <Segment basic
       onMouseEnter={ () => setHovered(true)}
       onMouseLeave={ () => setHovered(false)}>
         {hovered ? <Segment secondary attached="top" color="blue" style={{height:"70px"}}>
           <Header style={{whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden"}}>
             { `${props.department} ${props.courseCode}`}
             <Header.Subheader style={{whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden"}}>
               { props.courseTitle }
             </Header.Subheader>
           </Header>
         </Segment> : 
         <Segment attached="top" color="blue" style={{height:"70px"}}>
           <Header style={{whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden"}}>
             { `${props.department} ${props.courseCode}`}
             <Header.Subheader style={{whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden"}}>
               { props.courseTitle }
             </Header.Subheader>
           </Header>
         </Segment>}

         <Segment attached="bottom" secondary textAlign="right" style={{height:"40px"}}>
           <Header as="h6" style={{whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden"}}>
             { props.semester } { props.year }
           </Header>
         </Segment>
         </Segment>
     </Link>
  )
}

export default CourseCard;