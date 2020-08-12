import React, { useState, useEffect } from "react";
import { Segment, Header, Grid } from "semantic-ui-react";
import CourseForm from "./CourseForm";

const CourseSettings = props => {
    const [course, setCourse] = useState(props.course);

    useEffect(() => {
        setCourse(props.course);
    }, [props.course]);

    return (
        <div>
            <Grid.Row>
                <Segment basic>
                    <Header as="h3">Course Settings</Header>
                </Segment>
            </Grid.Row>
            <Grid.Row>
                <Segment basic>
                    <CourseForm course={course} refetch={props.refetch} />
                </Segment>
            </Grid.Row>
        </div>
    );
};

export default CourseSettings;
