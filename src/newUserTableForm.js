import React from 'react';
import 'react-tabulator/lib/css/bootstrap/tabulator_bootstrap.min.css';
import Button from '@material-ui/core/Button';
import { Modal, Typography, TextField, Paper } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
//https://react-bootstrap-table.github.io/react-bootstrap-table2/
//http://allenfang.github.io/react-bootstrap-table/example.html#advance
class NewUserTableForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: true
    };
  }

  handleClose = () => {
    this.props.onClose();
  };
  onChange = () => {
    let sapId = document.getElementById('sap-id').value;
    let name = document.getElementById('user-name').value;
    let project = document.getElementById('project-name').value;
    let projectCode = document.getElementById('project-code').value;
    let client = document.getElementById('client-name').value;
    let rmCode = document.getElementById('rm-id').value;

    this.setState({
      sap_id: sapId,
      name: name,
      project: project,
      projectCode: projectCode,
      client: client,
      rmCode: rmCode
    });
  };
  onSubmit = event => {
    event.preventDefault();
    let form = {
      sap_id: this.state.sap_id,
      name: this.state.name,
      project: this.state.project,
      project_code: this.state.projectCode,
      client: this.state.client,
      rm_sap_id: this.state.rmCode
    };
    this.props.newRow(form);
  };

  render() {
    const { classes } = this.props;
    return (
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={this.props.open}
        onClose={this.handleClose}>
        <Paper
          className={classes.paper}
          style={{ top: '50%', left: '50%', width: '600px', transform: 'translate(-50%, -50%)' }}>
          <Typography variant="h6" id="modal-title">
            New User
          </Typography>
          <ValidatorForm className={classes.container} autoComplete="off" onSubmit={this.onSubmit}>
            <TextValidator
              required
              id="sap-id"
              label="Sap ID"
              name="Sap ID"
              className={classes.textField}
              onChange={this.onChange}
              value={this.state.sap_id}
              margin="normal"
              type="number"
              validators={['matchRegexp:^[0-9]{8}$']}
              errorMessages={['Rule: ^[0-9]{8}$']}
              style={{ width: '90px' }}
            />
            <TextValidator
              required
              id="user-name"
              label="Name"
              name="Name"
              className={classes.textField}
              onChange={this.onChange}
              value={this.state.name}
              margin="normal"
              validators={['matchRegexp:^[\u00C0-\u017Fa-zA-ZñÑ, ]+$']}
              errorMessages={['Rule: ^[\u00C0-\u017Fa-zA-ZñÑ, ]+$']}
              style={{ width: '400px' }}
            />
            <TextValidator
              required
              id="client-name"
              label="Client"
              name="Client"
              className={classes.textField}
              onChange={this.onChange}
              value={this.state.client}
              margin="normal"
              style={{ width: '150px' }}
            />
            <TextValidator
              required
              id="project-name"
              label="Project"
              name="Project"
              onChange={this.onChange}
              className={classes.textField}
              value={this.state.project}
              margin="normal"
            />
            <TextValidator
              required
              id="project-code"
              label="Project Code"
              name="Project Code"
              onChange={this.onChange}
              className={classes.textField}
              value={this.state.projectCode}
              margin="normal"
              validators={['matchRegexp:^[a-zA-Z0-9/]{5,11}$']}
              errorMessages={['Rule: ^[a-zA-Z0-9/]{5,11}$']}
              style={{ width: '120px' }}
            />

            <TextValidator
              required
              id="rm-id"
              label="Rm ID"
              name="Rm ID"
              onChange={this.onChange}
              className={classes.textField}
              value={this.state.rmCode}
              margin="normal"
              type="number"
              validators={['matchRegexp:^[0-9]{8}$']}
              errorMessages={['Rule: ^[0-9]{8}$']}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}>
              Submit
            </Button>
          </ValidatorForm>
        </Paper>
      </Modal>
    );
  }
}

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
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200
  },
  dense: {
    marginTop: 19
  },
  menu: {
    width: 200
  }
});
export default withStyles(styles)(NewUserTableForm);
