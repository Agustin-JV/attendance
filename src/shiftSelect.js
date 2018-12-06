import React, { Component } from 'react';
import { Typography, Modal, Card, Grid, CardHeader, IconButton, Paper } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import AvatarChip from './avatarChip';
import PropTypes from 'prop-types';
import shift_colors from './shift_colors.json';
import { Close } from '@material-ui/icons';
import grey from '@material-ui/core/colors/grey';
class ShiftSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  handleClose = () => {
    this.props.onClose();
  };
  render() {
    let { open, classes, showNS, onClick, showMS } = this.props;

    let AvatarButton = this.AvatarButton;
    return (
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={open}
        onClose={this.handleClose}>
        <Card
          className={classes.card}
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}>
          <CardHeader
            title="Select a Shift"
            action={
              <IconButton onClick={this.handleClose}>
                <Close />
              </IconButton>
            }
          />
          <Grid container spacing={8}>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <Typography variant="subtitle1" id="modal-title">
                  Out Office
                </Typography>
                <Grid container spacing={8}>
                  {AvatarButton('O', 'Out', false, 500, 800, 3)}
                  {AvatarButton('V', 'Vacations', false)}
                  {AvatarButton('H', 'Hollyday', false)}
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <Typography variant="subtitle1" id="modal-title">
                  Special Shift
                </Typography>
                <Grid container spacing={8}>
                  {AvatarButton('MS', 'Morning Shift', !showMS)}
                  {AvatarButton('S', 'Normal Shift', false)}
                  {AvatarButton('NS', 'Night Shift', !showNS)}
                  {AvatarButton('MHS', 'Morning Hollyday Shift', false, 500, 800, 6)}
                  {AvatarButton('HS', 'Hollyday Shift', false, 700, 900)}
                  {AvatarButton('NHS', 'Night Hollyday Shift', false, 500, 800, 6)}
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <Typography variant="subtitle1" id="modal-title">
                  Other
                </Typography>
                <Grid container spacing={8}>
                  {AvatarButton('G', 'General ', false, 500, 800, 3)}
                  {AvatarButton('SUS', 'Sustainment', false)}
                  {AvatarButton('SEC', 'Secondary ', false, 600, 900)}
                  {AvatarButton('T', 'Training', false)}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Card>
      </Modal>
    );
  }
  /**
   * @param {String} [code]
   */
  AvatarButton = (code, label, hide, light = 500, dark = 800, xs = 4) => {
    let { onClick } = this.props;
    return (
      <Grid item xs={xs}>
        <AvatarChip
          cAr={[shift_colors[code], light, dark]}
          avatar={this.capitalize(code.toLowerCase())}
          label={label}
          hide={hide}
          onClick={onClick ? onClick(code) : null}
          clickable={true}
        />
      </Grid>
    );
  };
  capitalize = s => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
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
  card: {
    position: 'absolute',
    width: theme.spacing.unit * 60,
    backgroundColor: grey[300],
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 2
  },
  paper: {
    ...theme.mixins.gutters(),
    backgroundColor: grey[200],
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2
  }
});
export default withStyles(styles)(ShiftSelect);
