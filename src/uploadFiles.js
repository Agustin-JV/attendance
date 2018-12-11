import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Card, CardContent, CardActions } from '@material-ui/core';
import AvChip from './avatarChip';
import { Forward } from '@material-ui/icons';
import { mergeArrays, isEmpty, arrayMatchPattern } from './utils';
import { handleFile, XLSX } from './loadXlsx';
import {process} from './attendance_file_processor'
class UploadFiles extends React.Component {
  constructor(props) {
    super(props);
    /** @type {State} */
    this.state = {
      open: false,
      loading: { load: false, upload: false, save: false }
    };
  }
  render() {
    const { loading } = this.state;
    return (
      <Card>
        <input
          accept=".xlsx"
          style={{ display: 'none' }}
          id="contained-button-file"
          multiple
          type="file"
          onChange={this.loadFile}
        />
        <label htmlFor="contained-button-file">
          <AvChip
            cAr={['blue', 500, 700]}
            avatar={<Forward style={{ transform: 'rotate(-90deg)' }} />}
            label="Update from file"
            variant="default"
            hide={false}
            loading={loading['upload']}
            clickable={true}
          />
        </label>
      </Card>
    );
  }
  //#region UploadFile
  loadFile = e => {
    this.setLoading('upload', true);
    handleFile(this.fileCallback)(e);
  };
  fileCallback = wb => {
    console.log('fileCallback', wb);
    if (wb !== undefined) {
      var ws = wb.Sheets[wb.SheetNames[0]];
      var data = XLSX.utils.sheet_to_json(ws, {
        header: 1
      });
      this.processData(data);
    } else {
      this.setLoading('upload', false);
    }
  };
  processData = data => {
    process(data)
  };
  //#endregion
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
export default withStyles(styles)(UploadFiles);
