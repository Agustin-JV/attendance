import React, { Component } from 'react';
import { Typography, Modal, Paper } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import AvatarChip from './avatarChip';
import PropTypes from 'prop-types';
class ShiftSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  handleClose = () => {
    this.props.onClose();
  };
  render() {
    const { open, onClick, classes } = this.props;
    return (
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={open}
        onClose={this.handleClose}>
        <Paper
          className={classes.paper}
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}>
          <Typography variant="h6" id="modal-title">
            Select a Shift
          </Typography>
          <ul style={{ listStyleType: 'none' }}>
            <li>
              <AvatarChip
                color="green"
                avatar="MS"
                label="Morning Shift "
                onClick={onClick('MS')}
              />
            </li>
            <li>
              <AvatarChip
                color="lime"
                avatar="S"
                label="Normal Shift"
                theme="black"
                onClick={onClick('S')}
              />
            </li>
            <li>
              <AvatarChip color="purple" avatar="NS" label="Night Shift" onClick={onClick('NS')} />
            </li>
            <li>
              <AvatarChip color="amber" avatar="O" label="Out" onClick={onClick('O')} />
            </li>
          </ul>
        </Paper>
      </Modal>
    );
  }
}
ShiftSelect.propTypes = {
  close: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired
};
const styles = theme => ({
  button: {
    margin: theme.spacing.unit
  },
  paper: {
    position: 'absolute',
    width: theme.spacing.unit * 50,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4
  }
});
export default withStyles(styles)(ShiftSelect);
