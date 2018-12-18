import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Card, CardContent, CardActions } from '@material-ui/core';
import AvChip from './avatarChip';
import { Forward } from '@material-ui/icons';
import { mergeArrays, isEmpty, arrayMatchPattern } from './utils';
import { handleFile, XLSX } from './loadXlsx';
import { process } from './attendance_file_processor';
import 'react-tabulator/lib/css/bootstrap/tabulator_bootstrap.min.css';
import { ReactTabulator } from 'react-tabulator';
import { getData, getDocument } from './fbGetPaginatedData';
import { calc } from './generate_reportv2.js';
/**
 * @typedef {Object} State
 * @property {[]} users
 * @property {Array} rows
 */

class UploadFiles extends React.Component {
  constructor(props) {
    super(props);
    /** @type {State} */
    this.state = {
      open: false,
      loading: { load: false, upload: false, process: false },
      rows: [],
      users: [],
      rawData: {},
      completeSR: [],
      pendingSR: [],
      shifts: []
    };
  }
  ref = null;
  render() {
    const { rows, loading } = this.state;
    const { classes } = this.props;

    return (
      <Card className={classes.root}>
        <CardContent>
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
              hide={rows.length !== 0}
              loading={loading['upload']}
              clickable={true}
            />
          </label>

          {rows.length > 0 && loading['process'] === false ? (
            <ReactTabulator
              ref={ref => (this.ref = ref)}
              columns={this.columns}
              options={options}
              data={rows}
              rowUpdated={this.rowUpdated}
              cellEdited={this.cellEdited}
              footerElement={'#hiddenFooter'}
            />
          ) : null}
          <AvChip
            cAr={['blue', 500, 700]}
            avatar={<Forward style={{ transform: 'rotate(90deg)' }} />}
            label="Build Report file"
            variant="default"
            hide={rows.length === 0}
            loading={loading['process']}
            clickable={true}
            onClick={this.buildReport}
          />
          <div id="hiddenFooter" style={{ visibility: 'hidden', display: 'none' }} />
        </CardContent>
      </Card>
    );
  }

  setLoading(key, value) {
    let { loading } = this.state;
    loading[key] = value;
    this.setState({ loading });
  }
  buildReport = () => {
    this.setLoading('process', true);
    this.getCurrentUserShifts();
  };
  constinueBuildReport = async () => {
    let { rows, rawData, shifts } = this.state;
    let users = rows.filter(user => user.sap_id !== 'N/A');
    let days = rawData['days'];
    calc(users, shifts, days, true);
    this.setLoading('process', false);
  };
  //#region Fetch Shifts
  getCurrentUserShifts = () => {
    let { pendingSR } = this.state;
    let { start, end, sampePeriod } = this.state.rawData.data;
    if (!sampePeriod) {
      this.state.rows.forEach(user => {
        if (user.sap_id !== 'N/A') {
          this.getShifstsData(end.getFullYear(), end.getMonth() + 1, user.sap_id);
          pendingSR.push({
            year: end.getFullYear(),
            month: end.getMonth() + 1,
            user_id: user.sap_id
          });
        }
      });
    }
    this.state.rows.forEach(user => {
      if (user.sap_id !== 'N/A') {
        this.getShifstsData(start.getFullYear(), start.getMonth() + 1, user.sap_id);
        pendingSR.push({
          year: start.getFullYear(),
          month: start.getMonth() + 1,
          user_id: user.sap_id
        });
      }
    });
    this.setState({ pendingSR }, () => {
      this.isAllShiftsComplete();
    });
  };
  /**
   * @param {number} [year]
   * @param {number} [month]
   */
  getShifstsData = (year, month, user_id) => {
    let path = 'wsinf/' + year + '/' + month;
    getDocument(path, String(user_id), this.processShiftQuery, user_id, year, month);
  };
  /**
   * @param {any} snapshot
   * @param {number} year
   * @param {number} month
   * @return {Promise} emty
   */
  processShiftQuery = (document, user_id, year, month) => {
    if (document.data()) {
      let s = document.data().m;
      let user_shifts = [];
      for (let day in s) {
        user_shifts.push({ day: Number(day), year, month, user_id, code: s[day] });
      }
      let { shifts } = this.state;

      shifts = shifts.concat(user_shifts);
      return new Promise(resolve => {
        this.setState({ shifts }, () => {
          this.setCompleteShift(user_id, year, month);
          resolve();
        });
      });
    } else {
      return new Promise(resolve => {
        this.setCompleteShift(user_id, year, month);
        resolve();
      });
    }
  };
  setCompleteShift = (user_id, year, month) => {
    let { completeSR } = this.state;
    completeSR.push({ user_id, year, month });
    this.setState({ completeSR }, () => {
      this.isAllShiftsComplete();
    });
  };
  isAllShiftsComplete = () => {
    let { completeSR, pendingSR } = this.state;
    let complete = true;
    pendingSR.forEach(x => {
      if (
        !completeSR.find(y => {
          return y.year === x.year && y.month === x.month && y.user_id === x.user_id;
        })
      ) {
        complete = false;
      }
    });
    if (complete) {
      this.constinueBuildReport();
    }
  };
  //#endregion

  //#region UploadFile
  loadFile = e => {
    this.setLoading('upload', true);
    handleFile(this.fileCallback)(e);
  };
  fileCallback = wb => {
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
  processData = async data => {
    let d = await process(data);
    console.log(d);
    this.getData();
    this.setState({ rawData: d });
  };
  //#endregion
  displayData = () => {
    let { rawData, users } = this.state;
    let rows = [];
    for (let idx in rawData.users) {
      let badge = rawData.users[idx].badge;
      let user = users.find(x => Number(x.badge) === Number(badge));

      rows.push({
        sap_id: user ? user.sap_id : 'N/A',
        name: user ? user.name : 'N/A',
        file_name: rawData.users[idx].name,
        badge: badge,
        complete: user ? true : false,
        room: rawData.users[idx].room,
        client: user ? user.client : 'N/A',
        project: user ? user.project : 'N/A',
        projectCode: user ? user.project_code : 'N/A',
        rmCode: user ? user.rm_sap_id : 'N/A'
      });
    }

    this.setState({ rows }, () => {
      this.setLoading('upload', false);
    });
  };

  getData = () => {
    getData('users', 50, this.processQuery);
  };

  processQuery = snapshot => {
    let lastVisible = snapshot.docs[snapshot.docs.length - 1];
    let data = snapshot.docs.map(function(snapshot) {
      return snapshot.data();
    });
    const { users } = this.state;

    return new Promise((resolve, reject) => {
      this.setState(
        {
          users: mergeArrays(data, users, 'sap_id'),
          allrows: data.length < 50 && !snapshot.metadata.fromCache,
          lastRow: lastVisible !== undefined ? lastVisible : this.state.lastRow
        },
        () => {
          //let { rowsPerPage, page } = this.state;
          //let maxpage = this.ref.table.getPageMax();
          //this.ref.table.setPageSize(rowsPerPage);
          //this.ref.table.setPage(page === 0 ? 1 : maxpage >= page ? maxpage : page);
          //this.paginationRef.forceUpdateRows();
          this.displayData();
          resolve();
        }
      );
    });
  };

  editCheck = cell => {
    var data = cell.getRow().getData();
    return !data.complete;
  };

  getValues = key => () => {
    let { users } = this.state;
    let u = users.map(user => user[key]);
    return { values: u, showListOnEmpty: true, freetext: false };
  };
  cellEdited = key => cell => {
    let { users, rows } = this.state;
    let user = users.find(u => {
      return u[key] === cell._cell.value;
    });
    if (user) {
      let idx = rows.findIndex(x => x.badge === cell._cell.row.data.badge);
      rows[idx].name = user.name;
      rows[idx].sap_id = user.sap_id;
      rows[idx].client = user.client;
      rows[idx].project = user.project;
      rows[idx].projectCode = user.project_code;
      rows[idx].rmCode = user.rm_sap_id;
      this.setState({ rows });
    }
  };
  columns = [
    {
      title: 'Status',
      field: 'complete',
      align: 'center',
      formatter: 'tickCross',
      width: 100
    },
    {
      title: 'Sap ID',
      field: 'sap_id',
      width: 100,
      headerFilter: 'input',
      editor: 'autocomplete',
      editable: this.editCheck,
      editorParams: this.getValues('sap_id'),
      cellEdited: this.cellEdited('sap_id')
    },
    {
      title: 'Name',
      field: 'name',
      width: 150,
      align: 'left',
      headerFilter: 'input',
      editor: 'autocomplete',
      editable: this.editCheck,
      editorParams: this.getValues('name'),
      cellEdited: this.cellEdited('name')
    },
    {
      title: 'File Name',
      field: 'file_name',
      width: 150,
      align: 'left',
      headerFilter: 'input'
    },
    {
      title: 'Badge ID',
      field: 'badge',
      align: 'center',
      width: 100
    }
  ];
}

const styles = theme => ({
  root: {
    width: '700px',
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
  paginationSize: 100,
  addRowPos: 'bottom',
  clipboard: true,
  index: 'sap_id',
  selectable: true
};
export default withStyles(styles)(UploadFiles);
