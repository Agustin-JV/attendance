import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Typography, CardContent, CardActions, IconButton, Card, Button } from '@material-ui/core';
import Pagination from './pagination';
class SecurityPannel extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <Card>
        <Pagination rows={5} />
      </Card>
    );
  }
}
const styles = theme => ({});

export default withStyles(styles)(SecurityPannel);
