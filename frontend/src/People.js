/* eslint-disable no-script-url */
import React from 'react';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Title from './Title';

// Generate Order Data
function createData(id, date, name, shipTo, paymentMethod, amount) {
  return { id, date, name, shipTo, paymentMethod, amount };
}

const rows = [
  createData(0, 'Steven Bursztyn', 'Chris Murphy\'s Number 1 Fan', 'Head TA', 'bursztyn@seas.upenn.edu'),
  createData(1, 'Chris Fischer', 'Fish', 'TA', 'cdf@seas.upenn.edu'),
  createData(2, 'Monal Garg', 'MoNO Gargoyle', 'TA', 'mgarg@seas.upenn.edu'),
  createData(3, 'Karen Shen', 'shenk', 'Beta Tester', 'shenk@seas.upenn.edu'),
  createData(4, 'Marshall Vail', 'Marshmallow', 'Designer', 'mvail@seas.upenn.edu'),
];

const useStyles = makeStyles(theme => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));

export default function Roster() {
  const classes = useStyles();
  return (
    <React.Fragment>
      <Title>Roster</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell><b>FULL NAME</b></TableCell>
            <TableCell><b>PREFERRED NAME</b></TableCell>
            <TableCell><b>ROLE</b></TableCell>
            <TableCell><b>EMAIL</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.id}>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.shipTo}</TableCell>
              <TableCell>{row.paymentMethod}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className={classes.seeMore}>
        <Link color="primary" href="javascript:;">
          See more students
        </Link>
      </div>
    </React.Fragment>
  );
}