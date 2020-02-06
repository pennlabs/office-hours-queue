import React, { useState, useEffect } from 'react';
import { Segment, Header, Grid } from 'semantic-ui-react';
import RosterTable from './RosterTable';

import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';

/* GRAPHQL QUERIES/MUTATIONS */
/* TODO: 
  1. add mutation to remove user
  2. add mutation to invite user
*/

const Roster = (props) => {
  /* STATE */
  const [users, setUsers] = useState(props.roster);

  return (
    <Grid.Column width={13}>
      <Grid padded>
        <Grid.Row>
          <Segment basic>
            <Header as="h1">
              Roster
            </Header>
          </Segment>
        </Grid.Row>
        <Grid.Row>
          <RosterTable users={ users }/>
        </Grid.Row>
      </Grid>
    </Grid.Column>
  );
}

export default Roster;
