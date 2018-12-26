//#region IMPORTS
import React from 'react';
import 'react-tabulator/lib/css/bootstrap/tabulator_bootstrap.min.css';
import { ReactTabulator } from 'react-tabulator';
import NewUserTableForm from './newUserTableForm';
import { db } from './fire_init';
import { Card, CardContent, CardActions } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Save, Edit, Delete, PersonAdd } from '@material-ui/icons';
import { OpenInBrowser, LineStyle, PowerInput, Forward, BorderColor } from '@material-ui/icons';
import { mergeArrays, isEmpty, arrayMatchPattern } from './utils';
import Pagination from './pagination';
import AvChip from './avatarChip';
import { getData, getMoreData } from './fbGetPaginatedData';
import { handleFile, XLSX } from './loadXlsx';
import { Link } from 'react-router-dom';
//#endregion

/**
 * @typedef   {Object}  User
 * @property  {Timestamp}  [creation_date]
 * @property  {string}  name
 * @property  {string}  project
 * @property  {string}  project_code
 * @property  {string|number}  rm_sap_id
 * @property  {string|number}  sap_id
 */
/**
 * @typedef   {Object}  Loading
 * @property  {boolean}  load
 * @property  {boolean}  save
 * @property  {boolean}  upload
 */
/**
 * @typedef  {Object}   State
 * @property {boolean}  open
 * @property {{}}       options
 * @property {boolean}  edit
 * @property {User[]}   rows
 * @property {Loading}  loading
 * @property {number}   page
 */
class UserProjects extends React.Component {
  constructor(props) {
    super(props);
    /** @type {State} */
    this.state = {
      open: false,
      title: 'Home',
      options: options,
      edit: false,
      editingCell: -1,
      paste: false,
      selectedRows: [],
      rowsPerPage: 5,
      lastRow: null,
      rows: [],
      pendingUpdate: [],
      page: 0,
      allrows: false,
      keys: [],
      loading: { load: false, upload: false, save: false }
    };
  }
  ref = null;
  paginationRef = null;
  componentDidMount() {
    this.getData();
  }
  udaptePage = () => {
    //console.log(this.state.page, this.ref.table.getPageMax())
    if (this.ref.table.getPageMax() >= this.state.page && this.state.page > 0) {
      this.ref.table.setPage(this.state.page);
    }
  };
  handleClose = () => {
    this.setState({ open: false }, () => {
      this.udaptePage();
    });
  };
  handleChangePage = page => {
    this.setState({ page: page }, () => {
      this.udaptePage();
    });
  };
  handleChangeRowsPerPage = rowsPerPage => {
    this.ref.table.setPageSize(rowsPerPage);
    this.setState({
      rowsPerPage: rowsPerPage
    });
  };
  onGoLast = (event, onLast) => {
    const { allrows } = this.state;
    if (!allrows) {
      this.getMoreData();
    }
  };
  render() {
    const { classes } = this.props;
    const { rows, loading } = this.state;
    return (
      <Card className={classes.root}>
        <CardContent>
          <div>
            <ReactTabulator
              style={{ marginBottom: 0 }}
              ref={ref => (this.ref = ref)}
              columns={columns}
              options={options}
              data={rows}
              rowClick={this.rowClick}
              clipboardPasteParser={this.paste}
              footerElement={'#hiddenFooter'}
            />
            <div style={{ borderTop: '1px  solid', borderColor: 'lightgrey' }} />
            <Pagination
              ref={ref => (this.paginationRef = ref)}
              rows={rows.length}
              onPageChange={this.handleChangePage}
              onGoNext={this.onGoNext}
              onGoLast={this.onGoLast}
              onChangeRowsPerPage={this.handleChangeRowsPerPage}
            />
            <div id="hiddenFooter" style={{ visibility: 'hidden', display: 'none' }} />
          </div>
        </CardContent>
        <CardActions style={{ paddingTop: '0%' }}>
          <AvChip
            cAr={this.state.edit ? ['indigo', 400, 700] : ['grey', 500, 700]}
            theme={this.state.edit ? 'white' : 'black'}
            avatar={<Edit />}
            variant={this.state.edit ? 'default' : 'outlined'}
            label={this.state.edit ? 'Diavtivate Edit' : 'Enable Edit'}
            onClick={this.edit}
            clickable={true}
          />
          <AvChip
            cAr={['indigo', 400, 600]}
            avatar={<LineStyle />}
            variant="outlined"
            onClick={this.copyAll}
            label="Copy all"
            hide={this.state.edit}
            clickable={true}
          />
          <AvChip
            cAr={['indigo', 400, 600]}
            avatar={<PowerInput />}
            variant="outlined"
            onClick={this.copySelected}
            label="Copy Selected"
            hide={this.state.edit}
            clickable={true}
          />
          <Link to={'projects/user/' + this.getSelectedUser()}>
            <AvChip
              cAr={['indigo', 400, 600]}
              avatar={this.state.selectedRows.length === 1 ? <BorderColor /> : <PersonAdd />}
              label={this.state.selectedRows.length === 1 ? 'Edit' : 'Add'}
              variant="outlined"
              hide={!this.state.edit}
              clickable={true}
              onClick={this.cleanSelected}
            />
          </Link>
          <AvChip
            cAr={this.state.selectedRows.length > 0 ? ['indigo', 400, 700] : ['grey', 500, 700]}
            avatar={<Delete />}
            onClick={this.delete}
            label="Delete Selected"
            variant="outlined"
            hide={!this.state.edit}
            clickable={this.state.selectedRows.length > 0}
          />
          <AvChip
            cAr={this.state.paste ? ['indigo', 400, 700] : ['grey', 500, 700]}
            avatar={<OpenInBrowser />}
            onClick={this.enablePaste}
            label="Enable Paste"
            variant={this.state.paste ? 'default' : 'outlined'}
            hide={!this.state.edit}
            clickable={true}
          />
          <AvChip
            cAr={this.state.pendingUpdate.length > 0 ? ['indigo', 400, 700] : ['grey', 500, 700]}
            avatar={<Save />}
            onClick={this.save}
            label="Save"
            variant={this.state.pendingUpdate.length > 0 ? 'default' : 'outlined'}
            hide={!this.state.edit}
            disabled={this.state.pendingUpdate.length > 0}
            clickable={this.state.pendingUpdate.length > 0}
          />
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
              cAr={['grey', 500, 700]}
              avatar={<Forward style={{ transform: 'rotate(-90deg)' }} />}
              label="Update from file"
              variant="outlined"
              hide={!this.state.edit}
              loading={loading['upload']}
              clickable={true}
            />
          </label>
        </CardActions>
      </Card>
    );
  }
  //<NewUserTableForm open={this.state.open} newRow={this.newRow} onClose={this.handleClose} />
  cleanSelected = () => {
    this.setState({ selectedRows: [] });
  };
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
    let pattern = [
      'string',
      'string|number',
      'string',
      'string|number',
      'string',
      'string|number',
      'number'
    ];
    /** @type {User[]} */
    let batch = [];
    for (let x in data) {
      if (!isEmpty(data[x])) {
        let matchPattern = arrayMatchPattern(data[x], pattern);
        let info = data[x];
        if (matchPattern) {
          if (info[0].toLowerCase().trim() !== 'project')
            batch.push({
              project: info[0],
              sap_id: info[1],
              name: info[2],
              project_code: info[3],
              client: info[4],
              rm_sap_id: info[5],
              badge: info[6]
            });
        }
      }
    }
    if (batch.length > 0) {
      this.updateFromData(batch);
    }
    this.setLoading('upload', false);
  };
  //#endregion
  getSelectedUser() {
    let { selectedRows } = this.state;
    if (this.state.selectedRows.length === 1)
      for (let x in selectedRows) {
        let sap_id = selectedRows[x].getData().sap_id;
        return String(sap_id);
      }
    return 'new';
  }
  setLoading(key, value) {
    let { loading } = this.state;
    loading[key] = value;
    this.setState({ loading });
  }

  rowClick = (e, row) => {
    //e - the click event object
    //row - row component
    let selectedRows = this.ref.table.getSelectedRows();
    this.setState({ selectedRows }, () => {
      this.udaptePage();
      for (let row in this.state.selectedRows) {
        this.ref.table.selectRow(this.state.selectedRows[row].getData().sap_id);
      }
    });
  };
  edit = () => {
    this.setState({ edit: !this.state.edit, selectedRows: [] }, () => {
      this.udaptePage();
    });
  };
  pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }
  openForm = () => {
    if (this.state.selectedRows.length === 1) {
    }
    this.setState({ open: true });
  };
  delete = () => {
    let { rows, pendingUpdate, selectedRows } = this.state;
    let addToDelete = [];
    for (let x in selectedRows) {
      let sap_id = selectedRows[x].getData().sap_id;
      var found = rows.findIndex(element => {
        return element.sap_id === sap_id;
      });
      if (found !== -1) {
        rows.splice(found, 1);
      }
      addToDelete.push({ sap_id: sap_id, [sap_id]: 0 });
    }
    this.setState(
      {
        pendingUpdate: mergeArrays(addToDelete, pendingUpdate, 'sap_id'),
        selectedRows: []
      },
      () => {
        this.udaptePage();
      }
    );
  };
  newRow = data => {
    const { rows, pendingUpdate } = this.state;
    this.setState({
      rows: mergeArrays([data], rows, 'sap_id'),
      pendingUpdate: mergeArrays([data], pendingUpdate, 'sap_id')
    });
    this.handleClose();
  };
  enablePaste = () => {
    this.setState({ paste: !this.state.paste }, () => {
      this.udaptePage();
    });
  };
  paste = data => {
    if (this.state.paste) {
      let rowData = data.split('\n');
      let goodData = [];
      //Here we have to discrimine between  the rows that are actual data and the ones that a are garbage
      for (let x in rowData) {
        let raw = rowData[x].split('\t');
        let [sap_id, name, project, project_code, client, rm_sap_id, badge] = raw;
        let sap_id2 = Number(sap_id);
        let rm_sap_id2 = Number(rm_sap_id);
        let obj = { sap_id, name, project, project_code, client, rm_sap_id, badge };
        if (!isNaN(sap_id2) && sap_id2 !== 0 && rm_sap_id2 !== 0 && !isNaN(rm_sap_id2)) {
          goodData.push(obj);
        }
      }
      this.updateFromData(goodData);
    }
  };
  updateFromData = data => {
    const { rows, pendingUpdate } = this.state;
    this.setState({
      rows: mergeArrays(data, rows, 'sap_id'),
      pendingUpdate: mergeArrays(data, pendingUpdate, 'sap_id')
    });
    this.ref.table.updateOrAddData(data);
    this.paginationRef.forceUpdateRows();
  };
  copyAll = () => {
    this.ref.table.copyToClipboard();
  };
  copySelected = () => {
    this.ref.table.copyToClipboard('selected');
  };
  getData = () => {
    getData('users', 50, this.processQuery);
  };
  processQuery = snapshot => {
    let lastVisible = snapshot.docs[snapshot.docs.length - 1];
    let data = snapshot.docs.map(function(snapshot) {
      return snapshot.data();
    });
    let keys = snapshot.docs.map(function(snapshot) {
      return snapshot.id;
    });
    const { rows } = this.state;
    console.log(rows);
    return new Promise((resolve, reject) => {
      this.setState(
        {
          rows: mergeArrays(data, rows, 'sap_id'),
          keys: mergeArrays(keys, this.state.keys, 'sap_id'),
          allrows: data.length < 50 && !snapshot.metadata.fromCache,
          lastRow: lastVisible !== undefined ? lastVisible : this.state.lastRow
        },
        () => {
          let { rowsPerPage, page } = this.state;
          let maxpage = this.ref.table.getPageMax();
          this.ref.table.setPageSize(rowsPerPage);
          this.ref.table.setPage(page === 0 ? 1 : maxpage >= page ? maxpage : page);
          this.paginationRef.forceUpdateRows();
          resolve();
        }
      );
    });
  };
  getMoreData = () => {
    getMoreData('users', 50, this.processQuery, this.state.lastRow);
  };
  save = () => {
    const { pendingUpdate } = this.state;
    this.setState({ pendingUpdate: [] });

    if (pendingUpdate && pendingUpdate.length > 0) {
      //console.log(pendingUpdate);
      // Get a new write batch
      var batch = db.batch();
      for (let x in pendingUpdate) {
        if (pendingUpdate[x][pendingUpdate[x].sap_id] === 0) {
          // Delete the user
          var deleteRef = db.collection('users').doc(String(pendingUpdate[x].sap_id));
          batch.delete(deleteRef);
        } else {
          var userRef = db.collection('users').doc(String(pendingUpdate[x].sap_id));
          console.log(pendingUpdate[x]);
          pendingUpdate[x].badge = pendingUpdate[x].badge || 'N/A';
          batch.set(userRef, pendingUpdate[x]);
        }
      }
      // Commit the batch
      batch.commit().then(function() {
        // ...
        console.log('succesfull save');
      });
    }
  };
  idAccessor = (value, data, type, params, column) => {
    return String(value);
  };
}
//#region consts
const styles = theme => ({
  root: {
    width: '100%',
    minWidth: '900px',
    align: 'center',
    margin: '0 auto',
    direction: 'ltr',
    display: 'flex',
    flexDirection: 'column'
  },
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
const options = {
  pagination: 'local',
  paginationSize: 5,
  addRowPos: 'bottom',
  clipboard: true,
  index: 'sap_id',
  selectable: true
};
const columns = [
  {
    title: 'Sap ID',
    field: 'sap_id',
    width: 100,
    headerFilter: 'input',
    accessorClipboard: true,
    headerSort: false
  },
  {
    title: 'Name',
    field: 'name',
    width: 150,
    align: 'left',
    headerFilter: 'input',
    accessorClipboard: true
  },
  {
    title: 'Project',
    field: 'project',
    width: 150,
    accessorClipboard: true,
    headerSort: false
  },
  {
    title: 'Project Code',
    field: 'project_code',
    align: 'left',
    width: 130,
    accessorClipboard: true,
    headerSort: false
  },
  {
    title: 'Client',
    field: 'client',
    align: 'left',
    width: 100,
    accessorClipboard: true
  },
  {
    title: 'Rm ID',
    field: 'rm_sap_id',
    align: 'center',
    width: 100,
    accessorClipboard: true,
    headerSort: false
  },
  {
    title: 'Badge ID',
    field: 'badge',
    align: 'center',
    width: 100,
    accessorClipboard: true,
    headerSort: false
  }
];
//#endregion
export default withStyles(styles)(UserProjects);
